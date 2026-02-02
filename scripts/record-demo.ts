/**
 * Automated demo video recording script
 * Uses Playwright to navigate through the platform and record screens
 *
 * Usage:
 *   npx tsx scripts/record-demo.ts
 *
 * Output: demos/aicelerate-demo-{timestamp}.webm
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const DEMO_CONFIG = {
  baseUrl: 'http://localhost:3000',
  viewport: { width: 1920, height: 1080 },
  outputDir: 'demos'
}

async function setupBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled'
    ]
  })

  // Create output directory
  await mkdir(DEMO_CONFIG.outputDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const videoPath = path.join(DEMO_CONFIG.outputDir, `aicelerate-demo-${timestamp}.webm`)

  const context = await browser.newContext({
    viewport: DEMO_CONFIG.viewport,
    recordVideo: {
      dir: DEMO_CONFIG.outputDir,
      size: DEMO_CONFIG.viewport
    }
  })

  const page = await context.newPage()

  console.log(`🎬 Recording demo video...`)
  console.log(`📹 Output: ${videoPath}`)

  return { browser, context, page }
}

async function smoothScroll(page: Page, targetY: number, duration: number = 2000) {
  // Use inline eval string to avoid tsx transpilation issues
  await page.evaluate(`
    (function(target, time) {
      return new Promise(function(resolve) {
        var start = window.scrollY;
        var distance = target - start;
        var startTime = performance.now();

        function animation(currentTime) {
          var elapsed = currentTime - startTime;
          var progress = Math.min(elapsed / time, 1);

          var easing = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          window.scrollTo(0, start + distance * easing);

          if (progress < 1) {
            requestAnimationFrame(animation);
          } else {
            resolve(true);
          }
        }

        requestAnimationFrame(animation);
      });
    })(${targetY}, ${duration})
  `)
}

async function recordHomepageDemo(page: Page) {
  console.log('📍 Loading homepage...')
  await page.goto(DEMO_CONFIG.baseUrl)
  await page.waitForLoadState('networkidle')

  // Scene 1: Hero Section
  console.log('📍 Scene 1: Hero Section')
  await page.waitForTimeout(3000)

  // Scene 2: Scroll to Project Showcase
  console.log('📍 Scene 2: Project Showcase')
  await smoothScroll(page, 900, 2500)
  await page.waitForTimeout(3000)

  // Scene 3: Testimonials
  console.log('📍 Scene 3: Testimonials')
  await smoothScroll(page, 1600, 2500)
  await page.waitForTimeout(3000)

  // Scene 4: How It Works - Feature Cards
  console.log('📍 Scene 4: How It Works Features')
  await smoothScroll(page, 2400, 2500)
  await page.waitForTimeout(3500)

  // Scene 5: Final CTA
  console.log('📍 Scene 5: Final CTA')
  await smoothScroll(page, 3400, 2500)
  await page.waitForTimeout(2500)

  // Scroll back to top for nice ending
  console.log('📍 Returning to top...')
  await smoothScroll(page, 0, 2000)
  await page.waitForTimeout(2000)
}

async function recordDemo() {
  let browser: Browser | null = null

  try {
    const { browser: b, context, page } = await setupBrowser()
    browser = b

    // Record homepage demo
    await recordHomepageDemo(page)

    console.log('✅ Recording complete!')
    console.log('⏳ Saving video...')

    // Close and save video
    await context.close()
    await browser.close()

    console.log('✅ Video saved to demos/ directory')
    console.log('\nNext steps:')
    console.log('1. Move video to public/videos/demo.webm')
    console.log('2. (Optional) Add voiceover in video editor')
    console.log('3. (Optional) Add text overlays and transitions')
    console.log('4. Video will auto-play on landing page')

  } catch (error) {
    console.error('❌ Error recording demo:', error)
    if (browser) {
      await browser.close()
    }
    process.exit(1)
  }
}

// Run the demo recording
recordDemo()
