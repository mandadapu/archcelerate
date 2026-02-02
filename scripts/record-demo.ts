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
  outputDir: 'demos',
  scenes: [
    { name: 'homepage', duration: 3000 },
    { name: 'curriculum', duration: 5000 },
    { name: 'week1-content', duration: 8000 },
    { name: 'domains', duration: 5000 },
    { name: 'interview-prep', duration: 5000 }
  ]
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

  // Add smooth scrolling
  await page.addInitScript(() => {
    window.scrollTo = function(options: any) {
      if (typeof options === 'object') {
        window.scroll({
          top: options.top,
          left: options.left,
          behavior: 'smooth'
        })
      }
    }
  })

  console.log(`🎬 Recording demo video...`)
  console.log(`📹 Output: ${videoPath}`)

  return { browser, context, page }
}

async function smoothScroll(page: Page, targetY: number, duration: number = 2000) {
  // Use Function constructor to avoid tsx transpilation issues
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

async function recordScene1_Homepage(page: Page) {
  console.log('📍 Scene 1: Homepage')

  await page.goto(DEMO_CONFIG.baseUrl)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000) // Hold on hero section
}

async function recordScene2_Curriculum(page: Page) {
  console.log('📍 Scene 2: Curriculum Overview')

  await page.goto(`${DEMO_CONFIG.baseUrl}/curriculum`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Smooth scroll through weeks
  await smoothScroll(page, 1000, 3000)
  await page.waitForTimeout(1000)

  // Highlight enhanced weeks (if they have special styling)
  await page.evaluate(() => {
    const weeks = document.querySelectorAll('[data-week="1"], [data-week="7"], [data-week="11"], [data-week="12"]')
    weeks.forEach(week => {
      if (week instanceof HTMLElement) {
        week.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)'
      }
    })
  })

  await page.waitForTimeout(2000)
}

async function recordScene3_Week1Content(page: Page) {
  console.log('📍 Scene 3: Week 1 Content Deep Dive')

  // Navigate to Week 1 LLM Fundamentals
  await page.goto(`${DEMO_CONFIG.baseUrl}/curriculum/week-1/concepts/llm-fundamentals`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Scroll to show different sections
  console.log('  → Showing simple explanation')
  await smoothScroll(page, 300, 1500)
  await page.waitForTimeout(2000)

  console.log('  → Showing code example')
  await smoothScroll(page, 800, 1500)
  await page.waitForTimeout(2500)

  console.log('  → Showing cost metrics')
  await smoothScroll(page, 1500, 1500)
  await page.waitForTimeout(2000)

  console.log('  → Showing best practices')
  await smoothScroll(page, 2200, 1500)
  await page.waitForTimeout(1500)
}

async function recordScene4_Domains(page: Page) {
  console.log('📍 Scene 4: Domain-Specific Agents')

  await page.goto(`${DEMO_CONFIG.baseUrl}/domains`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Highlight domain cards with hover effect
  const domains = ['hr', 'healthcare', 'legal', 'finance']
  for (const domain of domains) {
    const domainCard = await page.$(`[data-domain="${domain}"]`)
    if (domainCard) {
      await domainCard.hover()
      await page.waitForTimeout(500)
    }
  }

  await page.waitForTimeout(2000)

  // Click into HR agents
  console.log('  → Opening HR Agents')
  await page.click('text=HR Agents')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Scroll to show Wisq Harper metrics
  await smoothScroll(page, 600, 2000)
  await page.waitForTimeout(2000)
}

async function recordScene5_InterviewPrep(page: Page) {
  console.log('📍 Scene 5: Interview Preparation')

  await page.goto(`${DEMO_CONFIG.baseUrl}/curriculum/week-8/concepts/interview-preparation`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Scroll to show system design framework
  await smoothScroll(page, 800, 2000)
  await page.waitForTimeout(2000)

  // Scroll to show practice problems
  await smoothScroll(page, 1800, 2000)
  await page.waitForTimeout(2000)
}

async function recordDemo() {
  let browser: Browser | null = null

  try {
    const { browser: b, context, page } = await setupBrowser()
    browser = b

    // Record each scene
    await recordScene1_Homepage(page)
    await recordScene2_Curriculum(page)
    await recordScene3_Week1Content(page)
    // Skip domain/interview scenes for now - can add once fully integrated
    // await recordScene4_Domains(page)
    // await recordScene5_InterviewPrep(page)

    console.log('✅ Recording complete!')
    console.log('⏳ Saving video...')

    // Close and save video
    await context.close()
    await browser.close()

    console.log('✅ Video saved to demos/ directory')
    console.log('\nNext steps:')
    console.log('1. Open the video in DaVinci Resolve or iMovie')
    console.log('2. Add voiceover from docs/demo-video-script.md')
    console.log('3. Add text overlays and transitions')
    console.log('4. Export and upload to YouTube')

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
