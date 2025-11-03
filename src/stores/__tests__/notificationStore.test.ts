/**
 * Unit Tests for Notification Store
 */

import { useNotificationStore } from '../notificationStore'

describe('notificationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useNotificationStore.setState({ notifications: [] })
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('addNotification', () => {
    it('should add a notification', () => {
      const { addNotification } = useNotificationStore.getState()

      addNotification({
        type: 'success',
        message: 'Operation successful',
      })

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]?.message).toBe('Operation successful')
      expect(notifications[0]?.type).toBe('success')
    })

    it('should generate unique IDs for notifications', () => {
      const { addNotification } = useNotificationStore.getState()

      addNotification({ type: 'info', message: 'First' })
      addNotification({ type: 'info', message: 'Second' })

      const { notifications } = useNotificationStore.getState()
      expect(notifications[0]?.id).not.toBe(notifications[1]?.id)
    })

    it('should auto-remove notification after default duration', () => {
      const { addNotification } = useNotificationStore.getState()

      addNotification({
        type: 'success',
        message: 'Test',
      })

      expect(useNotificationStore.getState().notifications).toHaveLength(1)

      // Fast-forward 5 seconds (default duration)
      jest.advanceTimersByTime(5000)

      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })

    it('should auto-remove notification after custom duration', () => {
      const { addNotification } = useNotificationStore.getState()

      addNotification({
        type: 'success',
        message: 'Test',
        duration: 3000,
      })

      expect(useNotificationStore.getState().notifications).toHaveLength(1)

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000)

      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })

    it('should not auto-remove notification when duration is 0', () => {
      const { addNotification } = useNotificationStore.getState()

      addNotification({
        type: 'error',
        message: 'Permanent error',
        duration: 0,
      })

      expect(useNotificationStore.getState().notifications).toHaveLength(1)

      // Fast-forward a long time
      jest.advanceTimersByTime(10000)

      // Should still be there
      expect(useNotificationStore.getState().notifications).toHaveLength(1)
    })
  })

  describe('removeNotification', () => {
    it('should remove a specific notification', () => {
      const { addNotification, removeNotification } = useNotificationStore.getState()

      addNotification({ type: 'info', message: 'First' })
      addNotification({ type: 'info', message: 'Second' })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications).toHaveLength(2)

      const firstId = notifications[0]?.id
      if (firstId) {
        removeNotification(firstId)
      }

      const updatedNotifications = useNotificationStore.getState().notifications
      expect(updatedNotifications).toHaveLength(1)
      expect(updatedNotifications[0]?.message).toBe('Second')
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications', () => {
      const { addNotification, clearAll } = useNotificationStore.getState()

      addNotification({ type: 'info', message: 'First' })
      addNotification({ type: 'info', message: 'Second' })
      addNotification({ type: 'info', message: 'Third' })

      expect(useNotificationStore.getState().notifications).toHaveLength(3)

      clearAll()

      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })
  })

  describe('convenience methods', () => {
    it('should add success notification', () => {
      const { success } = useNotificationStore.getState()

      success('Success message')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]?.type).toBe('success')
      expect(notifications[0]?.message).toBe('Success message')
    })

    it('should add error notification', () => {
      const { error } = useNotificationStore.getState()

      error('Error message')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]?.type).toBe('error')
      expect(notifications[0]?.message).toBe('Error message')
    })

    it('should add warning notification', () => {
      const { warning } = useNotificationStore.getState()

      warning('Warning message')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]?.type).toBe('warning')
      expect(notifications[0]?.message).toBe('Warning message')
    })

    it('should add info notification', () => {
      const { info } = useNotificationStore.getState()

      info('Info message')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]?.type).toBe('info')
      expect(notifications[0]?.message).toBe('Info message')
    })

    it('should accept custom duration in convenience methods', () => {
      const { success } = useNotificationStore.getState()

      success('Test', 1000)

      expect(useNotificationStore.getState().notifications).toHaveLength(1)

      jest.advanceTimersByTime(1000)

      expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })
  })
})
