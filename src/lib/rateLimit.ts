/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting for:
 * - API routes
 * - User actions
 * - IP-based limits
 * - Token bucket algorithm
 * - Sliding window
 */

import { NextRequest } from 'next/server'

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests in window
  skipFailedRequests?: boolean // Don't count failed requests
  skipSuccessfulRequests?: boolean // Don't count successful requests
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitStore {
  get(key: string): Promise<number | null>
  set(key: string, value: number, ttl: number): Promise<void>
  increment(key: string): Promise<number>
  delete(key: string): Promise<void>
}

// ============================================================================
// In-Memory Store (for development)
// ============================================================================

class InMemoryStore implements RateLimitStore {
  private store = new Map<string, { value: number; expires: number }>()

  async get(key: string): Promise<number | null> {
    const item = this.store.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.store.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl,
    })
  }

  async increment(key: string): Promise<number> {
    const current = await this.get(key)
    const newValue = (current || 0) + 1
    await this.set(key, newValue, 60000) // 1 minute default
    return newValue
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.store.entries()) {
      if (now > item.expires) {
        this.store.delete(key)
      }
    }
  }
}

// ============================================================================
// Rate Limiter Class
// ============================================================================

export class RateLimiter {
  private store: RateLimitStore
  private config: RateLimitConfig

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = config
    this.store = store || new InMemoryStore()

    // Cleanup expired entries every minute (in-memory only)
    if (store instanceof InMemoryStore) {
      setInterval(() => store.cleanup(), 60000)
    }
  }

  /**
   * Check rate limit for a key
   */
  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / this.config.interval)}`
    
    const count = await this.store.get(windowKey)
    const currentCount = count || 0

    if (currentCount >= this.config.limit) {
      const resetTime = Math.ceil(now / this.config.interval) * this.config.interval
      const retryAfter = Math.ceil((resetTime - now) / 1000)

      return {
        success: false,
        limit: this.config.limit,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      }
    }

    await this.store.set(windowKey, currentCount + 1, this.config.interval)

    return {
      success: true,
      limit: this.config.limit,
      remaining: this.config.limit - currentCount - 1,
      reset: Math.ceil(now / this.config.interval) * this.config.interval,
    }
  }

  /**
   * Reset rate limit for a key
   */
  async reset(key: string): Promise<void> {
    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / this.config.interval)}`
    await this.store.delete(windowKey)
  }
}

// ============================================================================
// Sliding Window Rate Limiter
// ============================================================================

export class SlidingWindowRateLimiter {
  private store: RateLimitStore
  private config: RateLimitConfig

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = config
    this.store = store || new InMemoryStore()
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.config.interval
    
    // Get timestamps of recent requests
    const requestsKey = `requests:${key}`
    const requestsData = await this.store.get(requestsKey)
    const requests: number[] = requestsData ? JSON.parse(String(requestsData)) : []
    
    // Filter requests within window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)
    
    if (recentRequests.length >= this.config.limit) {
      const oldestRequest = recentRequests[0] || now
      const retryAfter = Math.ceil((oldestRequest + this.config.interval - now) / 1000)

      return {
        success: false,
        limit: this.config.limit,
        remaining: 0,
        reset: oldestRequest + this.config.interval,
        retryAfter,
      }
    }

    // Add current request
    recentRequests.push(now)
    await this.store.set(requestsKey, JSON.parse(JSON.stringify(recentRequests)), this.config.interval)

    return {
      success: true,
      limit: this.config.limit,
      remaining: this.config.limit - recentRequests.length,
      reset: now + this.config.interval,
    }
  }
}

// ============================================================================
// Token Bucket Rate Limiter
// ============================================================================

export class TokenBucketRateLimiter {
  private capacity: number
  private refillRate: number
  private store: RateLimitStore

  constructor(capacity: number, refillRate: number, store?: RateLimitStore) {
    this.capacity = capacity
    this.refillRate = refillRate
    this.store = store || new InMemoryStore()
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const bucketKey = `bucket:${key}`
    
    const bucketData = await this.store.get(bucketKey)
    let bucket: { tokens: number; lastRefill: number }
    
    if (!bucketData) {
      bucket = { tokens: this.capacity, lastRefill: now }
    } else {
      bucket = JSON.parse(String(bucketData))
      
      // Refill tokens based on time passed
      const timePassed = now - bucket.lastRefill
      const tokensToAdd = Math.floor(timePassed / 1000) * this.refillRate
      bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }

    if (bucket.tokens < 1) {
      const timeToNextToken = Math.ceil((1 - bucket.tokens) / this.refillRate * 1000)
      
      return {
        success: false,
        limit: this.capacity,
        remaining: 0,
        reset: now + timeToNextToken,
        retryAfter: Math.ceil(timeToNextToken / 1000),
      }
    }

    // Consume one token
    bucket.tokens -= 1
    await this.store.set(bucketKey, JSON.parse(JSON.stringify(bucket)), 60000)

    return {
      success: true,
      limit: this.capacity,
      remaining: Math.floor(bucket.tokens),
      reset: now + Math.ceil((this.capacity - bucket.tokens) / this.refillRate * 1000),
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
  request: NextRequest,
  prefix: string = 'rate_limit'
): string {
  // Try to get user ID from auth header or cookie
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `${prefix}:user:${userId}`
  }

  // Fall back to IP address
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  
  return `${prefix}:ip:${ip}`
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

// Strict rate limit for sensitive operations (login, signup)
export const strictRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 5, // 5 requests per minute
})

// Standard rate limit for API routes
export const standardRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 60, // 60 requests per minute
})

// Generous rate limit for general use
export const generousRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  limit: 300, // 300 requests per minute
})

// Token bucket for burst traffic
export const burstRateLimiter = new TokenBucketRateLimiter(
  100, // 100 tokens capacity
  10   // 10 tokens per second refill rate
)

// ============================================================================
// Exports
// ============================================================================

export const rateLimit = {
  check: (key: string, config: RateLimitConfig) => new RateLimiter(config).check(key),
  getRateLimitKey,
  createRateLimitHeaders,
  strictRateLimiter,
  standardRateLimiter,
  generousRateLimiter,
  burstRateLimiter,
}
