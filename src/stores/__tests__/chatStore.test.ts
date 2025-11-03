/**
 * Unit Tests for Chat Store
 * 
 * Tests the Zustand chat store functionality
 */

import { useChatStore } from '../chatStore'

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      currentChatId: undefined,
      selectedFile: null,
      isLoading: false,
      autoSaveStatus: 'idle',
    })
  })

  describe('addMessage', () => {
    it('should add a message to the store', () => {
      const { addMessage } = useChatStore.getState()

      addMessage({
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      })

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0]?.content).toBe('Hello')
      expect(messages[0]?.role).toBe('user')
    })

    it('should add multiple messages', () => {
      const { addMessage } = useChatStore.getState()

      addMessage({
        id: '1',
        role: 'user',
        content: 'First',
        timestamp: new Date(),
      })

      addMessage({
        id: '2',
        role: 'assistant',
        content: 'Second',
        timestamp: new Date(),
      })

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(2)
      expect(messages[0]?.content).toBe('First')
      expect(messages[1]?.content).toBe('Second')
    })
  })

  describe('setMessages', () => {
    it('should replace all messages', () => {
      const { setMessages } = useChatStore.getState()

      const newMessages = [
        { id: '1', role: 'user' as const, content: 'Test', timestamp: new Date() },
        { id: '2', role: 'assistant' as const, content: 'Response', timestamp: new Date() },
      ]

      setMessages(newMessages)

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(2)
      expect(messages).toEqual(newMessages)
    })
  })

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const { addMessage, clearMessages } = useChatStore.getState()

      addMessage({
        id: '1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      })

      clearMessages()

      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(0)
    })
  })

  describe('setCurrentChatId', () => {
    it('should set the current chat ID', () => {
      const { setCurrentChatId } = useChatStore.getState()

      setCurrentChatId('chat-123')

      const { currentChatId } = useChatStore.getState()
      expect(currentChatId).toBe('chat-123')
    })

    it('should clear the current chat ID', () => {
      const { setCurrentChatId } = useChatStore.getState()

      setCurrentChatId('chat-123')
      setCurrentChatId(undefined)

      const { currentChatId } = useChatStore.getState()
      expect(currentChatId).toBeUndefined()
    })
  })

  describe('setIsLoading', () => {
    it('should set loading state', () => {
      const { setIsLoading } = useChatStore.getState()

      setIsLoading(true)
      expect(useChatStore.getState().isLoading).toBe(true)

      setIsLoading(false)
      expect(useChatStore.getState().isLoading).toBe(false)
    })
  })

  describe('setAutoSaveStatus', () => {
    it('should set auto-save status', () => {
      const { setAutoSaveStatus } = useChatStore.getState()

      setAutoSaveStatus('saving')
      expect(useChatStore.getState().autoSaveStatus).toBe('saving')

      setAutoSaveStatus('saved')
      expect(useChatStore.getState().autoSaveStatus).toBe('saved')

      setAutoSaveStatus('error')
      expect(useChatStore.getState().autoSaveStatus).toBe('error')

      setAutoSaveStatus('idle')
      expect(useChatStore.getState().autoSaveStatus).toBe('idle')
    })
  })

  describe('resetChat', () => {
    it('should reset all chat state', () => {
      const { addMessage, setCurrentChatId, setIsLoading, resetChat } = useChatStore.getState()

      // Set up some state
      addMessage({
        id: '1',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      })
      setCurrentChatId('chat-123')
      setIsLoading(true)

      // Reset
      resetChat()

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.currentChatId).toBeUndefined()
      expect(state.selectedFile).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.autoSaveStatus).toBe('idle')
    })
  })

  describe('setSelectedFile', () => {
    it('should set selected file', () => {
      const { setSelectedFile } = useChatStore.getState()

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      setSelectedFile(file)

      const { selectedFile } = useChatStore.getState()
      expect(selectedFile).toBe(file)
    })

    it('should clear selected file', () => {
      const { setSelectedFile } = useChatStore.getState()

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      setSelectedFile(file)
      setSelectedFile(null)

      const { selectedFile } = useChatStore.getState()
      expect(selectedFile).toBeNull()
    })
  })
})
