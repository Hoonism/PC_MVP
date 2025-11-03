/**
 * Error Monitoring API Route
 * 
 * Receives error reports from client and logs them
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { error, context, timestamp, url, userAgent } = body
    
    // In production, send to monitoring service (Sentry, DataDog, etc.)
    // For now, log to console with structured format
    console.error('[Client Error]', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      timestamp: new Date(timestamp).toISOString(),
      url,
      userAgent,
    })
    
    // Could also write to database or external service
    // await db.errors.create({ data: { ...body } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process error report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}
