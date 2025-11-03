/**
 * API Client with Retry Logic and Error Handling
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request cancellation support
 * - Offline detection
 * - Type-safe requests and responses
 * - Comprehensive error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { z } from 'zod'
import { validateResponse, ApiError } from '@/types/api'

// ============================================================================
// Configuration
// ============================================================================

interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  retryableStatuses: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

// ============================================================================
// API Client Class
// ============================================================================

export class ApiClient {
  private client: AxiosInstance
  private retryConfig: RetryConfig
  private abortControllers: Map<string, AbortController>

  constructor(baseURL: string = '/api', retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    this.abortControllers = new Map()

    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add offline detection
        if (!navigator.onLine) {
          throw new Error('No internet connection. Please check your network.')
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: number }

        // Don't retry if request was cancelled
        if (axios.isCancel(error)) {
          throw new Error('Request cancelled')
        }

        // Check if we should retry
        const shouldRetry = 
          originalRequest &&
          (!originalRequest._retry || originalRequest._retry < this.retryConfig.maxRetries) &&
          this.isRetryableError(error)

        if (shouldRetry) {
          originalRequest._retry = (originalRequest._retry || 0) + 1
          
          const delay = this.calculateDelay(originalRequest._retry)
          await this.sleep(delay)

          return this.client(originalRequest)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Make a type-safe GET request
   */
  async get<T>(
    url: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestId = this.generateRequestId()
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    try {
      const response = await this.client.get(url, {
        ...config,
        signal: abortController.signal,
      })
      return validateResponse(schema, response.data)
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  /**
   * Make a type-safe POST request
   */
  async post<T>(
    url: string,
    data: unknown,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestId = this.generateRequestId()
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    try {
      const response = await this.client.post(url, data, {
        ...config,
        signal: abortController.signal,
      })
      return validateResponse(schema, response.data)
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  /**
   * Make a type-safe PUT request
   */
  async put<T>(
    url: string,
    data: unknown,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestId = this.generateRequestId()
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    try {
      const response = await this.client.put(url, data, {
        ...config,
        signal: abortController.signal,
      })
      return validateResponse(schema, response.data)
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  /**
   * Make a type-safe DELETE request
   */
  async delete<T>(
    url: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const requestId = this.generateRequestId()
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    try {
      const response = await this.client.delete(url, {
        ...config,
        signal: abortController.signal,
      })
      return validateResponse(schema, response.data)
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.abortControllers.forEach((controller) => controller.abort())
    this.abortControllers.clear()
  }

  /**
   * Cancel a specific request by ID
   */
  cancel(requestId: string): void {
    const controller = this.abortControllers.get(requestId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestId)
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors are retryable
      return true
    }

    return this.retryConfig.retryableStatuses.includes(error.response.status)
  }

  private calculateDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.retryConfig.initialDelayMs * Math.pow(2, retryCount - 1),
      this.retryConfig.maxDelayMs
    )
    
    // Add random jitter (0-20% of delay)
    const jitter = exponentialDelay * 0.2 * Math.random()
    
    return exponentialDelay + jitter
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any
      return {
        error: data?.error || error.message || 'Server error',
        details: data?.details || error.response.statusText,
        code: data?.code,
        statusCode: error.response.status,
      }
    } else if (error.request) {
      // Request made but no response
      return {
        error: 'No response from server',
        details: error.message,
        code: 'NETWORK_ERROR',
        statusCode: 0,
      }
    } else {
      // Error setting up request
      return {
        error: 'Request failed',
        details: error.message,
        code: 'REQUEST_ERROR',
      }
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const apiClient = new ApiClient()

// ============================================================================
// Network Status Hook (for React components)
// ============================================================================

export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return { isOnline: true, isOffline: false }
  }

  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
  }
}

// Import React for the hook
import React from 'react'
