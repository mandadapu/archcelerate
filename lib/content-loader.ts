import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { SprintMetadata, ConceptMetadata, ConceptContent } from '@/types/learning'

const CONTENT_DIR = path.join(process.cwd(), 'content')

/** Validate that a path segment contains only safe characters (alphanumeric, hyphens, underscores) */
const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/
function isValidPathSegment(segment: string): boolean {
  return SAFE_PATH_SEGMENT.test(segment)
}

/** Construct a safe path within CONTENT_DIR, rejecting path traversal */
function safePath(...segments: string[]): string | null {
  for (const seg of segments) {
    if (!isValidPathSegment(seg)) return null
  }
  const resolved = path.resolve(CONTENT_DIR, ...segments)
  if (!resolved.startsWith(CONTENT_DIR + path.sep)) return null
  return resolved
}

/**
 * Get all available sprints
 */
export async function getAllSprints(): Promise<SprintMetadata[]> {
  const sprintsDir = path.join(CONTENT_DIR, 'sprints')

  if (!fs.existsSync(sprintsDir)) {
    return []
  }

  const sprintDirs = fs.readdirSync(sprintsDir).filter(dir => {
    const fullPath = path.join(sprintsDir, dir)
    return fs.statSync(fullPath).isDirectory()
  })

  const sprints: SprintMetadata[] = []

  for (const dir of sprintDirs) {
    const metadataPath = path.join(sprintsDir, dir, 'metadata.json')

    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      sprints.push(metadata)
    }
  }

  return sprints.sort((a, b) => a.order - b.order)
}

/**
 * Get a specific sprint by ID
 */
export async function getSprintById(sprintId: string): Promise<SprintMetadata | null> {
  const metadataPath = safePath('sprints', sprintId, 'metadata.json')
  if (!metadataPath) return null

  if (!fs.existsSync(metadataPath)) {
    return null
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
  return metadata
}

/**
 * Get all concepts for a sprint
 */
export async function getSprintConcepts(sprintId: string): Promise<ConceptMetadata[]> {
  const sprint = await getSprintById(sprintId)

  if (!sprint) {
    return []
  }

  return sprint.concepts.sort((a, b) => a.order - b.order)
}

/**
 * Get concept content with MDX source
 */
export async function getConceptContent(
  sprintId: string,
  conceptId: string
): Promise<ConceptContent | null> {
  const conceptPath = safePath('sprints', sprintId, 'concepts', `${conceptId}.mdx`)
  if (!conceptPath) return null

  if (!fs.existsSync(conceptPath)) {
    return null
  }

  const fileContents = fs.readFileSync(conceptPath, 'utf-8')
  const { data, content } = matter(fileContents)

  const metadata: ConceptMetadata = {
    id: data.id || conceptId,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty || 'beginner',
    estimatedMinutes: data.estimatedMinutes || 30,
    order: data.order || 0,
    prerequisites: data.prerequisites || [],
    tags: data.tags || [],
  }

  return {
    metadata,
    content,
  }
}

/**
 * Get next concept in the sprint
 */
export async function getNextConcept(
  sprintId: string,
  currentConceptId: string
): Promise<ConceptMetadata | null> {
  const concepts = await getSprintConcepts(sprintId)
  const currentIndex = concepts.findIndex(c => c.id === currentConceptId)

  if (currentIndex === -1 || currentIndex === concepts.length - 1) {
    return null
  }

  return concepts[currentIndex + 1]
}

/**
 * Get previous concept in the sprint
 */
export async function getPreviousConcept(
  sprintId: string,
  currentConceptId: string
): Promise<ConceptMetadata | null> {
  const concepts = await getSprintConcepts(sprintId)
  const currentIndex = concepts.findIndex(c => c.id === currentConceptId)

  if (currentIndex <= 0) {
    return null
  }

  return concepts[currentIndex - 1]
}

/**
 * Check if concept exists
 */
export async function conceptExists(
  sprintId: string,
  conceptId: string
): Promise<boolean> {
  const conceptPath = safePath('sprints', sprintId, 'concepts', `${conceptId}.mdx`)
  if (!conceptPath) return false

  return fs.existsSync(conceptPath)
}

/**
 * Get concept by ID from sprint metadata
 */
export async function getConceptMetadata(
  sprintId: string,
  conceptId: string
): Promise<ConceptMetadata | null> {
  const concepts = await getSprintConcepts(sprintId)
  return concepts.find(c => c.id === conceptId) || null
}
