'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Loader2, Menu, X, Plus, FileText, Paperclip, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { saveChat, updateChat, generateChatTitle, ChatSession, getChat } from '@/services/chatService'
import SavedChats from '@/components/SavedChats'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Starter prompts for new conversations
const STARTER_PROMPTS = [
  {
    title: "Analyze my bill",
    description: "Help me understand charges and find errors"
  },
  {
    title: "Draft negotiation message",
    description: "Write a professional letter to reduce costs"
  },
  {
    title: "Payment plan options",
    description: "Explore affordable payment arrangements"
  },
  {
    title: "Insurance questions",
    description: "Understand my coverage and claims"
  }
]

function ChatPageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined)
  const [saveKey, setSaveKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get('id')
    if (chatId && user) {
      loadChatById(chatId)
    }
  }, [searchParams, user])

  const loadChatById = async (chatId: string) => {
    try {
      const chat = await getChat(chatId)
      if (chat) {
        setMessages(chat.messages)
        setCurrentChatId(chat.id)
      }
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-save effect
  useEffect(() => {
    if (!user || messages.length === 0 || isLoading) {
      return
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveChat()
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [messages, user, isLoading])

  const autoSaveChat = async () => {
    if (!user || messages.length === 0) return

    try {
      const title = generateChatTitle(messages)

      if (currentChatId) {
        await updateChat(currentChatId, title, messages)
      } else {
        const chatId = await saveChat(user.uid, title, messages)
        setCurrentChatId(chatId)
      }

      setSaveKey((prev) => prev + 1)
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        alert('Please upload a valid file (JPG, PNG, or PDF)')
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAIResponse = async (currentMessages: Message[]): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          billFileName: selectedFile?.name,
          userId: user?.uid,
        }),
      })

      const maybeJson = await response.json().catch(() => null)
      if (!response.ok) {
        const reason = (maybeJson && (maybeJson.error || maybeJson.details)) || 'Failed to get AI response'
        throw new Error(reason)
      }

      const data = maybeJson
      const content = data?.message || 'No response received.'
      
      return content
    } catch (error: any) {
      console.error('Error calling AI API:', error)
      const message = typeof error?.message === 'string' ? error.message : 'Unknown error'
      return `Connection error: ${message}`
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue('')
    setIsLoading(true)

    const response = await getAIResponse(updatedMessages)
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    setMessages([...updatedMessages, aiMessage])
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLoadChat = (chat: ChatSession) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(undefined)
    setSelectedFile(null)
    setSidebarOpen(false)
  }

  const handleStarterPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  return (
    <div className="h-full flex flex-row overflow-hidden bg-[#212121]">
      {/* Collapsible Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#171717] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-lg font-semibold text-white">
                  BillReduce
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New chat</span>
            </button>
          </div>

          {/* Saved Chats List */}
          <div className="flex-1 overflow-y-auto p-2">
            <SavedChats key={saveKey} onLoadChat={handleLoadChat} currentChatId={currentChatId} />
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              BillReduce AI
            </h2>
          </div>
          {user && (
            <div className="text-sm text-gray-400">
              {user.email}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Welcome Screen with Starter Prompts */
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  How can I help you today?
                </h1>
                <p className="text-gray-400">
                  I'm here to help you negotiate and reduce your medical bills
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {STARTER_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterPrompt(prompt.title)}
                    className="p-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-lg text-left transition-colors border border-gray-700"
                  >
                    <div className="text-white font-medium mb-1">{prompt.title}</div>
                    <div className="text-sm text-gray-400">{prompt.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto w-full px-4 py-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="max-w-[80%] bg-[#2f2f2f] rounded-2xl px-4 py-3">
                      <div className="text-white whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            {selectedFile && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-[#2f2f2f] rounded-lg">
                <Paperclip className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-300 flex-1 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
            <div className="flex gap-2 items-end bg-[#2f2f2f] rounded-2xl p-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 text-gray-400" />
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message BillReduce AI..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none px-2 py-2 max-h-32"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-white hover:bg-gray-200 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              BillReduce AI can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#212121]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
