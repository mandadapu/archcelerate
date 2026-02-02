# Project Card Generator Scripts

Scripts for generating project card images dynamically.

**Note:** Pre-generated images are already committed to `public/project-cards/`. You only need to install dependencies if you want to regenerate images or add new project cards.

## Installation (Optional)

Only needed if regenerating images:

```bash
npm install canvas --legacy-peer-deps --save-dev
```

**Important:** Canvas is NOT included in production dependencies to avoid Docker build issues. Images are pre-generated and committed to git.

## Usage

### Generate All Project Cards

```bash
npm run generate-cards all
```

or

```bash
node scripts/generate-project-cards.js all
```

### Generate Specific Project Card

```bash
npm run generate-cards rag-qa-system
```

or

```bash
node scripts/generate-project-cards.js rag-qa-system
```

## Available Projects

Current project configurations:

1. **rag-qa-system** - RAG Q&A System 🚀
2. **ai-code-reviewer** - AI Code Reviewer 🔍
3. **chatbot-platform** - Chatbot Platform 💬
4. **content-generator** - Content Generator ✨
5. **data-analyst** - Data Analyst Agent 📊

## Adding New Projects

Edit `scripts/generate-project-cards.js` and add a new configuration to the `projectConfigs` object:

```javascript
const projectConfigs = {
  'your-project-id': {
    title: 'Your Project Title',
    description: ['First line of description', 'Second line of description'],
    emoji: '🎯',
    gradientStart: '#E0D4F7',  // CSS color
    gradientEnd: '#C8E6F5',    // CSS color
  },
  // ... existing projects
}
```

Then generate the card:

```bash
npm run generate-cards your-project-id
```

## Output

Generated images are saved to:
- `public/project-cards/{project-id}.png` (800x600px)

## Image Specifications

- **Dimensions**: 800x600 pixels
- **Format**: PNG with transparency
- **Quality**: Optimized for web (48-60KB per image)
- **Features**:
  - Gradient background (customizable colors)
  - Emoji icon (120px, centered)
  - Title (48px bold)
  - Description (20px, 2 lines max)
  - Rounded corners (24px radius)
  - Subtle border

## Using in Components

Import the generated images in your React components:

```tsx
import Image from 'next/image'

<Image
  src="/project-cards/rag-qa-system.png"
  alt="RAG Q&A System"
  width={800}
  height={600}
  className="rounded-3xl"
/>
```

Or use the SVG version for smaller file size:

```tsx
<img
  src="/project-cards/rag-qa-system.svg"
  alt="RAG Q&A System"
  className="w-full h-auto rounded-3xl"
/>
```

## Troubleshooting

### Canvas installation fails on Mac

If you encounter issues installing canvas on macOS:

```bash
# Install required system dependencies
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Then install canvas
npm install canvas --legacy-peer-deps
```

### Canvas installation fails on Linux

```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Then install canvas
npm install canvas --legacy-peer-deps
```

### Font rendering issues

The script uses system fonts. Make sure you have:
- Inter font family (or fallback to system fonts)
- Apple Color Emoji (macOS) or Segoe UI Emoji (Windows)
