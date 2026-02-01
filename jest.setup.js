// Polyfills must be set BEFORE any other imports
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream
})

require('@testing-library/jest-dom')
require('whatwg-fetch')

// Mock matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

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
process.env.VOYAGE_API_KEY = 'test-voyage-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.TAVILY_API_KEY = 'test-tavily-key'

// Increase test timeout for integration tests
jest.setTimeout(10000)

// Note: MSW setup is optional - import in individual test files if needed
// Example: import { server } from '@/mocks/server'
