import { test, expect } from '@playwright/test'
import { createTestUser, login, logout } from './fixtures/test-helpers'

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    const { email, password } = await createTestUser()

    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should login existing user', async ({ page }) => {
    const { email, password } = await createTestUser()

    // First create the user
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Logout
    await logout(page)

    // Login again
    await login(page, email, password)
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    const { email, password } = await createTestUser()

    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')

    await logout(page)
    await expect(page).toHaveURL('/login')
  })

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('/dashboard')
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})
