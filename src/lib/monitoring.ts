/**
 * Monitoring & Observability
 * 
 * Centralized monitoring for:
 * - Error tracking
 * - Performance monitoring
 * - User analytics
 * - Custom events
 */

// ============================================================================
// Types
// ============================================================================

export interface MonitoringConfig {
  enabled: boolean
  environment: 'development' | 'staging' | 'production'
  sampleRate: number
  debug: boolean
}

export interface ErrorContext {
  user?: {
    id: string
    email?: string
  }
  page?: string
  action?: string
  metadata?: Record<string, any>
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  tags?: Record<string, string>
}

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

// ============================================================================
// Configuration
// ============================================================================

const config: MonitoringConfig = {
  enabled: process.env.NODE_ENV === 'production',
  environment: (process.env.NEXT_PUBLIC_ENV as any) || 'development',
  sampleRate: 1.0, // 100% in development, adjust for production
  debug: process.env.NODE_ENV === 'development',
}

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Track an error
 */
export function trackError(
  error: Error,
  context?: ErrorContext
): void {
  if (!config.enabled) {
    if (config.debug) {
      console.error('[Monitoring] Error:', error, context)
    }
    return
  }

  // In production, send to error tracking service (e.g., Sentry)
  try {
    // Example: Sentry.captureException(error, { ...context })
    
    // For now, log to console with structured data
    console.error('[Error]', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })

    // Could also send to custom backend endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          context,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail - don't break app if monitoring fails
      })
    }
  } catch (monitoringError) {
    // Don't let monitoring errors break the app
    console.warn('Monitoring error:', monitoringError)
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Track performance metric
 */
export function trackPerformance(metric: PerformanceMetric): void {
  if (!config.enabled) {
    if (config.debug) {
      console.log('[Monitoring] Performance:', metric)
    }
    return
  }

  try {
    // Example: Send to analytics service
    console.log('[Performance]', metric)

    // Could send to backend
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }
  } catch (error) {
    console.warn('Performance monitoring error:', error)
  }
}

/**
 * Measure and track function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now()
  
  const result = Promise.resolve(fn())
  
  return result.then(
    (value) => {
      const duration = performance.now() - start
      trackPerformance({
        name,
        value: duration,
        unit: 'ms',
      })
      return value
    },
    (error) => {
      const duration = performance.now() - start
      trackPerformance({
        name: `${name}_error`,
        value: duration,
        unit: 'ms',
      })
      throw error
    }
  )
}

// ============================================================================
// Analytics
// ============================================================================

/**
 * Track user event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!config.enabled) {
    if (config.debug) {
      console.log('[Monitoring] Event:', event)
    }
    return
  }

  try {
    const eventData = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    }

    // Example: Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, event.properties)
    }

    // Log for debugging
    console.log('[Event]', eventData)

    // Send to backend
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch(() => {})
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent({
    event: 'page_view',
    properties: {
      path,
      title: title || document.title,
    },
  })
}

// ============================================================================
// Web Vitals
// ============================================================================

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined' || !config.enabled) {
    return
  }

  // Track Web Vitals using web-vitals library
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS((metric) => {
      trackPerformance({
        name: 'CLS',
        value: metric.value,
        unit: 'count',
        tags: { rating: metric.rating },
      })
    })

    onFID((metric) => {
      trackPerformance({
        name: 'FID',
        value: metric.value,
        unit: 'ms',
        tags: { rating: metric.rating },
      })
    })

    onFCP((metric) => {
      trackPerformance({
        name: 'FCP',
        value: metric.value,
        unit: 'ms',
        tags: { rating: metric.rating },
      })
    })

    onLCP((metric) => {
      trackPerformance({
        name: 'LCP',
        value: metric.value,
        unit: 'ms',
        tags: { rating: metric.rating },
      })
    })

    onTTFB((metric) => {
      trackPerformance({
        name: 'TTFB',
        value: metric.value,
        unit: 'ms',
        tags: { rating: metric.rating },
      })
    })
  }).catch((error) => {
    console.warn('Web Vitals tracking error:', error)
  })
}

// ============================================================================
// Session Tracking
// ============================================================================

let sessionId: string | null = null

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (sessionId) return sessionId

  // Try to get from sessionStorage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('monitoring_session_id')
    if (stored) {
      sessionId = stored
      return sessionId
    }
  }

  // Generate new session ID
  sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('monitoring_session_id', sessionId)
  }

  return sessionId
}

// ============================================================================
// Initialize
// ============================================================================

/**
 * Initialize monitoring
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return

  // Track web vitals
  trackWebVitals()

  // Track page view on load
  trackPageView(window.location.pathname)

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError(new Error(event.message), {
      page: window.location.pathname,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  })

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason)),
      {
        page: window.location.pathname,
        action: 'unhandled_promise_rejection',
      }
    )
  })

  if (config.debug) {
    console.log('[Monitoring] Initialized', config)
  }
}

// ============================================================================
// Exports
// ============================================================================

export const monitoring = {
  trackError,
  trackPerformance,
  measurePerformance,
  trackEvent,
  trackPageView,
  trackWebVitals,
  getSessionId,
  init: initMonitoring,
}
