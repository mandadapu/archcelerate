import { executeCode } from '@/lib/sandbox/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json()

    const result = await executeCode(code, language)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execution error:', error)
    return NextResponse.json(
      { success: false, output: '', error: 'Execution failed' },
      { status: 500 }
    )
  }
}
