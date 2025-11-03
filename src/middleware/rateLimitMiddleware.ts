/**
 * Rate Limit Middleware for Next.js API Routes
 * 
 * Usage:
 * export const POST = withRateLimit(handler, { limit: 10, interval: 60000 })
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  RateLimiter,
  RateLimitConfig,
  getRateLimitKey,
  createRateLimitHeaders,
} from '@/lib/rateLimit'

type NextRouteHandler = (
  request: NextRequest,
  context: { params: any }
) => Promise<NextResponse> | NextResponse

/**
 * Wrap API route handler with rate limiting
 */
export function withRateLimit(
  handler: NextRouteHandler,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
  },
  options: {
    keyPrefix?: string
    onRateLimit?: (request: NextRequest) => void
  } = {}
): NextRouteHandler {
  const limiter = new RateLimiter(config)

  return async (request: NextRequest, context: { params: any }) => {
    try {
      // Get rate limit key (user ID or IP)
      const key = getRateLimitKey(request, options.keyPrefix)

      // Check rate limit
      const result = await limiter.check(key)

      // Add rate limit headers to response
      const headers = createRateLimitHeaders(result)

      if (!result.success) {
        // Call optional callback
        if (options.onRateLimit) {
          options.onRateLimit(request)
        }

        // Return 429 Too Many Requests
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers,
          }
        )
      }

      // Execute handler
      const response = await handler(request, context)

      // Add rate limit headers to successful response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    } catch (error) {
      console.error('Rate limit middleware error:', error)
      // If rate limiting fails, allow the request through
      return handler(request, context)
    }
  }
}

/**
 * Create custom rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (handler: NextRouteHandler) => withRateLimit(handler, config)
}

/**
 * Pre-configured middleware for different use cases
 */

// Strict rate limiting for authentication endpoints
export const withStrictRateLimit = (handler: NextRouteHandler) =>
  withRateLimit(handler, {
    interval: 60 * 1000, // 1 minute
    limit: 5, // 5 requests per minute
  })

// Standard rate limiting for most API endpoints
export const withStandardRateLimit = (handler: NextRouteHandler) =>
  withRateLimit(handler, {
    interval: 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
  })

// Generous rate limiting for public endpoints
export const withGenerousRateLimit = (handler: NextRouteHandler) =>
  withRateLimit(handler, {
    interval: 60 * 1000, // 1 minute
    limit: 300, // 300 requests per minute
  })
