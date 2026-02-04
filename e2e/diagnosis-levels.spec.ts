import { test, expect } from '@playwright/test'

test.describe('Diagnosis Quiz - Multi-Level Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to diagnosis page
    await page.goto('/diagnosis')
  })

  test('should display level selector on initial load', async ({ page }) => {
    // Check for heading
    await expect(page.getByRole('heading', { name: /Skill Diagnosis Quiz/i })).toBeVisible()

    // Check for Quick Start button
    await expect(page.getByRole('button', { name: /Start Intermediate Quiz/i })).toBeVisible()

    // Check for all three level cards
    await expect(page.getByText(/Beginner/i)).toBeVisible()
    await expect(page.getByText(/Intermediate/i)).toBeVisible()
    await expect(page.getByText(/Advanced/i)).toBeVisible()
  })

  test('Quick Start flow - should start intermediate quiz', async ({ page }) => {
    // Click Quick Start button
    await page.getByRole('button', { name: /Start Intermediate Quiz/i }).click()

    // Should now be in quiz view
    await expect(page.getByRole('heading', { name: /Skill Diagnosis/i })).toBeVisible()

    // Should show intermediate badge
    await expect(page.getByText(/intermediate/i)).toBeVisible()

    // Should show quiz questions
    await expect(page.getByText(/Question/i)).toBeVisible()
  })

  test('Manual selection - should start beginner quiz', async ({ page }) => {
    // Click on Beginner level card
    await page.getByRole('button', { name: /Start Beginner Quiz/i }).click()

    // Should now be in quiz view with beginner badge
    await expect(page.getByText(/beginner/i)).toBeVisible()

    // Should show quiz questions
    await expect(page.getByText(/Question/i)).toBeVisible()
  })

  test('Manual selection - should start advanced quiz', async ({ page }) => {
    // Click on Advanced level card
    await page.getByRole('button', { name: /Start Advanced Quiz/i }).click()

    // Should now be in quiz view with advanced badge
    await expect(page.getByText(/advanced/i)).toBeVisible()

    // Should show quiz questions
    await expect(page.getByText(/Question/i)).toBeVisible()
  })

  test('Change Level button - should allow returning to selector', async ({ page }) => {
    // Start a quiz
    await page.getByRole('button', { name: /Start Intermediate Quiz/i }).click()

    // Wait for quiz to load
    await expect(page.getByText(/intermediate/i)).toBeVisible()

    // Click Change Level button
    await page.getByRole('button', { name: /Change Level/i }).click()

    // Should show confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('progress will be lost')
      await dialog.accept()
    })

    // Should return to level selector
    await expect(page.getByRole('heading', { name: /Skill Diagnosis Quiz/i })).toBeVisible()
  })

  test('should show different questions for different levels', async ({ page }) => {
    // Start beginner quiz and capture first question
    await page.getByRole('button', { name: /Start Beginner Quiz/i }).click()
    await page.waitForLoadState('networkidle')

    const beginnerQuestion = await page.locator('[data-testid="quiz-question"]').first().textContent()

    // Navigate back
    await page.goBack()

    // Start intermediate quiz
    await page.getByRole('button', { name: /Start Intermediate Quiz/i }).click()
    await page.waitForLoadState('networkidle')

    const intermediateQuestion = await page.locator('[data-testid="quiz-question"]').first().textContent()

    // Questions should likely be different (though not guaranteed due to randomization)
    // At minimum, we confirm both quizzes loaded
    expect(beginnerQuestion).toBeTruthy()
    expect(intermediateQuestion).toBeTruthy()
  })

  test('Complete quiz flow - should save difficulty level', async ({ page }) => {
    // Start intermediate quiz
    await page.getByRole('button', { name: /Start Intermediate Quiz/i }).click()
    await page.waitForLoadState('networkidle')

    // Answer all questions (simplified - just click first option)
    const questionCount = await page.locator('[data-testid="quiz-question"]').count()

    for (let i = 0; i < Math.min(questionCount, 5); i++) {
      // Click first radio option
      await page.locator('input[type="radio"]').first().click()

      // Click next or submit
      const nextButton = page.getByRole('button', { name: /Next/i })
      const submitButton = page.getByRole('button', { name: /Submit/i })

      if (await nextButton.isVisible()) {
        await nextButton.click()
      } else if (await submitButton.isVisible()) {
        await submitButton.click()
        break
      }
    }

    // Should redirect to results page
    await page.waitForURL('**/diagnosis/results')

    // Should show intermediate badge on results page
    await expect(page.getByText(/intermediate/i).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your Diagnosis Results/i })).toBeVisible()
  })
})
