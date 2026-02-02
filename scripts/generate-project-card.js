#!/usr/bin/env node

/**
 * Generate project card image for RAG Q&A System
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateProjectCard() {
  // Canvas setup - 800x600px at 2x for retina
  const width = 800
  const height = 600
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Enable anti-aliasing
  ctx.antialias = 'subpixel'
  ctx.patternQuality = 'best'

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, 380)
  gradient.addColorStop(0, '#E0D4F7')  // Light purple
  gradient.addColorStop(1, '#C8E6F5')  // Light cyan

  // Rounded rectangle for gradient section
  roundRect(ctx, 0, 0, width, 380, 24, gradient)

  // White bottom section
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 380, width, 220)

  // Draw rocket emoji (using Unicode)
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🚀', width / 2, 200)

  // Title
  ctx.font = 'bold 48px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#111827'
  ctx.textAlign = 'left'
  ctx.fillText('RAG Q&A System', 130, 460)

  // Description line 1
  ctx.font = '20px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#6B7280'
  ctx.fillText('Build document search with Claude and vector', 130, 510)

  // Description line 2
  ctx.fillText('databases', 130, 540)

  // Add subtle border
  ctx.strokeStyle = '#E5E7EB'
  ctx.lineWidth = 1
  roundRect(ctx, 0.5, 0.5, width - 1, height - 1, 24, null, true)

  // Save the image
  const outputDir = path.join(__dirname, '../public/project-cards')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(outputDir, 'rag-qa-system.png')
  fs.writeFileSync(outputPath, buffer)

  console.log(`✅ Generated project card: ${outputPath}`)
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(ctx, x, y, width, height, radius, fillStyle, strokeOnly = false) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()

  if (!strokeOnly && fillStyle) {
    ctx.fillStyle = fillStyle
    ctx.fill()
  } else if (strokeOnly) {
    ctx.stroke()
  }
}

// Run the generator
try {
  generateProjectCard()
} catch (error) {
  console.error('❌ Error generating project card:', error.message)
  console.log('\nℹ️  Make sure to install the required dependency:')
  console.log('   npm install canvas')
  process.exit(1)
}
