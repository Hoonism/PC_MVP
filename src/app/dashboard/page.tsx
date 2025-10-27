'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Trash2, Loader2, Clock, FileText, Book, Upload, Sparkles, Heart, Image, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChats, deleteChat, ChatSession } from '@/services/chatService'
import { storybookService, StorybookData } from '@/services/storybookService'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [storybooks, setStorybooks] = useState<StorybookData[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [userChats, userStorybooks] = await Promise.all([
        getUserChats(user.uid),
        storybookService.getUserStorybooks(user.uid)
      ])
      setChats(userChats)
      setStorybooks(userStorybooks)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this chat?')) {
      return
    }

    try {
      setDeletingId(chatId)
      await deleteChat(chatId)
      setChats(chats.filter((chat) => chat.id !== chatId))
    } catch (error) {
      console.error('Error deleting chat:', error)
      alert('Failed to delete chat')
    } finally {
      setDeletingId(null)
    }
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/chat?id=${chatId}`)
  }

  const handleNewChat = () => {
    router.push('/chat')
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
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Welcome</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">Hi, {displayName}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 dark:bg-transparent dark:border-blue-800 dark:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button
                onClick={() => router.push('/storybook')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 dark:bg-transparent dark:border-purple-800 dark:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Storybook
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">

        {/* Overview Stats */
        }
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bill Chats */}
            <div className="rounded-lg p-5 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500/70 dark:border-l-blue-500/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {chats.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bill Chats</p>
                </div>
              </div>
            </div>

            {/* Storybooks */}
            <div className="rounded-lg p-5 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 border-l-4 border-l-purple-500/70 dark:border-l-purple-500/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {storybooks.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Storybooks</p>
                </div>
              </div>
            </div>

            {/* Total Messages */}
            <div className="rounded-lg p-5 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 border-l-4 border-l-emerald-500/70 dark:border-l-emerald-500/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {chats.reduce((sum, chat) => sum + chat.messages.length, 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Messages</p>
                </div>
              </div>
            </div>

            {/* Total Images */}
            <div className="rounded-lg p-5 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500/70 dark:border-l-orange-500/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                  <Image className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {storybooks.reduce((sum, sb) => sum + (sb.input.images?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Photos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bill Negotiation Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bill Negotiation Chats
              </h2>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 dark:bg-transparent dark:border-blue-800 dark:text-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            {/* Chats List */}
            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : chats.length === 0 ? (
              <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-900 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No chats yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Start negotiating your medical bills
                </p>
                <button
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 dark:bg-transparent dark:border-blue-800 dark:text-blue-300 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Start Your First Chat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id!)}
                    className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500/50 dark:border-l-blue-500/50 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3f3f3f] transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => handleDelete(chat.id!, e)}
                        disabled={deletingId === chat.id}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity disabled:opacity-50 flex-shrink-0"
                      >
                        {deletingId === chat.id ? (
                          <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {chat.messages.find((m) => m.role === 'user')?.content || 'No messages'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{chat.messages.length} messages</span>
                      <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storybook Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pregnancy Storybooks
              </h2>
              <button
                onClick={() => router.push('/storybook')}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 dark:bg-transparent dark:border-purple-800 dark:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            {/* Storybooks List */}
            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : storybooks.length === 0 ? (
              <div className="bg-white dark:bg-[#2f2f2f] rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-900 p-8 text-center">
                <Book className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No storybooks yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create your first pregnancy journey
                </p>
                <button
                  onClick={() => router.push('/storybook/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-purple-200 text-purple-700 bg-white hover:bg-purple-50 dark:bg-transparent dark:border-purple-800 dark:text-purple-300 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Storybook
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {storybooks.map((storybook) => (
                  <div
                    key={storybook.id}
                    onClick={() => router.push(`/storybook?id=${storybook.id}`)}
                    className="bg-white dark:bg-[#2f2f2f] rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 border-l-purple-500/50 dark:border-l-purple-500/50 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3f3f3f] transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Book className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {storybook.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {storybook.input.text || 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{storybook.input.images?.length || 0} photos</span>
                      <span>{new Date(storybook.updatedAt.toDate()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
