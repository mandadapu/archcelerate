#!/usr/bin/env node

/**
 * Generate project card images dynamically
 * Usage: node scripts/generate-project-cards.js [project-id]
 *
 * Pre-requisite: npm install canvas --legacy-peer-deps --save-dev
 *
 * Note: Canvas is NOT in production dependencies to avoid Docker build issues.
 * Images are pre-generated and committed to git. Only run this script when:
 * - Adding new project cards
 * - Updating existing card designs
 * - Changing gradients or emojis
 */

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// Project card configurations
const projectConfigs = {
  'rag-qa-system': {
    title: 'RAG Q&A System',
    description: ['Build document search with Claude and vector', 'databases'],
    emoji: '🚀',
    gradientStart: '#E0D4F7',
    gradientEnd: '#C8E6F5',
  },
  'ai-code-reviewer': {
    title: 'AI Code Reviewer',
    description: ['Automated code review with Claude and', 'GitHub integration'],
    emoji: '🔍',
    gradientStart: '#FFE5E5',
    gradientEnd: '#FFF0E5',
  },
  'chatbot-platform': {
    title: 'Chatbot Platform',
    description: ['Build conversational AI with memory and', 'context handling'],
    emoji: '💬',
    gradientStart: '#E5F5FF',
    gradientEnd: '#E5FFE5',
  },
  'content-generator': {
    title: 'Content Generator',
    description: ['AI-powered content creation with', 'multimodal capabilities'],
    emoji: '✨',
    gradientStart: '#FFF0F5',
    gradientEnd: '#F0E5FF',
  },
  'data-analyst': {
    title: 'Data Analyst Agent',
    description: ['Autonomous data analysis with SQL and', 'visualization tools'],
    emoji: '📊',
    gradientStart: '#E5F0FF',
    gradientEnd: '#FFE5F0',
  },
  'agent-workflow': {
    title: 'Agent Workflow System',
    description: ['Multi-step autonomous agents that', 'reason and act'],
    emoji: '🤖',
    gradientStart: '#E0FFE5',
    gradientEnd: '#E5E0FF',
  },
  'portfolio-deployment': {
    title: 'Portfolio Deployment',
    description: ['Ship all projects to production', 'with CI/CD pipelines'],
    emoji: '🚀',
    gradientStart: '#FFE0F5',
    gradientEnd: '#E0F0FF',
  },
}

/**
 * Generate a project card image
 */
function generateProjectCard(projectId) {
  const config = projectConfigs[projectId]

  if (!config) {
    console.error(`❌ Unknown project: ${projectId}`)
    console.log(`\nℹ️  Available projects:`)
    Object.keys(projectConfigs).forEach(id => {
      console.log(`   - ${id}`)
    })
    process.exit(1)
  }

  const width = 800
  const height = 600
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Enable anti-aliasing
  ctx.antialias = 'subpixel'
  ctx.patternQuality = 'best'

  // Draw gradient background (full canvas)
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, config.gradientStart)
  gradient.addColorStop(1, config.gradientEnd)

  // Fill entire canvas with gradient
  roundRect(ctx, 0, 0, width, height, 24, gradient)

  // Clean gradient only - emojis will be added via HTML/CSS for proper color rendering

  // Add subtle border to gradient section only
  ctx.strokeStyle = '#E5E7EB'
  ctx.lineWidth = 1
  roundRect(ctx, 0.5, 0.5, width - 1, height - 1, 24, null, true)

  // Save the image
  const outputDir = path.join(__dirname, '../public/project-cards')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const buffer = canvas.toBuffer('image/png')
  const outputPath = path.join(outputDir, `${projectId}.png`)
  fs.writeFileSync(outputPath, buffer)

  console.log(`✅ Generated: ${projectId}.png (${Math.round(buffer.length / 1024)}KB)`)
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

// Main execution
try {
  const projectId = process.argv[2]

  if (!projectId || projectId === 'all') {
    // Generate all project cards
    console.log('Generating all project cards...\n')
    Object.keys(projectConfigs).forEach(id => {
      generateProjectCard(id)
    })
    console.log('\n✅ All project cards generated successfully!')
  } else {
    // Generate specific project card
    generateProjectCard(projectId)
  }
} catch (error) {
  console.error('❌ Error generating project card:', error.message)
  console.log('\nℹ️  Make sure to install the required dependency:')
  console.log('   npm install canvas')
  process.exit(1)
}
