// lib/agents/tools.ts
import { Tool } from './types'

// 1. Web Search Tool
const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the web using Tavily API. Returns relevant search results.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      }
    },
    required: ['query']
  },
  execute: async (params) => {
    try {
      const apiKey = process.env.TAVILY_API_KEY
      if (!apiKey) {
        return 'Error: TAVILY_API_KEY not configured'
      }

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: params.query,
          search_depth: 'basic',
          max_results: 5
        })
      })

      if (!response.ok) {
        return `Error: Search API returned ${response.status}`
      }

      const data = await response.json()
      const results = data.results || []

      if (results.length === 0) {
        return 'No search results found'
      }

      return results
        .map((r: any, i: number) => `${i + 1}. ${r.title}\n${r.url}\n${r.content}`)
        .join('\n\n')
    } catch (error) {
      return `Error performing search: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// 2. URL Fetch Tool
const urlFetchTool: Tool = {
  name: 'url_fetch',
  description: 'Fetch and extract text content from a URL',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch'
      }
    },
    required: ['url']
  },
  execute: async (params) => {
    try {
      const response = await fetch(params.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIProductBuilder/1.0)'
        }
      })

      if (!response.ok) {
        return `Error: Failed to fetch URL (${response.status})`
      }

      const html = await response.text()
      // Simple text extraction - remove HTML tags
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000) // Limit to 5000 chars

      return text || 'No text content found'
    } catch (error) {
      return `Error fetching URL: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// 3. Note Taking Tool
const noteTakingTool: Tool = {
  name: 'note_taking',
  description: 'Record notes during execution for later reference',
  parameters: {
    type: 'object',
    properties: {
      note: {
        type: 'string',
        description: 'The note to record'
      },
      category: {
        type: 'string',
        description: 'Category of the note',
        enum: ['observation', 'decision', 'question', 'finding']
      }
    },
    required: ['note', 'category']
  },
  execute: async (params) => {
    // In a real implementation, this would store to a database
    // For now, just return confirmation
    return `Note recorded [${params.category}]: ${params.note}`
  }
}

// 4. File Read Tool
const fileReadTool: Tool = {
  name: 'file_read',
  description: 'Read file contents from a GitHub repository',
  parameters: {
    type: 'object',
    properties: {
      owner: {
        type: 'string',
        description: 'Repository owner'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      },
      path: {
        type: 'string',
        description: 'File path in the repository'
      },
      ref: {
        type: 'string',
        description: 'Branch, tag, or commit SHA (optional, defaults to main)'
      }
    },
    required: ['owner', 'repo', 'path']
  },
  execute: async (params) => {
    try {
      const token = process.env.GITHUB_TOKEN
      if (!token) {
        return 'Error: GITHUB_TOKEN not configured'
      }

      const { Octokit } = await import('octokit')
      const octokit = new Octokit({ auth: token })

      const { data } = await octokit.rest.repos.getContent({
        owner: params.owner,
        repo: params.repo,
        path: params.path,
        ref: params.ref || 'main'
      })

      if (Array.isArray(data)) {
        return 'Error: Path is a directory, not a file'
      }

      if (data.type !== 'file') {
        return 'Error: Path is not a file'
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      return content
    } catch (error) {
      return `Error reading file: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// 5. AST Parse Tool
const astParseTool: Tool = {
  name: 'ast_parse',
  description: 'Analyze code structure and extract information (simplified)',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'The code to analyze'
      },
      language: {
        type: 'string',
        description: 'Programming language',
        enum: ['javascript', 'typescript', 'python', 'java']
      }
    },
    required: ['code', 'language']
  },
  execute: async (params) => {
    try {
      // Simplified AST analysis - extract basic patterns
      const code = params.code
      const analysis: string[] = []

      // Count functions
      const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|def\s+\w+/g)
      if (functionMatches) {
        analysis.push(`Functions found: ${functionMatches.length}`)
        analysis.push(`Function names: ${functionMatches.map((m: string) => m.split(/\s+/)[1]).join(', ')}`)
      }

      // Count classes
      const classMatches = code.match(/class\s+\w+/g)
      if (classMatches) {
        analysis.push(`Classes found: ${classMatches.length}`)
        analysis.push(`Class names: ${classMatches.map((m: string) => m.split(/\s+/)[1]).join(', ')}`)
      }

      // Count imports
      const importMatches = code.match(/import\s+.*from|from\s+\w+\s+import/g)
      if (importMatches) {
        analysis.push(`Import statements: ${importMatches.length}`)
      }

      return analysis.length > 0 ? analysis.join('\n') : 'No significant code structures found'
    } catch (error) {
      return `Error analyzing code: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// 6. Security Scan Tool
const securityScanTool: Tool = {
  name: 'security_scan',
  description: 'Scan code for common security vulnerabilities',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'The code to scan'
      }
    },
    required: ['code']
  },
  execute: async (params) => {
    const vulnerabilities: string[] = []
    const code = params.code

    // Check for common security issues
    if (code.includes('eval(')) {
      vulnerabilities.push('⚠️ Found eval() - potential code injection risk')
    }
    if (code.match(/innerHTML\s*=/)) {
      vulnerabilities.push('⚠️ Found innerHTML assignment - potential XSS risk')
    }
    if (code.match(/exec\(|system\(/)) {
      vulnerabilities.push('⚠️ Found system command execution - potential command injection risk')
    }
    if (code.match(/password\s*=\s*["'][^"']+["']|api_key\s*=\s*["'][^"']+["']/i)) {
      vulnerabilities.push('⚠️ Found hardcoded credentials - security risk')
    }
    if (code.match(/md5|sha1/i)) {
      vulnerabilities.push('⚠️ Found weak hashing algorithm (MD5/SHA1)')
    }

    return vulnerabilities.length > 0
      ? `Security issues found:\n${vulnerabilities.join('\n')}`
      : 'No obvious security vulnerabilities detected'
  }
}

// 7. Knowledge Base Search Tool
const kbSearchTool: Tool = {
  name: 'kb_search',
  description: 'Search knowledge base for relevant documentation and guides',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      }
    },
    required: ['query']
  },
  execute: async (params) => {
    // Mock knowledge base data
    const mockKB = [
      {
        title: 'Authentication Best Practices',
        content: 'Always use secure password hashing (bcrypt, argon2), implement rate limiting, use HTTPS...',
        tags: ['security', 'auth', 'password']
      },
      {
        title: 'API Design Guidelines',
        content: 'RESTful principles, proper HTTP methods, versioning, error handling...',
        tags: ['api', 'rest', 'design']
      },
      {
        title: 'Database Optimization',
        content: 'Use indexes, normalize data, connection pooling, query optimization...',
        tags: ['database', 'performance', 'sql']
      }
    ]

    const query = params.query.toLowerCase()
    const results = mockKB.filter(
      kb => kb.title.toLowerCase().includes(query) ||
            kb.content.toLowerCase().includes(query) ||
            kb.tags.some(tag => tag.includes(query))
    )

    if (results.length === 0) {
      return 'No knowledge base articles found for this query'
    }

    return results
      .map((r, i) => `${i + 1}. ${r.title}\n${r.content}\nTags: ${r.tags.join(', ')}`)
      .join('\n\n')
  }
}

// 8. Ticket Create Tool
const ticketCreateTool: Tool = {
  name: 'ticket_create',
  description: 'Create a support ticket for tracking issues or requests',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Ticket title'
      },
      description: {
        type: 'string',
        description: 'Detailed description'
      },
      priority: {
        type: 'string',
        description: 'Ticket priority',
        enum: ['low', 'medium', 'high', 'urgent']
      }
    },
    required: ['title', 'description', 'priority']
  },
  execute: async (params) => {
    // Mock ticket creation
    const ticketId = `TICKET-${Date.now()}`
    return `Ticket created successfully:
ID: ${ticketId}
Title: ${params.title}
Priority: ${params.priority}
Description: ${params.description}
Status: Open`
  }
}

// 9. Human Escalate Tool
const humanEscalateTool: Tool = {
  name: 'human_escalate',
  description: 'Escalate to a human agent for complex issues requiring human judgment',
  parameters: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Reason for escalation'
      },
      context: {
        type: 'string',
        description: 'Relevant context and information'
      }
    },
    required: ['reason', 'context']
  },
  execute: async (params) => {
    return `ESCALATED TO HUMAN AGENT
Reason: ${params.reason}
Context: ${params.context}

A human agent has been notified and will review this case.`
  }
}

// Tool Registry
export const TOOL_REGISTRY: Record<string, Tool> = {
  web_search: webSearchTool,
  url_fetch: urlFetchTool,
  note_taking: noteTakingTool,
  file_read: fileReadTool,
  ast_parse: astParseTool,
  security_scan: securityScanTool,
  kb_search: kbSearchTool,
  ticket_create: ticketCreateTool,
  human_escalate: humanEscalateTool
}

// Helper function to get tools by name
export function getTools(toolNames: string[]): Tool[] {
  return toolNames
    .map(name => TOOL_REGISTRY[name])
    .filter((tool): tool is Tool => tool !== undefined)
}
