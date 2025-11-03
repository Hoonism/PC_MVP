'use client'

/**
 * Monitoring Provider
 * 
 * Initializes monitoring and tracking on the client side
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initMonitoring, trackPageView } from '@/lib/monitoring'

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Initialize monitoring on mount
    initMonitoring()
  }, [])

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  return <>{children}</>
}
