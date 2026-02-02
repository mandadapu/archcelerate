#!/usr/bin/env node

/**
 * Generate app icons and favicon
 * Requires: npm install canvas --save-dev --legacy-peer-deps
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#8b5cf6') // Purple
  gradient.addColorStop(1, '#06b6d4') // Cyan

  // Draw rounded rectangle background
  const radius = size * 0.15
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw "AI" text
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.5}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AI', size / 2, size / 2)

  // Save the image
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  console.log(`✅ Generated: ${path.basename(outputPath)} (${size}x${size})`)
}

function generateFavicon() {
  const size = 32
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#8b5cf6')
  gradient.addColorStop(1, '#06b6d4')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // White "AI" text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AI', size / 2, size / 2)

  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(__dirname, '../public/favicon.ico')
  fs.writeFileSync(outputPath, buffer)
  console.log(`✅ Generated: favicon.ico (${size}x${size})`)
}

try {
  const publicDir = path.join(__dirname, '../public')

  // Generate PWA icons
  generateIcon(192, path.join(publicDir, 'icon-192.png'))
  generateIcon(512, path.join(publicDir, 'icon-512.png'))

  // Generate Apple touch icon
  generateIcon(180, path.join(publicDir, 'apple-touch-icon.png'))

  // Generate favicon
  generateFavicon()

  console.log('\n✅ All icons generated successfully!')
} catch (error) {
  console.error('❌ Error generating icons:', error.message)
  console.log('\nℹ️  Make sure to install the required dependency:')
  console.log('   npm install canvas --legacy-peer-deps --save-dev')
  process.exit(1)
}
