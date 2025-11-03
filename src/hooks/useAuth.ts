/**
 * Enhanced Authentication Hook
 * 
 * Provides improved auth state management with:
 * - Loading states
 * - Error handling
 * - Session persistence
 * - Auto-refresh
 */

import { useState } from 'react'
import { User } from 'firebase/auth'
import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useNotificationStore } from '@/stores'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
  isAuthenticated: boolean
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
} {
  const { user, loading: contextLoading, logout: contextLogout } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { success, error: showError } = useNotificationStore()

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      
      await signInWithEmailAndPassword(auth, email, password)
      success('Successfully signed in!')
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(err as Error)
      showError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    
    try {
      await contextLogout()
      success('Successfully signed out')
    } catch (err) {
      showError('Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      
      await createUserWithEmailAndPassword(auth, email, password)
      success('Account created successfully!')
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(err as Error)
      showError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      
      await sendPasswordResetEmail(auth, email)
      success('Password reset email sent!')
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err)
      setError(err as Error)
      showError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading: contextLoading || loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    signUp,
    resetPassword,
  }
}

/**
 * Convert Firebase auth errors to user-friendly messages
 */
function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'An unknown error occurred'
  
  const errorCode = (error as any).code
  
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed'
    case 'auth/requires-recent-login':
      return 'Please log in again to continue'
    default:
      return error.message || 'Authentication failed'
  }
}
