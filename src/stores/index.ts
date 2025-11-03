/**
 * Centralized state management using Zustand
 * 
 * This file exports all stores for easy importing throughout the app.
 * Each store is responsible for a specific domain of state.
 */

export { useChatStore } from './chatStore'
export { useUIStore } from './uiStore'
export { useNotificationStore } from './notificationStore'

// Re-export types
export type { NotificationType } from './notificationStore'
