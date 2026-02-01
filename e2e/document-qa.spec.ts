import { test, expect } from '@playwright/test'
import { createTestUser, login, uploadDocument } from './fixtures/test-helpers'
import path from 'path'

test.describe('Document Q&A', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = await createTestUser()
    await page.goto('/signup')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button[type="submit"]')
  })

  test('should upload and process document', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')

    await uploadDocument(page, testFilePath)

    // Verify document appears in list
    await expect(page.locator('text=test-document.txt')).toBeVisible()
  })

  test('should ask question about uploaded document', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')
    await uploadDocument(page, testFilePath)

    // Navigate to Q&A
    await page.click('text=Ask Question')

    // Type question
    await page.fill('textarea[placeholder*="question"]', 'What is this document about?')
    await page.click('button:has-text("Ask")')

    // Wait for response
    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Verify answer appears
    const answer = await page.locator('[data-testid="answer"]').textContent()
    expect(answer).toBeTruthy()
    expect(answer!.length).toBeGreaterThan(0)
  })

  test('should show citations in answer', async ({ page }) => {
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.txt')
    await uploadDocument(page, testFilePath)

    await page.click('text=Ask Question')
    await page.fill('textarea[placeholder*="question"]', 'Summarize the key points')
    await page.click('button:has-text("Ask")')

    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Check for citations
    await expect(page.locator('text=Sources:')).toBeVisible()
    await expect(page.locator('[data-testid="citation"]')).toHaveCount.greaterThan(0)
  })

  test('should handle multiple documents', async ({ page }) => {
    const file1 = path.join(__dirname, 'fixtures', 'document1.txt')
    const file2 = path.join(__dirname, 'fixtures', 'document2.txt')

    await uploadDocument(page, file1)
    await uploadDocument(page, file2)

    // Verify both documents listed
    await expect(page.locator('text=document1.txt')).toBeVisible()
    await expect(page.locator('text=document2.txt')).toBeVisible()

    // Ask question spanning both documents
    await page.click('text=Ask Question')
    await page.fill('textarea', 'Compare the content of both documents')
    await page.click('button:has-text("Ask")')

    await page.waitForSelector('text=Answer:', { timeout: 30000 })

    // Should cite both documents
    const citations = await page.locator('[data-testid="citation"]').count()
    expect(citations).toBeGreaterThanOrEqual(2)
  })
})
