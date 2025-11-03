/**
 * Integration Tests for NotificationToast Component
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationToast } from '../NotificationToast'
import { useNotificationStore } from '@/stores'

describe('NotificationToast', () => {
  beforeEach(() => {
    // Reset notifications before each test
    useNotificationStore.setState({ notifications: [] })
  })

  it('should not render when there are no notifications', () => {
    const { container } = render(<NotificationToast />)
    expect(container.firstChild).toBeNull()
  })

  it('should render success notification', () => {
    useNotificationStore.getState().success('Operation successful')

    render(<NotificationToast />)

    expect(screen.getByText('Operation successful')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should render error notification', () => {
    useNotificationStore.getState().error('Something went wrong')

    render(<NotificationToast />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render warning notification', () => {
    useNotificationStore.getState().warning('Please be careful')

    render(<NotificationToast />)

    expect(screen.getByText('Please be careful')).toBeInTheDocument()
  })

  it('should render info notification', () => {
    useNotificationStore.getState().info('Helpful information')

    render(<NotificationToast />)

    expect(screen.getByText('Helpful information')).toBeInTheDocument()
  })

  it('should render multiple notifications', () => {
    useNotificationStore.getState().success('First notification')
    useNotificationStore.getState().error('Second notification')
    useNotificationStore.getState().info('Third notification')

    render(<NotificationToast />)

    expect(screen.getByText('First notification')).toBeInTheDocument()
    expect(screen.getByText('Second notification')).toBeInTheDocument()
    expect(screen.getByText('Third notification')).toBeInTheDocument()
  })

  it('should dismiss notification when close button is clicked', async () => {
    const user = userEvent.setup()
    useNotificationStore.getState().success('Test notification')

    render(<NotificationToast />)

    expect(screen.getByText('Test notification')).toBeInTheDocument()

    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)

    await waitFor(() => {
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
    })
  })

  it('should have correct ARIA attributes for success', () => {
    useNotificationStore.getState().success('Success!')

    render(<NotificationToast />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'polite')
  })

  it('should have correct ARIA attributes for error', () => {
    useNotificationStore.getState().error('Error!')

    render(<NotificationToast />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('should render with correct icon for each type', () => {
    const { rerender } = render(<NotificationToast />)

    // Success
    useNotificationStore.getState().success('Success')
    rerender(<NotificationToast />)
    expect(screen.getByText('Success').closest('div')).toBeInTheDocument()

    // Error
    useNotificationStore.setState({ notifications: [] })
    useNotificationStore.getState().error('Error')
    rerender(<NotificationToast />)
    expect(screen.getByText('Error').closest('div')).toBeInTheDocument()

    // Warning
    useNotificationStore.setState({ notifications: [] })
    useNotificationStore.getState().warning('Warning')
    rerender(<NotificationToast />)
    expect(screen.getByText('Warning').closest('div')).toBeInTheDocument()

    // Info
    useNotificationStore.setState({ notifications: [] })
    useNotificationStore.getState().info('Info')
    rerender(<NotificationToast />)
    expect(screen.getByText('Info').closest('div')).toBeInTheDocument()
  })

  it('should be positioned in top-right corner', () => {
    useNotificationStore.getState().success('Test')

    const { container } = render(<NotificationToast />)

    const toastContainer = container.firstChild as HTMLElement
    expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4')
  })
})
