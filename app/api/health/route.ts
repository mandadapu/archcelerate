import { NextResponse } from 'next/server'

/**
 * Health check endpoint for Cloud Run container health monitoring.
 * Returns service status and timestamp.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'archcelerate',
  })
}
