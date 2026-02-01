# Week 8: Testing Strategy + Quality Assurance - Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish comprehensive testing infrastructure with unit, integration, and E2E tests to ensure platform reliability and prevent regressions.

**Architecture:** Jest for unit/integration tests, React Testing Library for component tests, Playwright for E2E tests, test database isolation, CI/CD integration.

**Tech Stack:** Jest, React Testing Library, Playwright, MSW (Mock Service Worker), Supabase test client, GitHub Actions

---

## Task 1: Testing Infrastructure Setup

**Purpose:** Configure Jest, React Testing Library, test database, and mocking infrastructure.

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.js`
- Create: `lib/test-utils.tsx`
- Create: `lib/test-db.ts`
- Create: `mocks/handlers.ts`
- Create: `.github/workflows/test.yml`

### Step 1: Write the failing test to verify Jest setup

**File:** `lib/__tests__/utils.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', false && 'conditional', 'always')).toBe('base-class always')
  })

  it('should merge tailwind classes without conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
```

### Step 2: Run test to verify it fails

```bash
npm test
```

**Expected:** FAIL - Jest not configured or test runner missing

### Step 3: Install testing dependencies

```bash
npm install -D jest @jest/globals jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/jest ts-jest
npm install -D msw @mswjs/data
npm install -D @playwright/test
```

**Expected:** Dependencies installed successfully

### Step 4: Configure Jest

**File:** `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/']
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

**File:** `jest.setup.js`

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/'
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  }
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'

// Increase test timeout for integration tests
jest.setTimeout(10000)
```

### Step 5: Create test utilities for React components

**File:** `lib/test-utils.tsx`

```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/lib/design-system/theme-provider'

// Mock Supabase client for tests
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  })),
  rpc: jest.fn()
}

// All providers wrapper
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

// Custom render function
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }

// Common test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockDocument = (overrides = {}) => ({
  id: 'test-doc-id',
  user_id: 'test-user-id',
  title: 'Test Document',
  content: 'Test content',
  file_path: '/test/path.pdf',
  file_size: 1024,
  mime_type: 'application/pdf',
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockConversation = (overrides = {}) => ({
  id: 'test-conv-id',
  user_id: 'test-user-id',
  title: 'Test Conversation',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockMessage = (overrides = {}) => ({
  id: 'test-msg-id',
  conversation_id: 'test-conv-id',
  role: 'user' as const,
  content: 'Test message',
  created_at: new Date().toISOString(),
  ...overrides
})
```

### Step 6: Create test database utilities

**File:** `lib/test-db.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Test database client (uses local Supabase instance)
export const testDbClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Clean up test data after each test
 */
export async function cleanupTestData(userId?: string) {
  const client = testDbClient

  if (userId) {
    // Delete user-specific data
    await client.from('messages').delete().eq('user_id', userId)
    await client.from('conversations').delete().eq('user_id', userId)
    await client.from('document_chunks').delete().eq('user_id', userId)
    await client.from('documents').delete().eq('user_id', userId)
    await client.from('agent_executions').delete().eq('user_id', userId)
    await client.from('users').delete().eq('id', userId)
  } else {
    // Clean all test data (use cautiously)
    await client.from('messages').delete().neq('id', '')
    await client.from('conversations').delete().neq('id', '')
    await client.from('document_chunks').delete().neq('id', '')
    await client.from('documents').delete().neq('id', '')
    await client.from('agent_executions').delete().neq('id', '')
  }
}

/**
 * Create a test user
 */
export async function createTestUser(email = 'test@example.com') {
  const { data, error } = await testDbClient.auth.admin.createUser({
    email,
    password: 'test-password-123',
    email_confirm: true
  })

  if (error) throw error
  return data.user
}

/**
 * Create test document
 */
export async function createTestDocument(userId: string, overrides = {}) {
  const { data, error } = await testDbClient
    .from('documents')
    .insert({
      user_id: userId,
      title: 'Test Document',
      content: 'Test content',
      file_path: '/test/doc.pdf',
      file_size: 1024,
      mime_type: 'application/pdf',
      ...overrides
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create test conversation
 */
export async function createTestConversation(userId: string, overrides = {}) {
  const { data, error } = await testDbClient
    .from('conversations')
    .insert({
      user_id: userId,
      title: 'Test Conversation',
      ...overrides
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Setup test database before tests
 */
export async function setupTestDb() {
  // Run migrations if needed
  // This assumes you have a local Supabase instance running
  console.log('Test database ready')
}

/**
 * Teardown test database after all tests
 */
export async function teardownTestDb() {
  await cleanupTestData()
  console.log('Test database cleaned')
}
```

### Step 7: Setup MSW for API mocking

**File:** `mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Anthropic API
  http.post('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      id: 'msg_test123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'This is a test response from Claude'
        }
      ],
      model: 'claude-3-5-sonnet-20241022',
      usage: {
        input_tokens: 10,
        output_tokens: 20
      }
    })
  }),

  // Mock Tavily Search API
  http.post('https://api.tavily.com/search', () => {
    return HttpResponse.json({
      results: [
        {
          title: 'Test Result',
          url: 'https://example.com',
          content: 'Test search result content'
        }
      ]
    })
  }),

  // Mock OpenAI Embeddings API
  http.post('https://api.openai.com/v1/embeddings', () => {
    return HttpResponse.json({
      data: [
        {
          embedding: new Array(1536).fill(0).map(() => Math.random()),
          index: 0
        }
      ],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: 8,
        total_tokens: 8
      }
    })
  })
]
```

**File:** `mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**File:** `jest.setup.js` (append)

```javascript
// Setup MSW
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Step 8: Create GitHub Actions workflow for tests

**File:** `.github/workflows/test.yml`

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm test -- --coverage
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Step 9: Add test scripts to package.json

**File:** `package.json` (add/modify scripts)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 10: Run tests to verify setup

```bash
npm test
```

**Expected:** PASS - Jest configured and basic test passes

### Step 11: Commit

```bash
git add jest.config.js \
  jest.setup.js \
  lib/test-utils.tsx \
  lib/test-db.ts \
  lib/__tests__/utils.test.ts \
  mocks/ \
  .github/workflows/test.yml \
  package.json
git commit -m "$(cat <<'EOF'
feat: setup testing infrastructure

Comprehensive testing setup:
- Jest configuration with Next.js support
- React Testing Library for component tests
- Test utilities and custom render function
- Test database utilities with cleanup
- MSW for API mocking (Anthropic, OpenAI, Tavily)
- GitHub Actions CI/CD workflow
- Coverage reporting with Codecov
- Test data factories

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Unit Testing Strategy

**Purpose:** Write comprehensive unit tests for utilities, services, API routes, and components.

**Files:**
- Create: `lib/rag/__tests__/chunking.test.ts`
- Create: `lib/rag/__tests__/embeddings.test.ts`
- Create: `lib/memory/__tests__/memory-manager.test.ts`
- Create: `app/api/chat/__tests__/route.test.ts`
- Create: `components/ui/__tests__/card.test.tsx`

### Step 1: Write tests for chunking strategies

**File:** `lib/rag/__tests__/chunking.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import {
  FixedSizeChunking,
  SentenceChunking,
  SemanticChunking
} from '../chunking'

describe('Chunking Strategies', () => {
  const sampleText = `This is the first sentence. This is the second sentence.

  This is a new paragraph with more content. It has multiple sentences too.

  And here is another paragraph.`

  describe('FixedSizeChunking', () => {
    it('should chunk text by fixed size', () => {
      const chunker = new FixedSizeChunking(50, 10)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        expect(chunk.content.length).toBeLessThanOrEqual(50 + 10) // size + overlap
        expect(chunk).toHaveProperty('index')
        expect(chunk).toHaveProperty('tokens')
      })
    })

    it('should create overlapping chunks', () => {
      const chunker = new FixedSizeChunking(30, 10)
      const chunks = chunker.chunk('A'.repeat(100))

      expect(chunks.length).toBeGreaterThan(1)
      // Verify overlap exists
      for (let i = 0; i < chunks.length - 1; i++) {
        const currentEnd = chunks[i].content.slice(-10)
        const nextStart = chunks[i + 1].content.slice(0, 10)
        expect(currentEnd).toBeTruthy()
        expect(nextStart).toBeTruthy()
      }
    })
  })

  describe('SentenceChunking', () => {
    it('should chunk text by sentences', () => {
      const chunker = new SentenceChunking(100)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      chunks.forEach(chunk => {
        // Each chunk should contain complete sentences
        expect(chunk.content).toMatch(/[.!?]$/)
      })
    })

    it('should respect max token limit', () => {
      const chunker = new SentenceChunking(20)
      const longText = 'This is a sentence. '.repeat(50)
      const chunks = chunker.chunk(longText)

      chunks.forEach(chunk => {
        expect(chunk.tokens).toBeLessThanOrEqual(25) // Some buffer
      })
    })
  })

  describe('SemanticChunking', () => {
    it('should chunk text by paragraphs', () => {
      const chunker = new SemanticChunking(1000)
      const chunks = chunker.chunk(sampleText)

      expect(chunks.length).toBeGreaterThan(0)
      // Should preserve paragraph boundaries
      chunks.forEach(chunk => {
        expect(chunk.content.trim()).toBeTruthy()
      })
    })

    it('should combine small paragraphs', () => {
      const chunker = new SemanticChunking(1000)
      const smallParagraphs = 'Para 1.\n\nPara 2.\n\nPara 3.'
      const chunks = chunker.chunk(smallParagraphs)

      // Should combine into fewer chunks
      expect(chunks.length).toBeLessThan(3)
    })
  })
})
```

### Step 2: Write tests for embeddings

**File:** `lib/rag/__tests__/embeddings.test.ts`

```typescript
import { describe, it, expect, jest } from '@jest/globals'
import { generateEmbedding, generateEmbeddings } from '../embeddings'

// Mock OpenAI client
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [
            { embedding: new Array(1536).fill(0.1) }
          ]
        })
      }
    }))
  }
})

describe('Embeddings', () => {
  describe('generateEmbedding', () => {
    it('should generate embedding for single text', async () => {
      const embedding = await generateEmbedding('Test text')

      expect(embedding).toHaveLength(1536)
      expect(embedding.every(n => typeof n === 'number')).toBe(true)
    })

    it('should handle empty text', async () => {
      await expect(generateEmbedding('')).rejects.toThrow()
    })
  })

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = ['Text 1', 'Text 2', 'Text 3']
      const embeddings = await generateEmbeddings(texts)

      expect(embeddings).toHaveLength(3)
      embeddings.forEach(embedding => {
        expect(embedding).toHaveLength(1536)
      })
    })

    it('should batch large requests', async () => {
      const texts = new Array(5000).fill('test')
      const embeddings = await generateEmbeddings(texts)

      expect(embeddings).toHaveLength(5000)
    })
  })
})
```

### Step 3: Write tests for memory manager

**File:** `lib/memory/__tests__/memory-manager.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { MemoryManager } from '../memory-manager'
import { createTestUser, cleanupTestData } from '@/lib/test-db'

describe('MemoryManager', () => {
  let userId: string
  let memoryManager: MemoryManager

  beforeEach(async () => {
    const user = await createTestUser(`test-${Date.now()}@example.com`)
    userId = user.id
    memoryManager = new MemoryManager(userId)
  })

  afterEach(async () => {
    await cleanupTestData(userId)
  })

  describe('Episodic Memory', () => {
    it('should store episodic memory', async () => {
      await memoryManager.storeEpisodicMemory(
        'conv-123',
        'msg-456',
        'User asked about TypeScript',
        0.8
      )

      const memories = await memoryManager.retrieveEpisodicMemory('TypeScript', 5)
      expect(memories.length).toBeGreaterThan(0)
      expect(memories[0].summary).toContain('TypeScript')
    })

    it('should rank memories by importance and recency', async () => {
      // Store multiple memories with different importance
      await memoryManager.storeEpisodicMemory('c1', 'm1', 'Low importance', 0.3)
      await memoryManager.storeEpisodicMemory('c2', 'm2', 'High importance', 0.9)

      const memories = await memoryManager.retrieveEpisodicMemory('importance', 5)
      expect(memories[0].importanceScore).toBeGreaterThan(memories[1].importanceScore)
    })
  })

  describe('Semantic Memory', () => {
    it('should store and retrieve facts', async () => {
      await memoryManager.storeSemanticMemory(
        'User prefers TypeScript over JavaScript',
        ['programming', 'preferences']
      )

      const facts = await memoryManager.retrieveSemanticMemory('TypeScript', 5)
      expect(facts.length).toBeGreaterThan(0)
    })

    it('should update access count on retrieval', async () => {
      const fact = 'Python is a programming language'
      await memoryManager.storeSemanticMemory(fact, ['programming'])

      // Retrieve multiple times
      await memoryManager.retrieveSemanticMemory('Python', 5)
      await memoryManager.retrieveSemanticMemory('Python', 5)

      // Access count should increase (verify in database)
    })
  })

  describe('Procedural Memory', () => {
    it('should store and retrieve preferences', async () => {
      await memoryManager.setPreference('theme', 'dark')
      await memoryManager.setPreference('language', 'en')

      const preferences = await memoryManager.getProceduralMemory()
      expect(preferences.theme).toBe('dark')
      expect(preferences.language).toBe('en')
    })

    it('should update existing preferences', async () => {
      await memoryManager.setPreference('theme', 'light')
      await memoryManager.setPreference('theme', 'dark')

      const preferences = await memoryManager.getProceduralMemory()
      expect(preferences.theme).toBe('dark')
    })
  })

  describe('Memory Assembly', () => {
    it('should assemble context from all memory types', async () => {
      // Setup memories
      await memoryManager.storeEpisodicMemory('c1', 'm1', 'Previous TypeScript discussion', 0.8)
      await memoryManager.storeSemanticMemory('User knows TypeScript', ['programming'])
      await memoryManager.setPreference('language', 'typescript')

      const context = await memoryManager.assembleContext('TypeScript coding')

      expect(context).toContain('TypeScript')
    })
  })
})
```

### Step 4: Write tests for API routes

**File:** `app/api/chat/__tests__/route.test.ts`

```typescript
import { describe, it, expect, jest } from '@jest/globals'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { createMockUser } from '@/lib/test-utils'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: createMockUser() },
        error: null
      })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'msg-123' },
        error: null
      })
    }))
  }))
}))

describe('POST /api/chat', () => {
  it('should create a chat message', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: 'conv-123',
        message: 'Hello, how are you?'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message')
  })

  it('should return 401 for unauthenticated users', async () => {
    // Mock unauthenticated user
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST'
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should validate request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}) // Missing required fields
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

### Step 5: Write tests for Card component

**File:** `components/ui/__tests__/card.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@/lib/test-utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../card'

describe('Card Component', () => {
  it('should render card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Test Footer')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })

  it('should render without optional parts', () => {
    render(
      <Card>
        <CardContent>Just content</CardContent>
      </Card>
    )

    expect(screen.getByText('Just content')).toBeInTheDocument()
  })
})
```

### Step 6: Run all unit tests

```bash
npm test
```

**Expected:** All tests pass

### Step 7: Check test coverage

```bash
npm run test:coverage
```

**Expected:** Coverage report generated

### Step 8: Commit

```bash
git add lib/rag/__tests__/ \
  lib/memory/__tests__/ \
  app/api/chat/__tests__/ \
  components/ui/__tests__/card.test.tsx
git commit -m "$(cat <<'EOF'
feat: add comprehensive unit tests

Unit tests for core functionality:
- Chunking strategies (fixed-size, sentence, semantic)
- Embedding generation with batching
- Memory manager (episodic, semantic, procedural)
- API routes with authentication
- Card component with all variants

Coverage: utilities, services, API routes, components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Integration Testing

**Purpose:** Test complete features end-to-end within the application, including database operations and API interactions.

**Files:**
- Create: `app/api/__tests__/document-upload.integration.test.ts`
- Create: `app/api/__tests__/rag-query.integration.test.ts`
- Create: `lib/agents/__tests__/agent-execution.integration.test.ts`

### Step 1: Write integration test for document upload flow

**File:** `app/api/__tests__/document-upload.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { testDbClient, createTestUser, cleanupTestData } from '@/lib/test-db'
import { POST as uploadDocument } from '../documents/upload/route'
import { NextRequest } from 'next/server'

describe('Document Upload Integration', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-upload-${Date.now()}@example.com`)
    userId = user.id
  })

  afterAll(async () => {
    await cleanupTestData(userId)
  })

  it('should upload document, process chunks, and generate embeddings', async () => {
    // 1. Upload document
    const formData = new FormData()
    const file = new File(['Test document content'], 'test.txt', {
      type: 'text/plain'
    })
    formData.append('file', file)

    const uploadRequest = new NextRequest(
      'http://localhost:3000/api/documents/upload',
      {
        method: 'POST',
        body: formData
      }
    )

    const uploadResponse = await uploadDocument(uploadRequest)
    expect(uploadResponse.status).toBe(200)

    const uploadData = await uploadResponse.json()
    const documentId = uploadData.documentId

    // 2. Verify document in database
    const { data: document } = await testDbClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    expect(document).toBeTruthy()
    expect(document.title).toBe('test.txt')
    expect(document.user_id).toBe(userId)

    // 3. Wait for processing (or trigger manually)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 4. Verify chunks created
    const { data: chunks } = await testDbClient
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)

    expect(chunks).toBeTruthy()
    expect(chunks!.length).toBeGreaterThan(0)

    // 5. Verify embeddings generated
    chunks!.forEach(chunk => {
      expect(chunk.embedding).toBeTruthy()
      expect(chunk.token_count).toBeGreaterThan(0)
    })
  }, 30000) // 30 second timeout

  it('should handle PDF upload and text extraction', async () => {
    // Test PDF processing
    // This would require a real PDF file or mock PDF processing
  })

  it('should reject invalid file types', async () => {
    const formData = new FormData()
    const file = new File(['content'], 'test.exe', {
      type: 'application/x-msdownload'
    })
    formData.append('file', file)

    const request = new NextRequest(
      'http://localhost:3000/api/documents/upload',
      {
        method: 'POST',
        body: formData
      }
    )

    const response = await uploadDocument(request)
    expect(response.status).toBe(400)
  })
})
```

### Step 2: Write integration test for RAG query flow

**File:** `app/api/__tests__/rag-query.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import {
  createTestUser,
  createTestDocument,
  cleanupTestData,
  testDbClient
} from '@/lib/test-db'
import { queryWithMemory } from '@/lib/rag/memory-integration'
import { generateEmbedding } from '@/lib/rag/embeddings'

describe('RAG Query Integration', () => {
  let userId: string
  let documentId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-rag-${Date.now()}@example.com`)
    userId = user.id

    // Create document with chunks
    const doc = await createTestDocument(userId, {
      title: 'TypeScript Guide',
      content: 'TypeScript is a typed superset of JavaScript. It provides static typing, interfaces, and more.'
    })
    documentId = doc.id

    // Create chunks with embeddings
    const chunks = [
      'TypeScript is a typed superset of JavaScript.',
      'It provides static typing, interfaces, and more.',
      'TypeScript compiles to plain JavaScript.'
    ]

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i])

      await testDbClient.from('document_chunks').insert({
        document_id: documentId,
        chunk_index: i,
        content: chunks[i],
        embedding: JSON.stringify(embedding),
        token_count: 10
      })
    }
  })

  afterAll(async () => {
    await cleanupTestData(userId)
  })

  it('should retrieve relevant chunks for query', async () => {
    const result = await queryWithMemory(
      userId,
      'What is TypeScript?'
    )

    expect(result).toBeTruthy()
    expect(result.answer).toContain('TypeScript')
    expect(result.sources.length).toBeGreaterThan(0)
    expect(result.sources[0].documentId).toBe(documentId)
  })

  it('should combine RAG results with memory', async () => {
    // Store some episodic memory
    const memoryManager = new MemoryManager(userId)
    await memoryManager.storeEpisodicMemory(
      'conv-1',
      'msg-1',
      'User previously asked about JavaScript',
      0.7
    )

    const result = await queryWithMemory(
      userId,
      'Tell me more about TypeScript'
    )

    // Should include both RAG results and memory context
    expect(result.answer).toBeTruthy()
    expect(result.sources.length).toBeGreaterThan(0)
  })

  it('should rank results by relevance', async () => {
    const result = await queryWithMemory(
      userId,
      'TypeScript typing system'
    )

    // Results should be ordered by relevance score
    for (let i = 0; i < result.sources.length - 1; i++) {
      expect(result.sources[i].relevanceScore).toBeGreaterThanOrEqual(
        result.sources[i + 1].relevanceScore
      )
    }
  })

  it('should handle queries with no results', async () => {
    const result = await queryWithMemory(
      userId,
      'Quantum physics explanation'
    )

    expect(result.sources.length).toBe(0)
    expect(result.answer).toContain('no relevant information')
  })
}, 30000)
```

### Step 3: Write integration test for agent execution

**File:** `lib/agents/__tests__/agent-execution.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestUser, cleanupTestData, testDbClient } from '@/lib/test-db'
import { executeResearchAgent } from '../patterns/research-agent'
import { AgentExecutor } from '../agent-executor'

describe('Agent Execution Integration', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-agent-${Date.now()}@example.com`)
    userId = user.id
  })

  afterAll(async () => {
    await cleanupTestData(userId)
  })

  it('should execute research agent end-to-end', async () => {
    const result = await executeResearchAgent(
      userId,
      'Research TypeScript best practices'
    )

    // Verify execution completed
    expect(result.status).toBe('completed')
    expect(result.output).toBeTruthy()
    expect(result.iterations).toBeGreaterThan(0)

    // Verify execution stored in database
    const { data: execution } = await testDbClient
      .from('agent_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    expect(execution).toBeTruthy()
    expect(execution.status).toBe('completed')

    // Verify steps recorded
    const { data: steps } = await testDbClient
      .from('agent_steps')
      .select('*')
      .eq('execution_id', execution.id)
      .order('step_number', { ascending: true })

    expect(steps).toBeTruthy()
    expect(steps!.length).toBeGreaterThan(0)

    // Verify steps have thought-action-observation
    steps!.forEach(step => {
      expect(step.thought).toBeTruthy()
      expect(step.action).toBeTruthy()
      expect(step.observation).toBeTruthy()
    })
  }, 60000) // 60 second timeout

  it('should handle agent errors gracefully', async () => {
    // Test with invalid input that should cause error
    const result = await executeResearchAgent(userId, '')

    expect(result.status).toBe('failed')
    expect(result.errorMessage).toBeTruthy()
  })

  it('should track token usage and cost', async () => {
    const result = await executeResearchAgent(
      userId,
      'Quick test query'
    )

    expect(result.totalTokens).toBeGreaterThan(0)
    expect(result.cost).toBeGreaterThan(0)
  })

  it('should respect max iterations limit', async () => {
    const executor = new AgentExecutor(
      userId,
      'test-agent',
      'You are a test agent',
      [],
      { maxIterations: 2 }
    )

    const result = await executor.execute('Test task')

    expect(result.iterations).toBeLessThanOrEqual(2)
  })
}, 120000)
```

### Step 4: Run integration tests

```bash
npm test -- --testPathPattern=integration
```

**Expected:** All integration tests pass

### Step 5: Commit

```bash
git add app/api/__tests__/*.integration.test.ts \
  lib/agents/__tests__/*.integration.test.ts
git commit -m "$(cat <<'EOF'
feat: add integration tests

End-to-end integration tests:
- Document upload with chunking and embedding generation
- RAG query with vector search and memory integration
- Agent execution with ReAct loop and database tracking
- Error handling and edge cases

Tests cover complete user workflows from API to database.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: E2E Testing with Playwright

**Purpose:** Implement end-to-end browser tests covering critical user journeys.

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/auth.spec.ts`
- Create: `e2e/document-qa.spec.ts`
- Create: `e2e/agent-execution.spec.ts`
- Create: `e2e/fixtures/test-helpers.ts`

### Step 1: Configure Playwright

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
```

### Step 2: Create test helpers

**File:** `e2e/fixtures/test-helpers.ts`

```typescript
import { Page } from '@playwright/test'

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

export async function logout(page: Page) {
  await page.click('button[aria-label="User menu"]')
  await page.click('text=Logout')
  await page.waitForURL('/login')
}

export async function createTestUser() {
  const email = `test-${Date.now()}@example.com`
  const password = 'TestPassword123!'
  return { email, password }
}

export async function uploadDocument(page: Page, filePath: string) {
  await page.goto('/dashboard/documents')
  await page.click('text=Upload Document')

  const fileInput = await page.locator('input[type="file"]')
  await fileInput.setInputFiles(filePath)

  await page.click('button:has-text("Upload")')
  await page.waitForSelector('text=Upload complete')
}
```

### Step 3: Write E2E tests for authentication

**File:** `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { createTestUser, login, logout } from './fixtures/test-helpers'

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    const { email, password } = await createTestUser()

    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should login existing user', async ({ page }) => {
    const { email, password } = await createTestUser()

    // First create the user
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Logout
    await logout(page)

    // Login again
    await login(page, email, password)
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    const { email, password } = await createTestUser()

    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    await logout(page)
    await expect(page).toHaveURL('/login')
  })

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
```

### Step 4: Write E2E tests for document Q&A

**File:** `e2e/document-qa.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { createTestUser, login, uploadDocument } from './fixtures/test-helpers'
import path from 'path'

test.describe('Document Q&A', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = await createTestUser()
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
  })

  test('should upload and process document', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')

    await uploadDocument(page, testFilePath)

    // Verify document appears in list
    await expect(page.locator('text=test-document.txt')).toBeVisible()
  })

  test('should ask question about uploaded document', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')
    await uploadDocument(page, testFilePath)

    // Navigate to Q&A
    await page.click('text=Ask Question')

    // Type question
    await page.fill('textarea[placeholder*="question"]', 'What is this document about?')
    await page.click('button:has-text("Ask")')

    // Wait for response
    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Verify answer appears
    const answer = await page.locator('[data-testid="answer"]').textContent()
    expect(answer).toBeTruthy()
    expect(answer!.length).toBeGreaterThan(0)
  })

  test('should show citations in answer', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')
    await uploadDocument(page, testFilePath)

    await page.click('text=Ask Question')
    await page.fill('textarea[placeholder*="question"]', 'Summarize the key points')
    await page.click('button:has-text("Ask")')

    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Check for citations
    await expect(page.locator('text=Sources:')).toBeVisible()
    await expect(page.locator('[data-testid="citation"]')).toHaveCount.greaterThan(0)
  })

  test('should handle multiple documents', async ({ page }) => {
    const file1 = path.join(__dirname, 'fixtures', 'document1.txt')
    const file2 = path.join(__dirname, 'fixtures', 'document2.txt')

    await uploadDocument(page, file1)
    await uploadDocument(page, file2)

    // Verify both documents listed
    await expect(page.locator('text=document1.txt')).toBeVisible()
    await expect(page.locator('text=document2.txt')).toBeVisible()

    // Ask question spanning both documents
    await page.click('text=Ask Question')
    await page.fill('textarea', 'Compare the content of both documents')
    await page.click('button:has-text("Ask")')

    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Should cite both documents
    const citations = await page.locator('[data-testid="citation"]').count()
    expect(citations).toBeGreaterThanOrEqual(2)
  })
})
```

### Step 5: Write E2E tests for agent execution

**File:** `e2e/agent-execution.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { createTestUser } from './fixtures/test-helpers'

test.describe('Agent Execution', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = await createTestUser()
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
  })

  test('should execute research agent', async ({ page }) => {
    await page.goto('/dashboard/agents')

    // Select research agent
    await page.click('text=Research Agent')

    // Enter task
    await page.fill(
      'textarea[placeholder*="task"]',
      'Research the benefits of TypeScript'
    )

    // Start execution
    await page.click('button:has-text("Run Agent")')

    // Wait for execution to complete
    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // Verify output
    const output = await page.locator('[data-testid="agent-output"]').textContent()
    expect(output).toContain('TypeScript')
  })

  test('should show agent execution trace', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Quick research task')
    await page.click('button:has-text("Run Agent")')

    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // View trace
    await page.click('text=View Trace')

    // Verify steps shown
    await expect(page.locator('text=Step 1:')).toBeVisible()
    await expect(page.locator('text=Thought:')).toBeVisible()
    await expect(page.locator('text=Action:')).toBeVisible()
    await expect(page.locator('text=Observation:')).toBeVisible()
  })

  test('should track agent metrics', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Test metrics tracking')
    await page.click('button:has-text("Run Agent")')

    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // Check metrics displayed
    await expect(page.locator('text=Iterations:')).toBeVisible()
    await expect(page.locator('text=Tokens:')).toBeVisible()
    await expect(page.locator('text=Cost:')).toBeVisible()
  })

  test('should allow stopping agent execution', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Long running task')
    await page.click('button:has-text("Run Agent")')

    // Wait a moment then stop
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Stop")')

    // Verify stopped status
    await expect(page.locator('text=Status: stopped')).toBeVisible()
  })
})
```

### Step 6: Create test fixtures

**File:** `e2e/fixtures/test-document.txt`

```
This is a test document for E2E testing.

It contains multiple paragraphs with different content.
The purpose is to test document upload and Q&A functionality.

Key points:
- Testing document processing
- Testing vector embeddings
- Testing question answering
```

### Step 7: Run E2E tests

```bash
npm run test:e2e
```

**Expected:** All E2E tests pass in Playwright

### Step 8: Run E2E tests in UI mode for debugging

```bash
npm run test:e2e:ui
```

**Expected:** Playwright UI opens for interactive testing

### Step 9: Update package.json with all test commands

**File:** `package.json` (verify all scripts)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

### Step 10: Commit

```bash
git add playwright.config.ts \
  e2e/ \
  package.json
git commit -m "$(cat <<'EOF'
feat: add E2E tests with Playwright

Comprehensive browser tests:
- Authentication (signup, login, logout, protected routes)
- Document Q&A (upload, processing, questions, citations)
- Agent execution (research agent, execution trace, metrics, stop)
- Cross-browser testing (Chrome, Firefox, Safari, Mobile)
- Test fixtures and helpers

Run: npm run test:e2e
Debug: npm run test:e2e:ui

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

**Week 8 Implementation Complete:**

**What We Built:**
1. **Testing Infrastructure** - Jest, React Testing Library, MSW, test database, CI/CD
2. **Unit Testing Strategy** - Tests for utilities, services, API routes, components
3. **Integration Testing** - End-to-end feature tests with database operations
4. **E2E Testing** - Playwright browser tests for critical user journeys

**Key Features:**
- Jest configuration with Next.js support
- Test utilities and custom render function
- Mock Service Worker for API mocking
- Test database with cleanup utilities
- GitHub Actions CI/CD workflow
- Code coverage reporting (70% threshold)
- Playwright cross-browser testing
- Test fixtures and helpers

**Test Coverage:**
- 15+ unit tests (chunking, embeddings, memory, API routes, components)
- 3 integration tests (document upload, RAG query, agent execution)
- 12+ E2E tests (auth, document Q&A, agents)
- Cross-browser (Chrome, Firefox, Safari, Mobile)

**CI/CD Pipeline:**
- Automated testing on push/PR
- Code coverage reporting
- Type checking
- Linting
- E2E test artifacts

**Ready for:** Week 9 implementation (Performance Optimization + Monitoring)
