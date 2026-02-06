import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const prisma = new PrismaClient()

interface FileSystemContent {
  week: number
  type: 'concept' | 'lab' | 'project'
  filePath: string
  fileName: string
  slug: string
}

interface ValidationResult {
  filesystemOnly: FileSystemContent[]
  databaseOnly: { week: number; type: string; title: string; slug: string }[]
  matched: number
  totalFiles: number
  totalDbRecords: number
}

/**
 * Scans filesystem for all MDX content files
 */
async function scanFilesystem(): Promise<FileSystemContent[]> {
  const contentDir = path.join(process.cwd(), 'content')
  const files: FileSystemContent[] = []

  // Find all MDX files in content/week* directories
  const mdxFiles = await glob('week*/**.mdx', { cwd: contentDir })

  for (const file of mdxFiles) {
    const weekMatch = file.match(/week(\d+)/)
    if (!weekMatch) continue

    const weekNumber = parseInt(weekMatch[1])
    const fileName = path.basename(file, '.mdx')
    const filePath = `content/${file}`

    // Determine type based on filename
    let type: 'concept' | 'lab' | 'project'
    let slug: string

    if (fileName.startsWith('lab-') || file.includes('/lab-')) {
      type = 'lab'
      slug = fileName.replace(/^lab-/, '')
    } else if (fileName.startsWith('project-') || file.includes('/project-')) {
      type = 'project'
      slug = fileName.replace(/^project-/, '')
    } else {
      type = 'concept'
      slug = fileName
    }

    files.push({ week: weekNumber, type, filePath, fileName, slug })
  }

  return files.sort((a, b) => a.week - b.week || a.filePath.localeCompare(b.filePath))
}

/**
 * Fetches all content records from database
 */
async function scanDatabase() {
  const [concepts, labs, projects] = await Promise.all([
    prisma.concept.findMany({
      include: { week: { select: { weekNumber: true } } },
      orderBy: [{ week: { weekNumber: 'asc' } }, { orderIndex: 'asc' }]
    }),
    prisma.lab.findMany({
      include: { week: { select: { weekNumber: true } } },
      orderBy: { week: { weekNumber: 'asc' } }
    }),
    prisma.weekProject.findMany({
      include: { week: { select: { weekNumber: true } } },
      orderBy: { week: { weekNumber: 'asc' } }
    })
  ])

  return {
    concepts: concepts.map(c => ({
      week: c.week.weekNumber,
      type: 'concept' as const,
      title: c.title,
      slug: c.slug,
      contentPath: c.contentPath
    })),
    labs: labs.map(l => ({
      week: l.week.weekNumber,
      type: 'lab' as const,
      title: l.title,
      slug: l.slug,
      contentPath: `content/week${l.week.weekNumber}/lab-${l.slug}.mdx`
    })),
    projects: projects.map(p => ({
      week: p.week.weekNumber,
      type: 'project' as const,
      title: p.title,
      slug: p.slug,
      contentPath: `content/week${p.week.weekNumber}/project-${p.slug}.mdx`
    }))
  }
}

/**
 * Compares filesystem and database to find mismatches
 */
export async function validateContentSync(options: { failOnMismatch?: boolean } = {}): Promise<ValidationResult> {
  console.log('\n🔍 Validating content sync between filesystem and database...\n')

  const filesystemFiles = await scanFilesystem()
  const dbRecords = await scanDatabase()

  // Flatten database records
  const allDbRecords = [...dbRecords.concepts, ...dbRecords.labs, ...dbRecords.projects]

  // Find files that exist in filesystem but not in database
  const filesystemOnly: FileSystemContent[] = []
  const matched: string[] = []

  for (const file of filesystemFiles) {
    const dbRecord = allDbRecords.find(
      db => db.week === file.week && db.type === file.type && db.slug === file.slug
    )

    if (dbRecord) {
      matched.push(file.filePath)
    } else {
      filesystemOnly.push(file)
    }
  }

  // Find records that exist in database but not in filesystem
  const databaseOnly = allDbRecords.filter(db => {
    return !filesystemFiles.some(
      file => file.week === db.week && file.type === db.type && file.slug === db.slug
    )
  })

  const result: ValidationResult = {
    filesystemOnly,
    databaseOnly,
    matched: matched.length,
    totalFiles: filesystemFiles.length,
    totalDbRecords: allDbRecords.length
  }

  // Print results
  console.log('📊 Validation Results:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✓ Matched:           ${result.matched}`)
  console.log(`📁 Total files:      ${result.totalFiles}`)
  console.log(`💾 Total DB records: ${result.totalDbRecords}`)
  console.log(`⚠️  Files only:       ${result.filesystemOnly.length}`)
  console.log(`⚠️  DB only:          ${result.databaseOnly.length}`)
  console.log()

  if (filesystemOnly.length > 0) {
    console.log('❌ Files in filesystem but NOT in database:\n')
    filesystemOnly.forEach(file => {
      console.log(`  Week ${file.week} [${file.type.toUpperCase()}]: ${file.fileName}`)
      console.log(`    Path: ${file.filePath}`)
      console.log(`    Expected slug: ${file.slug}\n`)
    })
  }

  if (databaseOnly.length > 0) {
    console.log('❌ Records in database but NOT in filesystem:\n')
    databaseOnly.forEach(record => {
      console.log(`  Week ${record.week} [${record.type.toUpperCase()}]: ${record.title}`)
      console.log(`    Slug: ${record.slug}`)
      console.log(`    Expected path: ${record.contentPath}\n`)
    })
  }

  if (filesystemOnly.length === 0 && databaseOnly.length === 0) {
    console.log('✅ Perfect sync! All files and database records match.\n')
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`⚠️  Found ${filesystemOnly.length + databaseOnly.length} mismatches!\n`)

    if (options.failOnMismatch) {
      throw new Error(
        `Content validation failed: ${filesystemOnly.length} files missing from DB, ${databaseOnly.length} DB records missing files`
      )
    }
  }

  return result
}

/**
 * Standalone validation script
 */
async function main() {
  try {
    await validateContentSync({ failOnMismatch: process.env.FAIL_ON_MISMATCH === 'true' })
  } catch (error) {
    console.error('Validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
