import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export interface RepoFile {
  path: string
  content: string
  size: number
}

export async function fetchRepositoryFiles(
  repoUrl: string,
  maxFiles: number = 20,
  maxFileSizeKB: number = 100
): Promise<RepoFile[]> {
  // Parse GitHub URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) {
    throw new Error('Invalid GitHub URL')
  }

  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  try {
    // Get default branch
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo: repoName,
    })

    const defaultBranch = repoData.default_branch

    // Get repository tree
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo: repoName,
      tree_sha: defaultBranch,
      recursive: 'true',
    })

    // Filter and sort files
    const codeFiles = tree.tree
      .filter(item =>
        item.type === 'blob' &&
        isCodeFile(item.path || '') &&
        (item.size || 0) < maxFileSizeKB * 1024
      )
      .sort((a, b) => getFilePriority(b.path || '') - getFilePriority(a.path || ''))
      .slice(0, maxFiles)

    // Fetch file contents
    const files: RepoFile[] = []

    for (const file of codeFiles) {
      if (!file.sha || !file.path) continue

      try {
        const { data: blob } = await octokit.rest.git.getBlob({
          owner,
          repo: repoName,
          file_sha: file.sha,
        })

        const content = Buffer.from(blob.content, 'base64').toString('utf-8')

        files.push({
          path: file.path,
          content,
          size: file.size || 0,
        })
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error)
      }
    }

    return files
  } catch (error) {
    console.error('GitHub fetch error:', error)
    throw new Error('Failed to fetch repository files')
  }
}

function isCodeFile(path: string): boolean {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.md']
  const excludePatterns = [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '.git/',
    'package-lock.json',
    'yarn.lock',
  ]

  // Exclude certain patterns
  if (excludePatterns.some(pattern => path.includes(pattern))) {
    return false
  }

  // Include code files and README
  return codeExtensions.some(ext => path.endsWith(ext)) || path.toLowerCase().includes('readme')
}

function getFilePriority(path: string): number {
  // Prioritize important files
  if (path.toLowerCase().includes('readme')) return 100
  if (path.includes('app/') || path.includes('src/')) return 90
  if (path.includes('lib/') || path.includes('utils/')) return 80
  if (path.includes('components/')) return 70
  if (path.includes('api/')) return 85
  if (path.endsWith('.config.js') || path.endsWith('.config.ts')) return 60
  return 50
}
