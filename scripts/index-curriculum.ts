/**
 * Curriculum Content Indexing Script
 *
 * Indexes all MDX curriculum content into the database with vector embeddings
 * for AI-powered search in the Mentor.
 *
 * Usage:
 *   npx tsx scripts/index-curriculum.ts
 *   npx tsx scripts/index-curriculum.ts --reindex  # Force reindex all content
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'
import matter from 'gray-matter'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ContentFile {
  filePath: string
  weekNumber: number | null
  slug: string
  title: string
  type: 'lesson' | 'lab' | 'project' | 'code-example'
  content: string
  metadata: any
}

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const CHUNK_SIZE = 1000 // Characters per chunk
const CHUNK_OVERLAP = 200 // Overlap between chunks

async function getAllMDXFiles(dir: string, weekNumber: number | null = null): Promise<ContentFile[]> {
  const files: ContentFile[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Extract week number from directory name like "week1", "week12"
      const weekMatch = entry.name.match(/^week(\d+)$/)
      const newWeekNumber = weekMatch ? parseInt(weekMatch[1]) : weekNumber

      // Recursively process subdirectories
      const subFiles = await getAllMDXFiles(fullPath, newWeekNumber)
      files.push(...subFiles)
    } else if (entry.name.endsWith('.mdx')) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        const { data: frontmatter, content: markdown } = matter(content)

        // Determine type from metadata or path
        let type: 'lesson' | 'lab' | 'project' | 'code-example' = 'lesson'
        if (fullPath.includes('lab')) type = 'lab'
        else if (fullPath.includes('project')) type = 'project'
        else if (fullPath.includes('example')) type = 'code-example'

        // Generate slug from filename
        const slug = entry.name.replace(/\.mdx$/, '')

        const file: ContentFile = {
          filePath: path.relative(path.join(__dirname, '..'), fullPath),
          weekNumber,
          slug,
          title: frontmatter.title || slug.replace(/-/g, ' '),
          type,
          content: markdown,
          metadata: frontmatter,
        }

        files.push(file)
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error)
      }
    }
  }

  return files
}

function chunkContent(content: string, maxChunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < content.length) {
    const end = Math.min(start + maxChunkSize, content.length)
    const chunk = content.slice(start, end)
    chunks.push(chunk)

    // Move start position with overlap
    start = end - overlap
  }

  return chunks
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

async function indexFile(file: ContentFile, forceReindex: boolean = false): Promise<void> {
  console.log(`Indexing: ${file.title} (${file.filePath})`)

  // Check if already indexed recently (unless force reindex)
  if (!forceReindex) {
    const existing = await prisma.curriculumContent.findFirst({
      where: { filePath: file.filePath },
    })

    if (existing) {
      const hoursSinceIndex = (Date.now() - existing.lastIndexed.getTime()) / (1000 * 60 * 60)
      if (hoursSinceIndex < 24) {
        console.log(`  ⏭️  Skipping (indexed ${Math.round(hoursSinceIndex)}h ago)`)
        return
      }
    }
  }

  // Create or update content record
  const contentRecord = await prisma.curriculumContent.upsert({
    where: {
      userId_slug: {
        userId: null as any, // System content has no userId
        slug: `${file.weekNumber ? `week${file.weekNumber}-` : ''}${file.slug}`,
      },
    },
    create: {
      filePath: file.filePath,
      weekNumber: file.weekNumber,
      title: file.title,
      type: file.type,
      slug: `${file.weekNumber ? `week${file.weekNumber}-` : ''}${file.slug}`,
      metadata: file.metadata as any,
      lastIndexed: new Date(),
    },
    update: {
      filePath: file.filePath,
      weekNumber: file.weekNumber,
      title: file.title,
      type: file.type,
      metadata: file.metadata as any,
      lastIndexed: new Date(),
    },
  })

  // Delete existing chunks
  await prisma.curriculumChunk.deleteMany({
    where: { contentId: contentRecord.id },
  })

  // Split content into chunks
  const chunks = chunkContent(file.content)
  console.log(`  📄 Created ${chunks.length} chunks`)

  // Generate embeddings and store chunks
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    // Extract heading if this chunk starts with one
    const headingMatch = chunk.match(/^#+\s+(.+)$/m)
    const heading = headingMatch ? headingMatch[1] : null

    // Check if this chunk is primarily code
    const codeBlockCount = (chunk.match(/```/g) || []).length
    const isCodeBlock = codeBlockCount >= 2

    console.log(`  🔮 Generating embedding for chunk ${i + 1}/${chunks.length}`)
    const embedding = await generateEmbedding(chunk)

    await prisma.curriculumChunk.create({
      data: {
        contentId: contentRecord.id,
        content: chunk,
        embedding: `[${embedding.join(',')}]` as any,
        chunkIndex: i,
        heading,
        codeBlock: isCodeBlock,
        metadata: {
          wordCount: chunk.split(/\s+/).length,
          hasCode: isCodeBlock,
        },
      },
    })

    // Rate limiting to avoid OpenAI API limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`  ✅ Indexed successfully`)
}

async function main() {
  const args = process.argv.slice(2)
  const forceReindex = args.includes('--reindex')

  console.log('🚀 Starting curriculum content indexing...')
  console.log(`📁 Content directory: ${CONTENT_DIR}`)
  console.log(`🔄 Force reindex: ${forceReindex ? 'YES' : 'NO'}`)
  console.log()

  // Get all MDX files
  const files = await getAllMDXFiles(CONTENT_DIR)
  console.log(`📚 Found ${files.length} MDX files`)
  console.log()

  // Index each file
  for (let i = 0; i < files.length; i++) {
    console.log(`[${i + 1}/${files.length}]`)
    await indexFile(files[i], forceReindex)
    console.log()
  }

  console.log('✅ Indexing complete!')
  console.log()

  // Summary
  const totalContent = await prisma.curriculumContent.count()
  const totalChunks = await prisma.curriculumChunk.count()
  console.log('📊 Summary:')
  console.log(`  Content items: ${totalContent}`)
  console.log(`  Total chunks: ${totalChunks}`)
  console.log(`  Avg chunks per item: ${(totalChunks / totalContent).toFixed(1)}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
