/**
 * Generate card images for landing page features
 * Uses node-canvas to create beautiful gradient images
 *
 * Usage:
 *   npx tsx scripts/generate-card-image.ts
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Card configurations
const CARDS = [
  {
    name: 'projects',
    title: '7 Projects',
    subtitle: 'Build Real AI Products',
    gradient: ['#9333ea', '#06b6d4'], // purple to cyan
    icon: '✓',
    outputPath: 'public/images/cards/projects.png'
  },
  {
    name: 'mentor',
    title: '24/7 Mentor',
    subtitle: 'AI Help Anytime',
    gradient: ['#06b6d4', '#0ea5e9'], // cyan to blue
    icon: '💬',
    outputPath: 'public/images/cards/mentor.png'
  },
  {
    name: 'deploy',
    title: 'Deploy',
    subtitle: 'Ship to Production',
    gradient: ['#9333ea', '#c026d3'], // purple to fuchsia
    icon: '⚡',
    outputPath: 'public/images/cards/deploy.png'
  },
  {
    name: 'curriculum',
    title: '12 Weeks',
    subtitle: 'Full Curriculum',
    gradient: ['#0ea5e9', '#06b6d4'], // blue to cyan
    icon: '📚',
    outputPath: 'public/images/cards/curriculum.png'
  }
]

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function generateCardImage(config: typeof CARDS[0]) {
  const width = 800
  const height = 450 // 16:9 aspect ratio

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, config.gradient[0])
  gradient.addColorStop(1, config.gradient[1])

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add subtle pattern overlay
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 100 + 50,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = 'white'
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Draw icon (large emoji)
  ctx.font = 'bold 120px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillText(config.icon, width / 2, height / 2 - 20)

  // Draw title
  ctx.font = 'bold 72px Arial'
  ctx.fillStyle = 'white'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 20
  ctx.fillText(config.title, width / 2, height / 2 + 80)

  // Draw subtitle
  ctx.font = '32px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.shadowBlur = 10
  ctx.fillText(config.subtitle, width / 2, height / 2 + 130)

  return canvas
}

async function generateAllCards() {
  console.log('🎨 Generating card images...\n')

  // Create output directory
  mkdirSync('public/images/cards', { recursive: true })

  for (const card of CARDS) {
    console.log(`  Generating ${card.name}...`)

    const canvas = generateCardImage(card)
    const buffer = canvas.toBuffer('image/png')

    writeFileSync(card.outputPath, buffer)
    console.log(`  ✓ Saved to ${card.outputPath}`)
  }

  console.log('\n✅ All card images generated!')
  console.log('\nNext steps:')
  console.log('1. Check images in public/images/cards/')
  console.log('2. Update your landing page components to use them')
  console.log('3. Example: <img src="/images/cards/projects.png" alt="Projects" />')
}

generateAllCards().catch(console.error)
