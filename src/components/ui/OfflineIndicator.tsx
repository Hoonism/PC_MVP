'use client'

import { useNetworkStatus } from '@/lib/apiClient'
import { WifiOff } from 'lucide-react'

/**
 * Offline Indicator Component
 * 
 * Shows a banner when the user is offline.
 * Automatically hides when connection is restored.
 */
export function OfflineIndicator() {
  const { isOffline } = useNetworkStatus()

  if (!isOffline) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" aria-hidden="true" />
        <span>You're offline. Check your internet connection.</span>
      </div>
    </div>
  )
}
