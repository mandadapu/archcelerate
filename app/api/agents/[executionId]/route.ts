import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await params
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch execution with agent definition
    const { data: execution, error: executionError } = await supabase
      .from('agent_executions')
      .select('*, agent_definitions (name, description)')
      .eq('id', executionId)
      .single()

    if (executionError || !execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    // Check user ownership
    if (execution.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    // Fetch all steps for this execution
    const { data: steps, error: stepsError } = await supabase
      .from('agent_steps')
      .select('*')
      .eq('execution_id', executionId)
      .order('step_number', { ascending: true })

    if (stepsError) {
      console.error('Error fetching steps:', stepsError)
      return NextResponse.json(
        { error: 'Failed to fetch execution steps' },
        { status: 500 }
      )
    }

    // Fetch all tool calls for this execution
    const { data: toolCalls, error: toolCallsError } = await supabase
      .from('tool_calls')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })

    if (toolCallsError) {
      console.error('Error fetching tool calls:', toolCallsError)
      return NextResponse.json(
        { error: 'Failed to fetch tool calls' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      execution,
      steps: steps || [],
      toolCalls: toolCalls || [],
    })
  } catch (error) {
    console.error('Error in execution details API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
