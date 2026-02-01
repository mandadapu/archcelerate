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
