/**
 * Type-Safe Chat API Service
 * 
 * Example of using the new API client with proper types and error handling.
 * This replaces direct fetch calls with a more robust solution.
 */

import { apiClient } from '@/lib/apiClient'
import {
  ChatRequest,
  ChatResponse,
  ChatRequestSchema,
  ChatResponseSchema,
} from '@/types/api'
import { useNotificationStore } from '@/stores'

// ============================================================================
// Chat API Methods
// ============================================================================

/**
 * Send a chat message and get AI response
 * 
 * Features:
 * - Automatic retry on failure
 * - Type validation
 * - Proper error handling
 * - Request cancellation support
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    // Validate request before sending
    const validatedRequest = ChatRequestSchema.parse(request)
    
    // Make type-safe API call with retry logic
    const response = await apiClient.post<ChatResponse>(
      '/chat',
      validatedRequest,
      ChatResponseSchema
    )
    
    return response
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to send message'
    
    // Show user-friendly error notification
    useNotificationStore.getState().error(errorMessage)
    
    throw error
  }
}

/**
 * Cancel all pending chat requests
 * Useful when user navigates away or starts a new chat
 */
export function cancelPendingChatRequests(): void {
  apiClient.cancelAll()
}

// ============================================================================
// Example Usage in Components
// ============================================================================

/*

// Before (using fetch directly):
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, userId }),
})
const data = await response.json() // No type safety!

// After (using type-safe API client):
const response = await sendChatMessage({
  messages: messages.map(m => ({
    role: m.role,
    content: m.content,
  })),
  userId: user?.uid,
  billFileName: selectedFile?.name,
})
// response is typed as ChatResponse!

*/

// ============================================================================
// Network-Aware Chat Hook
// ============================================================================

import { useNetworkStatus } from '@/lib/apiClient'
import { useEffect } from 'react'

/**
 * Hook to handle offline state in chat
 */
export function useChatNetworkStatus() {
  const { isOnline, isOffline } = useNetworkStatus()
  const { warning } = useNotificationStore()

  useEffect(() => {
    if (isOffline) {
      warning('You are offline. Messages will be sent when you reconnect.')
    }
  }, [isOffline, warning])

  return { isOnline, isOffline }
}
