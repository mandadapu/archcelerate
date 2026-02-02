/**
 * Generate SVG card images for landing page
 * No dependencies needed - pure SVG generation
 *
 * Usage:
 *   npx tsx scripts/generate-card-images-svg.ts
 */

import { writeFileSync, mkdirSync } from 'fs'

const CARDS = [
  {
    name: 'projects',
    title: '7',
    subtitle: 'Hands-On Projects',
    description: 'Build real AI products',
    gradient: ['#9333ea', '#06b6d4'],
    icon: '✓',
  },
  {
    name: 'mentor',
    title: '24/7',
    subtitle: 'AI Mentor',
    description: 'Get instant help',
    gradient: ['#06b6d4', '#0ea5e9'],
    icon: '💬',
  },
  {
    name: 'deploy',
    title: 'Deploy',
    subtitle: 'Ship to Production',
    description: 'Build a portfolio',
    gradient: ['#9333ea', '#c026d3'],
    icon: '⚡',
  }
]

function generateSVG(card: typeof CARDS[0]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient Background -->
  <defs>
    <linearGradient id="grad-${card.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${card.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${card.gradient[1]};stop-opacity:1" />
    </linearGradient>

    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="450" fill="url(#grad-${card.name})"/>

  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="150" fill="white" opacity="0.05"/>
  <circle cx="700" cy="350" r="120" fill="white" opacity="0.05"/>
  <circle cx="600" cy="100" r="80" fill="white" opacity="0.08"/>

  <!-- Icon (large) -->
  <text x="400" y="180"
        font-family="Arial, sans-serif"
        font-size="100"
        fill="white"
        opacity="0.2"
        text-anchor="middle">${card.icon}</text>

  <!-- Title (big number) -->
  <text x="400" y="260"
        font-family="Arial, sans-serif"
        font-size="80"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        filter="url(#glow)">${card.title}</text>

  <!-- Subtitle -->
  <text x="400" y="310"
        font-family="Arial, sans-serif"
        font-size="32"
        font-weight="600"
        fill="white"
        text-anchor="middle">${card.subtitle}</text>

  <!-- Description -->
  <text x="400" y="350"
        font-family="Arial, sans-serif"
        font-size="20"
        fill="white"
        opacity="0.9"
        text-anchor="middle">${card.description}</text>
</svg>`
}

function generateAllImages() {
  console.log('🎨 Generating SVG card images...\n')

  // Create output directory
  mkdirSync('public/images/cards', { recursive: true })

  for (const card of CARDS) {
    const svg = generateSVG(card)
    const outputPath = `public/images/cards/${card.name}.svg`

    writeFileSync(outputPath, svg)
    console.log(`  ✓ Generated ${outputPath}`)
  }

  console.log('\n✅ All card images generated!')
  console.log('\nUsage in components:')
  console.log('  <img src="/images/cards/projects.svg" alt="Projects" />')
}

generateAllImages()
