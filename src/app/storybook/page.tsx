'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { storybookService, StorybookData } from '@/services/storybookService'
import { Book, Plus, Trash2, Loader2, Calendar, Image as ImageIcon } from 'lucide-react'

export default function StorybookDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [storybooks, setStorybooks] = useState<StorybookData[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadStorybooks()
    }
  }, [user])

  const loadStorybooks = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userStorybooks = await storybookService.getUserStorybooks(user.uid)
      setStorybooks(userStorybooks)
    } catch (error) {
      console.error('Error loading storybooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storybookId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this storybook?')) {
      return
    }

    try {
      setDeletingId(storybookId)
      await storybookService.deleteStorybook(storybookId)
      setStorybooks(storybooks.filter((sb) => sb.id !== storybookId))
    } catch (error) {
      console.error('Error deleting storybook:', error)
      alert('Failed to delete storybook')
    } finally {
      setDeletingId(null)
    }
  }

  const handleStorybookClick = (storybookId: string) => {
    router.push(`/storybook/create?id=${storybookId}`)
  }

  const handleNewStorybook = () => {
    router.push('/storybook/create')
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  if (authLoading || !user) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-[#212121]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Storybooks
          </h1>
        </div>
        <button
          onClick={handleNewStorybook}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Storybook
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-[#2f2f2f] rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {storybooks.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Storybooks</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2f2f2f] rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded">
                <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {storybooks.reduce((sum, sb) => sum + (sb.input?.images?.length || 0), 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Images</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2f2f2f] rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {storybooks.length > 0
                    ? new Date(
                        Math.max(...storybooks.map((c) => {
                          const date = c.updatedAt?.toDate ? c.updatedAt.toDate() : new Date(c.updatedAt as any)
                          return date.getTime()
                        }))
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Last Activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Storybooks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : storybooks.length === 0 ? (
          <div className="bg-white dark:bg-[#2f2f2f] rounded border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Book className="w-14 h-14 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No storybooks yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Create your first pregnancy journey storybook with AI-generated stories and images
            </p>
            <button
              onClick={handleNewStorybook}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Storybook
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storybooks.map((storybook) => (
              <div
                key={storybook.id}
                onClick={() => handleStorybookClick(storybook.id!)}
                className="bg-white dark:bg-[#2f2f2f] rounded border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors group"
              >
                {/* Image Preview */}
                {storybook.input?.images && storybook.input.images.length > 0 && (
                  <div className="mb-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 h-40">
                    <img
                      src={storybook.input.images[0].url}
                      alt={storybook.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Book className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {storybook.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(storybook.id!, e)}
                    disabled={deletingId === storybook.id}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {deletingId === storybook.id ? (
                      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {storybook.output?.generatedText
                    ? storybook.output.generatedText.substring(0, 100) + '...'
                    : storybook.input?.text?.substring(0, 100) + '...' || 'No description'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {storybook.input?.images?.length || 0} images
                  </span>
                  <span>
                    {storybook.input?.tone && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {storybook.input.tone}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
