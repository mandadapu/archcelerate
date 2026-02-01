import { test, expect } from '@playwright/test'
import { createTestUser } from './fixtures/test-helpers'

test.describe('Agent Execution', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = await createTestUser()
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
  })

  test('should execute research agent', async ({ page }) => {
    await page.goto('/dashboard/agents')

    // Select research agent
    await page.click('text=Research Agent')

    // Enter task
    await page.fill(
      'textarea[placeholder*="task"]',
      'Research the benefits of TypeScript'
    )

    // Start execution
    await page.click('button:has-text("Run Agent")')

    // Wait for execution to complete
    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // Verify output
    const output = await page.locator('[data-testid="agent-output"]').textContent()
    expect(output).toContain('TypeScript')
  })

  test('should show agent execution trace', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Quick research task')
    await page.click('button:has-text("Run Agent")')

    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // View trace
    await page.click('text=View Trace')

    // Verify steps shown
    await expect(page.locator('text=Step 1:')).toBeVisible()
    await expect(page.locator('text=Thought:')).toBeVisible()
    await expect(page.locator('text=Action:')).toBeVisible()
    await expect(page.locator('text=Observation:')).toBeVisible()
  })

  test('should track agent metrics', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Test metrics tracking')
    await page.click('button:has-text("Run Agent")')

    await page.waitForSelector('text=Status: completed', { timeout: 60000 })

    // Check metrics displayed
    await expect(page.locator('text=Iterations:')).toBeVisible()
    await expect(page.locator('text=Tokens:')).toBeVisible()
    await expect(page.locator('text=Cost:')).toBeVisible()
  })

  test('should allow stopping agent execution', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Research Agent')

    await page.fill('textarea', 'Long running task')
    await page.click('button:has-text("Run Agent")')

    // Wait a moment then stop
    await page.waitForTimeout(2000)
    await page.click('button:has-text("Stop")')

    // Verify stopped status
    await expect(page.locator('text=Status: stopped')).toBeVisible()
  })
})
