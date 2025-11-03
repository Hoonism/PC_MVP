import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatState {
  // State
  messages: Message[]
  currentChatId?: string
  selectedFile: File | null
  isLoading: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  
  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  clearMessages: () => void
  setCurrentChatId: (id?: string) => void
  setSelectedFile: (file: File | null) => void
  setIsLoading: (loading: boolean) => void
  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
  resetChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Initial state
      messages: [],
      currentChatId: undefined,
      selectedFile: null,
      isLoading: false,
      autoSaveStatus: 'idle',
      
      // Actions
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => 
        set((state) => ({ messages: [...state.messages, message] })),
      
      clearMessages: () => set({ messages: [] }),
      
      setCurrentChatId: (id) => set({ currentChatId: id }),
      
      setSelectedFile: (file) => set({ selectedFile: file }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
      
      resetChat: () => set({
        messages: [],
        currentChatId: undefined,
        selectedFile: null,
        isLoading: false,
        autoSaveStatus: 'idle',
      }),
    }),
    {
      name: 'chat-storage',
      // Only persist certain fields
      partialize: (state) => ({
        currentChatId: state.currentChatId,
      }),
    }
  )
)
