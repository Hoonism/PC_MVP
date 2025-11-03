/**
 * Example: Rate-Limited API Route
 * 
 * Shows how to apply rate limiting to API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { withStandardRateLimit } from '@/middleware/rateLimitMiddleware'

async function handler(request: NextRequest) {
  // Your API logic here
  const data = await request.json()
  
  return NextResponse.json({
    success: true,
    message: 'Request processed successfully',
    data,
  })
}

// Export with rate limiting
export const POST = withStandardRateLimit(handler)

// You can also customize the rate limit:
// export const POST = withRateLimit(handler, {
//   interval: 60 * 1000,
//   limit: 10,
// })
