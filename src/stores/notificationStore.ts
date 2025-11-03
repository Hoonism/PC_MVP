import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  
  // Convenience methods
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`
    const newNotification = { id, ...notification }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))
    
    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, notification.duration || 5000)
    }
  },
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
  
  // Convenience methods
  success: (message, duration) =>
    useNotificationStore.getState().addNotification({
      type: 'success',
      message,
      duration,
    }),
  
  error: (message, duration) =>
    useNotificationStore.getState().addNotification({
      type: 'error',
      message,
      duration,
    }),
  
  warning: (message, duration) =>
    useNotificationStore.getState().addNotification({
      type: 'warning',
      message,
      duration,
    }),
  
  info: (message, duration) =>
    useNotificationStore.getState().addNotification({
      type: 'info',
      message,
      duration,
    }),
}))
