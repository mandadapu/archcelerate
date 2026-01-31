import { Sandbox } from 'e2b'

export async function executeCode(
  code: string,
  language: 'javascript' | 'python' = 'javascript'
): Promise<{
  success: boolean
  output: string
  error?: string
  executionTime: number
}> {
  const startTime = Date.now()

  try {
    const sandbox = await Sandbox.create()

    const result = language === 'javascript'
      ? await sandbox.runCode(code)
      : await sandbox.runCode(code, { language: 'python' })

    await sandbox.kill()

    const executionTime = Date.now() - startTime

    return {
      success: !result.error,
      output: result.stdout || result.stderr || '',
      error: result.error,
      executionTime,
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
      executionTime: Date.now() - startTime,
    }
  }
}
