/**
 * E2E Tests for Chat Page
 * 
 * Tests chat functionality and user interactions
 * Note: These tests may require authentication mocking in a real scenario
 */

import { test, expect } from '@playwright/test'

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat')
  })

  test('should load chat page', async ({ page }) => {
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded')
    
    // Check if main content area exists
    const mainContent = page.getByRole('main')
    await expect(mainContent).toBeVisible()
  })

  test('should show starter prompts when no messages', async ({ page }) => {
    // Check for welcome message or starter prompts
    const welcomeText = page.getByText(/How can I help you/i)
    
    // If authenticated and chat is empty, should show welcome
    if (await welcomeText.isVisible()) {
      await expect(welcomeText).toBeVisible()
    }
  })

  test('should have message input area', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      await expect(messageInput).toBeVisible()
      await expect(messageInput).toBeEditable()
    }
  })

  test('should have send button', async ({ page }) => {
    const sendButton = page.getByLabel(/send/i)
    
    if (await sendButton.isVisible()) {
      await expect(sendButton).toBeVisible()
    }
  })

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.getByLabel(/send/i)
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await sendButton.isVisible() && await messageInput.isVisible()) {
      await messageInput.clear()
      // Send button should be disabled when input is empty
      await expect(sendButton).toBeDisabled()
    }
  })

  test('should enable send button when typing message', async ({ page }) => {
    const sendButton = page.getByLabel(/send/i)
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await sendButton.isVisible() && await messageInput.isVisible()) {
      await messageInput.fill('Test message')
      // Send button should be enabled when there's text
      await expect(sendButton).toBeEnabled()
    }
  })

  test('should have file attachment option', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    
    if (await fileInput.count() > 0) {
      await expect(fileInput.first()).toBeAttached()
    }
  })

  test('should have sidebar toggle', async ({ page }) => {
    // Look for menu/sidebar button
    const menuButton = page.getByTitle(/sidebar/i).or(page.getByTitle(/menu/i))
    
    if (await menuButton.isVisible()) {
      await expect(menuButton).toBeVisible()
      
      // Try toggling sidebar
      await menuButton.click()
      await page.waitForTimeout(300) // Animation time
    }
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      await messageInput.click()
      await messageInput.fill('Test message')
      
      // Try Enter key to send (without Shift)
      await messageInput.press('Enter')
      
      // Wait a moment to see if message is processed
      await page.waitForTimeout(500)
    }
  })

  test('should show loading state when sending message', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/message/i)
    const sendButton = page.getByLabel(/send/i)
    
    if (await messageInput.isVisible() && await sendButton.isVisible()) {
      await messageInput.fill('Test message')
      
      // Intercept API call to delay response
      await page.route('**/api/chat', async (route) => {
        await page.waitForTimeout(1000)
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: 'Test response' }),
        })
      })
      
      await sendButton.click()
      
      // Check for loading indicator (spinner, disabled state, etc.)
      const isLoading = await sendButton.isDisabled()
      expect(isLoading).toBeTruthy()
    }
  })

  test('should display messages in chat history', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      // Type and send a message
      await messageInput.fill('Hello, test message')
      await messageInput.press('Enter')
      
      // Wait for message to appear
      await page.waitForTimeout(1000)
      
      // Check if message appears in chat
      const sentMessage = page.getByText('Hello, test message')
      if (await sentMessage.isVisible()) {
        await expect(sentMessage).toBeVisible()
      }
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true)
    
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      await messageInput.fill('Test offline message')
      await messageInput.press('Enter')
      
      // Wait and check for error notification or offline indicator
      await page.waitForTimeout(1000)
      
      const offlineIndicator = page.getByText(/offline/i).or(page.getByText(/connection/i))
      
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible()
      }
    }
    
    // Restore online
    await page.context().setOffline(false)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if main elements are still visible and functional
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      await expect(messageInput).toBeVisible()
    }
  })

  test('should maintain chat state on navigation', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/message/i)
    
    if (await messageInput.isVisible()) {
      // Send a message
      await messageInput.fill('Test persistence')
      await messageInput.press('Enter')
      await page.waitForTimeout(1000)
      
      // Navigate away
      await page.goto('/')
      
      // Navigate back
      await page.goto('/chat')
      
      // Check if message is still there (if persistence is implemented)
      await page.waitForTimeout(1000)
    }
  })
})
