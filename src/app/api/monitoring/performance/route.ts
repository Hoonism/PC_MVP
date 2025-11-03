/**
 * Performance Monitoring API Route
 * 
 * Receives performance metrics from client
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, value, unit, tags, timestamp } = body
    
    // Log performance metrics
    console.log('[Performance Metric]', {
      name,
      value,
      unit,
      tags,
      timestamp: new Date(timestamp).toISOString(),
    })
    
    // In production, send to analytics service
    // await analytics.track('performance', { name, value, unit, tags })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to process performance metric:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}
