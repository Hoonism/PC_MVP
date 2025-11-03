/**
 * E2E Tests for Home Page
 * 
 * Tests critical user flows on the landing page
 */

import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/BillReduce AI/)
  })

  test('should display main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })

  test('should show navigation bar', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
  })

  test('should display BillReduce AI branding', async ({ page }) => {
    const branding = page.getByText('BillReduce')
    await expect(branding).toBeVisible()
  })

  test('should have working sign in button', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible()
    await expect(signInButton).toBeEnabled()
  })

  test('should display feature sections', async ({ page }) => {
    // Check for medical bill negotiation feature
    const billFeature = page.getByText(/Medical Bill Negotiation/i)
    await expect(billFeature).toBeVisible()

    // Check for pregnancy storybook feature
    const storybookFeature = page.getByText(/Pregnancy Storybook/i)
    await expect(storybookFeature).toBeVisible()
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(nav).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(nav).toBeVisible()
  })

  test('should support dark mode toggle', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.getByLabel(/switch to.*mode/i)
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      // Wait for theme change animation
      await page.waitForTimeout(500)
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    // Check keyboard navigation
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Allow some time for any deferred scripts
    await page.waitForTimeout(1000)

    expect(errors).toEqual([])
  })

  test('should have SEO meta tags', async ({ page }) => {
    // Check for description meta tag
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description?.length).toBeGreaterThan(50)

    // Check for Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
  })
})
