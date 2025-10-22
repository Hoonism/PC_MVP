'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Upload, X, Send, Copy, Check, Loader2, GripVertical, Save, Plus, FolderOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { saveChat, updateChat, generateChatTitle, ChatSession, getChat } from '@/services/chatService'
import SavedChats from '@/components/SavedChats'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Simple markdown formatter for bold text
function formatMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function ChatPageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! Please upload your medical bill to get started.',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [finalMessage, setFinalMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [leftWidth, setLeftWidth] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedChats, setShowSavedChats] = useState(false)
  const [saveKey, setSaveKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Constrain between 20% and 80%
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (validTypes.includes(file.type)) {
      setSelectedFile(file)
    } else {
      alert('Please upload a valid file (JPG, PNG, or PDF)')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
          userId: user?.uid, // Pass user ID for personalized prompting
        }),
      })

      const maybeJson = await response.json().catch(() => null)
      if (!response.ok) {
        const reason = (maybeJson && (maybeJson.error || maybeJson.details)) || 'Failed to get AI response'
        throw new Error(reason)
      }

      const data = maybeJson
      const content = data?.message || 'No response received.'
      
      // Check if the response contains a draft message that should be copyable
      // Look for common professional message patterns
      const isDraftMessage = 
        (content.includes('Dear') || content.includes('To Whom It May Concern')) &&
        (content.includes('Sincerely') || content.includes('Best regards') || 
         content.includes('Respectfully') || content.includes('Thank you'))
      
      // Also detect if it's a structured message with subject line
      const hasSubjectLine = content.includes('Subject:') || content.includes('Re:')
      
      if (isDraftMessage || hasSubjectLine) {
        setFinalMessage(content)
      }
      
      return content
    } catch (error: any) {
      console.error('Error calling AI API:', error)
      const message = typeof error?.message === 'string' ? error.message : 'Unknown error'
      return `Connection error: ${message}`
    }
  }

  const handleAnalyzeBill = async () => {
    if (!selectedFile) {
      alert('Please upload a file first')
      return
    }

    setIsLoading(true)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I've uploaded my medical bill: ${selectedFile.name}. Can you help me analyze it and draft a message to negotiate the charges?`,
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
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

  const copyToClipboard = async () => {
    if (finalMessage) {
      await navigator.clipboard.writeText(finalMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveChat = async () => {
    if (!user) {
      alert('Please sign in to save chats')
      return
    }

    if (messages.length <= 1) {
      alert('No messages to save')
      return
    }

    try {
      setIsSaving(true)
      const title = generateChatTitle(messages)

      if (currentChatId) {
        await updateChat(currentChatId, title, messages)
      } else {
        const chatId = await saveChat(user.uid, title, messages)
        setCurrentChatId(chatId)
      }

      // Trigger refresh of saved chats
      setSaveKey((prev) => prev + 1)
      alert('Chat saved successfully!')
    } catch (error) {
      console.error('Error saving chat:', error)
      alert('Failed to save chat')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadChat = (chat: ChatSession) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setShowSavedChats(false)
  }

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! Please upload your medical bill to get started.',
        timestamp: new Date(),
      },
    ])
    setCurrentChatId(undefined)
    setSelectedFile(null)
    setFinalMessage(null)
    setShowSavedChats(false)
  }

  return (
    <div ref={containerRef} className="h-full flex flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - File Upload and Saved Chats */}
      <div 
        className="flex flex-col gap-4 h-full min-h-0 p-5 bg-white dark:bg-gray-800"
        style={{ width: `${leftWidth}%` }}
      >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {showSavedChats ? 'Saved Chats' : 'Upload Bill'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavedChats(!showSavedChats)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={showSavedChats ? 'Show Upload' : 'Show Saved Chats'}
              >
                {showSavedChats ? <Upload className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
              </button>
              {showSavedChats && (
                <button
                  onClick={handleNewChat}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="New Chat"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {showSavedChats ? (
            <div className="flex-1 min-h-0 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-4">
              <SavedChats key={saveKey} onLoadChat={handleLoadChat} currentChatId={currentChatId} />
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 min-h-0 border-2 border-dashed rounded transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {selectedFile ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-5 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                          <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <button
                      onClick={handleAnalyzeBill}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Bill'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center mb-3">
                    <Upload className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Drop file here
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or click to browse
                  </p>
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
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    JPG, PNG, or PDF
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Resizable Divider */}
      <div
        className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 cursor-col-resize relative group flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <GripVertical className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100" />
      </div>

      {/* Right Panel - Chat Interface */}
      <div 
        className="flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-800 p-5"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Chat
            </h2>
            <div className="flex items-center gap-2">
              {user && messages.length > 1 && (
                <button
                  onClick={handleSaveChat}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>{currentChatId ? 'Update' : 'Save'}</span>
                    </>
                  )}
                </button>
              )}
              {finalMessage && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Messages (internal scroller) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{formatMarkdown(message.content)}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input (sticky at the bottom of the right panel) */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type message..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
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
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
