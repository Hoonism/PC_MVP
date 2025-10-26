'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Trash2, Loader2, Clock, FileText, Book, Upload, Sparkles, Heart, Image, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChats, deleteChat, ChatSession } from '@/services/chatService'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadChats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadChats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userChats = await getUserChats(user.uid)
      setChats(userChats)
    } catch (error) {
      console.error('Error loading chats:', error)
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
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your medical bill negotiations and pregnancy journey storybooks
          </p>
        </div>

        {/* Bill Negotiation Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bill Negotiation Chats
            </h2>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {chats.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Chats</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {chats.reduce((sum, chat) => sum + chat.messages.length, 0)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {chats.length > 0
                    ? new Date(
                        Math.max(...chats.map((c) => new Date(c.updatedAt).getTime()))
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Last Activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chats List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-12 text-center">
            <MessageSquare className="w-14 h-14 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No chats yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Start a new conversation to negotiate your medical bills
            </p>
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id!)}
                className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                      {chat.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(chat.id!, e)}
                    disabled={deletingId === chat.id}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {deletingId === chat.id ? (
                      <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
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
    </div>
  )
}
