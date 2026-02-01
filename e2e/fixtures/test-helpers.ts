import { Page } from '@playwright/test'

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}

export async function logout(page: Page) {
  await page.click('button[aria-label="User menu"]')
  await page.click('text=Logout')
  await page.waitForURL('/login')
}

export async function createTestUser() {
  const email = `test-${Date.now()}@example.com`
  const password = 'TestPassword123!'
  return { email, password }
}

export async function uploadDocument(page: Page, filePath: string) {
  await page.goto('/dashboard/documents')
  await page.click('text=Upload Document')

  const fileInput = await page.locator('input[type="file"]')
  await fileInput.setInputFiles(filePath)

  await page.click('button:has-text("Upload")')
  await page.waitForSelector('text=Upload complete')
}
