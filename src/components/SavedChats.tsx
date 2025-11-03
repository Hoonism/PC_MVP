'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { MessageSquare, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChats, deleteChat, ChatSession } from '@/services/chatService'

interface SavedChatsProps {
  onLoadChat: (chat: ChatSession) => void
  currentChatId?: string
}

function SavedChats({ onLoadChat, currentChatId }: SavedChatsProps) {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userChats = await getUserChats(user.uid)
      setChats(userChats)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDelete = useCallback(async (chatId: string, e: React.MouseEvent) => {
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
  }, [chats])

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Sign in to save and view your chats
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No saved chats yet
      </div>
    )
  }

  return (
    <nav className="space-y-1" aria-label="Saved chats">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onLoadChat(chat)}
          className={`p-2.5 rounded-lg cursor-pointer transition-colors group ${
            currentChatId === chat.id
              ? 'bg-gray-700'
              : 'hover:bg-gray-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">
                  {chat.title}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(chat.id!, e)}
              disabled={deletingId === chat.id}
              className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              {deletingId === chat.id ? (
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
              )}
            </button>
          </div>
        </div>
      ))}
    </nav>
  )
}

export default memo(SavedChats)
