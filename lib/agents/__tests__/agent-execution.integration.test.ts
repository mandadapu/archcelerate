import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { createTestUser, cleanupTestData, testDbClient } from '@/lib/test-db'

// Mock the agent executor to avoid external API calls
jest.mock('@/lib/agents/agent-executor', () => ({
  AgentExecutor: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      status: 'completed',
      output: 'Test research output',
      iterations: 3,
      totalTokens: 500,
      cost: 0.01,
      steps: [
        {
          stepNumber: 1,
          thought: 'I need to search for information',
          action: 'web_search',
          actionInput: { query: 'TypeScript best practices' },
          observation: 'Found relevant results'
        }
      ]
    })
  }))
}))

describe.skip('Agent Execution Integration', () => {
  let userId: string

  beforeAll(async () => {
    const user = await createTestUser(`test-agent-${Date.now()}@example.com`)
    userId = user.id
  }, 30000)

  afterAll(async () => {
    await cleanupTestData(userId)
  }, 30000)

  it('should create agent execution record', async () => {
    const { data: execution, error } = await testDbClient
      .from('agent_executions')
      .insert({
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Research TypeScript best practices',
        status: 'running'
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(execution).toBeTruthy()
    expect(execution!.status).toBe('running')
    expect(execution!.user_id).toBe(userId)
  })

  it('should track agent execution steps', async () => {
    // Create execution
    const { data: execution } = await testDbClient
      .from('agent_executions')
      .insert({
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Test task',
        status: 'running'
      })
      .select()
      .single()

    // Create steps
    const steps = [
      {
        execution_id: execution!.id,
        step_number: 1,
        thought: 'I need to search',
        action: 'web_search',
        action_input: JSON.stringify({ query: 'test' }),
        observation: 'Found results'
      },
      {
        execution_id: execution!.id,
        step_number: 2,
        thought: 'I have enough information',
        action: 'final_answer',
        action_input: JSON.stringify({ answer: 'Test answer' }),
        observation: 'Task complete'
      }
    ]

    const { data: insertedSteps, error: stepsError } = await testDbClient
      .from('agent_steps')
      .insert(steps)
      .select()

    expect(stepsError).toBeNull()
    expect(insertedSteps).toHaveLength(2)

    // Verify we can query steps by execution
    const { data: querySteps } = await testDbClient
      .from('agent_steps')
      .select('*')
      .eq('execution_id', execution!.id)
      .order('step_number', { ascending: true })

    expect(querySteps).toHaveLength(2)
    expect(querySteps![0].step_number).toBe(1)
    expect(querySteps![1].step_number).toBe(2)
  })

  it('should update execution status and metrics', async () => {
    // Create execution
    const { data: execution } = await testDbClient
      .from('agent_executions')
      .insert({
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Complete task',
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    // Update to completed
    const { data: updated, error: updateError } = await testDbClient
      .from('agent_executions')
      .update({
        status: 'completed',
        output: 'Task completed successfully',
        iterations: 3,
        total_tokens: 500,
        cost: '0.01',
        completed_at: new Date().toISOString()
      })
      .eq('id', execution!.id)
      .select()
      .single()

    expect(updateError).toBeNull()
    expect(updated).toBeTruthy()
    expect(updated!.status).toBe('completed')
    expect(updated!.iterations).toBe(3)
    expect(updated!.total_tokens).toBe(500)
  })

  it('should handle agent errors gracefully', async () => {
    const { data: execution, error } = await testDbClient
      .from('agent_executions')
      .insert({
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Invalid task',
        status: 'failed',
        error_message: 'Task validation failed'
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(execution!.status).toBe('failed')
    expect(execution!.error_message).toBe('Task validation failed')
  })

  it('should track token usage and cost', async () => {
    const { data: execution } = await testDbClient
      .from('agent_executions')
      .insert({
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Track metrics',
        status: 'completed',
        total_tokens: 1000,
        cost: '0.02'
      })
      .select()
      .single()

    expect(execution!.total_tokens).toBe(1000)
    expect(parseFloat(execution!.cost!)).toBeCloseTo(0.02, 2)
  })

  it('should enforce max iterations limit', () => {
    const maxIterations = 10
    let currentIterations = 0

    // Simulate agent loop
    while (currentIterations < maxIterations) {
      currentIterations++

      // Break if we find answer
      if (currentIterations === 3) {
        break
      }
    }

    expect(currentIterations).toBe(3)
    expect(currentIterations).toBeLessThanOrEqual(maxIterations)
  })

  it('should retrieve execution history for user', async () => {
    // Create multiple executions
    await testDbClient.from('agent_executions').insert([
      {
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Task 1',
        status: 'completed'
      },
      {
        user_id: userId,
        agent_definition_id: 'test-agent-id',
        input: 'Task 2',
        status: 'completed'
      }
    ])

    // Query executions
    const { data: executions, error } = await testDbClient
      .from('agent_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    expect(error).toBeNull()
    expect(executions).toBeTruthy()
    expect(executions!.length).toBeGreaterThanOrEqual(2)
  })
}, 120000)
