'use client'

import { useNotificationStore } from '@/stores'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore()

  if (notifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" aria-hidden="true" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" aria-hidden="true" />
      default:
        return null
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-5 ${getStyles(
            notification.type
          )}`}
          role="alert"
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        >
          {getIcon(notification.type)}
          <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">
            {notification.message}
          </p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
