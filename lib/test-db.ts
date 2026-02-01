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
