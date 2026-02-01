# Sprint 4: Multimodal AI (Vision & Beyond) - Implementation Guide

## Overview

Sprint 4 teaches learners how to build applications that understand images, combine text and vision, and create powerful multimodal experiences. They'll learn vision transformers, multimodal prompting techniques, and build production-ready cross-modal applications.

## Learning Path

### Concept 1: Vision Models & Image Understanding (90 min)
- How vision transformers process images (patches, embeddings, attention)
- Claude's vision API and supported image formats
- Common vision tasks: OCR, object detection, scene understanding, document analysis
- Image quality best practices and limitations
- Real-world applications: accessibility, e-commerce, content moderation
- Understanding model capabilities and edge cases
- Cost optimization for vision API usage

### Concept 2: Multimodal Prompting Techniques (75 min)
- Combining text and image inputs effectively
- Image encoding formats (base64, URLs)
- Proven multimodal prompt patterns (Context → Image → Question)
- Multi-image analysis techniques (sequential, comparative, aggregation)
- Advanced strategies: chain of thought, confidence scoring, focused attention
- Common pitfalls: vague prompts, poor image quality, ignoring uncertainty
- Production best practices: retry logic, caching, cost monitoring
- Output validation and structured extraction

### Concept 3: Cross-Modal Applications & Use Cases (90 min)
- Real-world multimodal application architectures
- Visual Q&A systems with conversation history
- Document intelligence and OCR pipelines
- Product catalog automation (e-commerce)
- Accessibility features (alt text generation)
- Content moderation systems
- Medical imaging assistance (educational purposes)
- Production patterns: pipeline, event-driven
- Performance optimization and monitoring

## Lab Exercises

### Lab 1: Image Analysis API (30 min)
Build a basic image analysis endpoint using Claude's vision API.

**Skills**: API integration, image encoding, vision prompting

**Test Cases**:
- Correctly encodes images to base64
- Handles JPEG and PNG formats
- Returns structured analysis
- Handles API errors gracefully
- Validates image size limits
- Supports URL-based images

**Learning Outcomes**:
- Implement Claude vision API calls
- Handle image encoding and media types
- Structure vision prompts effectively
- Process API responses

### Lab 2: Multi-Image Comparison (30 min)
Compare multiple images and extract differences.

**Skills**: Multi-image analysis, comparative prompting, structured output

**Test Cases**:
- Compares 2+ images successfully
- Identifies similarities and differences
- Returns structured comparison data
- Handles images of different sizes
- Provides confidence scores
- Generates meaningful insights

**Learning Outcomes**:
- Send multiple images in one request
- Label images appropriately
- Extract comparative insights
- Structure comparison results

### Lab 3: OCR and Data Extraction (45 min)
Extract text and structured data from document images.

**Skills**: OCR, structured extraction, validation

**Test Cases**:
- Extracts text from clear images
- Handles receipts, invoices, forms
- Returns structured JSON output
- Validates extracted data
- Handles missing/unclear fields
- Calculates confidence scores

**Learning Outcomes**:
- Implement OCR with vision models
- Design extraction schemas
- Validate extracted data
- Handle extraction errors

### Lab 4: Visual Q&A System (60 min)
Build a conversational Q&A system about images.

**Skills**: Conversation management, context preservation, multi-turn dialogue

**Test Cases**:
- Maintains conversation context
- Answers follow-up questions
- References previous exchanges
- Handles multiple questions
- Stores conversation history
- Cleans up old conversations

**Learning Outcomes**:
- Manage multi-turn conversations
- Preserve image context
- Build stateful Q&A systems
- Implement conversation cleanup

## Project: Visual Product Analyzer

### Requirements

**Functional**:
- Upload product images (single or multiple)
- Analyze product features from images
- Compare multiple products side-by-side
- Generate detailed product descriptions
- Extract specifications from product photos
- Provide purchase recommendations
- Display visual evidence for claims

**Technical**:
- Use Claude API with vision capability
- Handle image upload and base64 encoding
- Implement multi-image analysis
- Store analysis results in database
- Support multiple image formats (JPEG, PNG, WebP)
- Optimize image size for API calls (max 1568px)

**UI**:
- Image upload interface (drag & drop)
- Product comparison view (2-4 products)
- Analysis results display with thumbnails
- Visual feature highlighting
- Recommendation cards with reasoning
- Loading states during analysis
- Error messages and retry options

### Tech Stack
- **Next.js**: Full-stack application
- **Claude API**: Vision model (claude-3-5-sonnet-20250129)
- **TypeScript**: Type-safe implementation
- **Prisma**: Store analysis results
- **Sharp**: Image optimization (optional)

### Success Criteria

| Criterion | Description | Weight |
|-----------|-------------|--------|
| **Analysis Accuracy** | Correctly identifies products, extracts key features, accurate descriptions | 30% |
| **Comparison Quality** | Meaningful comparisons with visual evidence, highlights key differences | 25% |
| **User Experience** | Smooth upload, clear results, intuitive comparison interface | 20% |
| **Recommendations** | Helpful recommendations based on features and use case | 15% |
| **Code Quality** | Clean code, proper error handling, good UI/UX | 10% |

### Rubric

- **Exceeds**: Analyzes 3+ products accurately, comparisons are insightful with visual evidence, UI is polished, recommendations are helpful, proper error handling
- **Meets**: Analyzes 2+ products, basic comparisons work, functional UI, some recommendations, handles common errors
- **Approaching**: Single product analysis works, limited comparison features, basic UI, few recommendations
- **Incomplete**: Image upload fails, analysis errors, or comparison not working

### Test Products
1. Compare 3 different laptop models
2. Analyze smartphone camera features
3. Extract specifications from product packaging
4. Compare similar products (e.g., two coffee makers)
5. Identify product from lifestyle photos

### Estimated Time
4-5 hours

### Estimated Cost

**Development**:
- Vision: $2.00 (100 image analyses @ $0.02 each)
- LLM: $0.50 (text generation)
- Total: $2.50

**Production**:
- Vision: $20/month (1000 analyses)
- LLM: $5/month (supporting text)
- Storage: $0 (use temporary uploads)
- Total: $25/month

### Starter File Structure
```
app/api/analyze-product/route.ts    # API endpoint for product analysis
lib/vision/image-processor.ts        # Image upload and encoding
lib/vision/product-analyzer.ts       # Core analysis logic
lib/vision/comparison-engine.ts      # Product comparison
components/ImageUpload.tsx            # Upload interface
components/ProductComparison.tsx      # Comparison view
components/AnalysisResults.tsx        # Results display
```

## Technical Guidance

### Vision API Pattern
Use Claude's vision API with proper image encoding:
```typescript
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function analyzeImage(imagePath: string, prompt: string) {
  const imageData = fs.readFileSync(imagePath)
  const base64Image = imageData.toString('base64')

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20250129',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })

  return response.content[0].text
}
```

### Image Optimization
Resize large images before encoding:
```typescript
import sharp from 'sharp'

async function optimizeImage(imagePath: string): Promise<string> {
  const optimizedPath = imagePath.replace(/\.(jpg|jpeg|png)$/, '-opt.$1')

  await sharp(imagePath)
    .resize(1568, 1568, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toFile(optimizedPath)

  return optimizedPath
}
```

### Multi-Image Analysis
Send multiple images in one request:
```typescript
async function compareProducts(imagePaths: string[]) {
  const content: any[] = [
    { type: 'text', text: 'Compare these products:' }
  ]

  for (let i = 0; i < imagePaths.length; i++) {
    const imageData = fs.readFileSync(imagePaths[i])
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: imageData.toString('base64'),
      },
    })
    content.push({
      type: 'text',
      text: `Product ${i + 1}`,
    })
  }

  content.push({
    type: 'text',
    text: 'List key differences and recommend best option.',
  })

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20250129',
    max_tokens: 2048,
    messages: [{ role: 'user', content }],
  })

  return response.content[0].text
}
```

### Structured Output
Request JSON for structured data:
```typescript
const prompt = `Analyze this product. Return JSON:
{
  "name": "product name",
  "category": "product category",
  "features": ["feature 1", "feature 2"],
  "color": ["primary color"],
  "material": ["materials"],
  "estimatedPrice": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "condition": "new|like-new|used",
  "confidence": 0-100
}

Only return valid JSON.`
```

### Error Handling
Implement retry logic:
```typescript
async function analyzeWithRetry(
  imagePath: string,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeImage(imagePath, prompt)
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`)
}
```

### Caching
Cache results for duplicate images:
```typescript
import crypto from 'crypto'

const cache = new Map<string, any>()

function getCacheKey(imagePath: string, prompt: string): string {
  const imageHash = crypto
    .createHash('md5')
    .update(fs.readFileSync(imagePath))
    .digest('hex')

  const promptHash = crypto
    .createHash('md5')
    .update(prompt)
    .digest('hex')

  return `${imageHash}-${promptHash}`
}

async function cachedAnalysis(imagePath: string, prompt: string) {
  const cacheKey = getCacheKey(imagePath, prompt)

  if (cache.has(cacheKey)) {
    console.log('Cache hit!')
    return cache.get(cacheKey)
  }

  const result = await analyzeImage(imagePath, prompt)
  cache.set(cacheKey, result)

  return result
}
```

## Testing Sprint 4

### Manual Testing Checklist
- [ ] Navigate to /learn/sprint-4
- [ ] Read all 3 concept pages
- [ ] Verify MDX rendering and code examples
- [ ] Check mermaid diagrams display correctly
- [ ] Complete all 4 lab exercises
- [ ] Verify Monaco editor loads in labs
- [ ] Test lab test cases pass
- [ ] Review project requirements

### Lab Testing
- [ ] Lab 1: Upload images, verify analysis works
- [ ] Lab 2: Compare 2+ images, check differences
- [ ] Lab 3: Extract data from receipts/documents
- [ ] Lab 4: Ask multiple questions about images

### Project Testing
- [ ] Product analyzer accepts image uploads
- [ ] Analyzes single product accurately
- [ ] Compares 2+ products side-by-side
- [ ] Generates helpful recommendations
- [ ] Displays results with visual evidence
- [ ] Handles upload errors gracefully
- [ ] Optimizes images before API calls
- [ ] Completes analysis within reasonable time

### Content Quality
- [ ] All code examples are syntactically correct
- [ ] Concepts flow logically
- [ ] No broken links or references
- [ ] Consistent formatting throughout
- [ ] Mermaid diagrams render properly
- [ ] TypeScript types are accurate

## Common Issues

### Image Encoding Errors
**Error**: `Invalid image format`

**Solution**:
```typescript
function getMediaType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase()
  const mediaTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  }
  return mediaTypeMap[extension || 'jpeg'] || 'image/jpeg'
}
```

### Image Size Limits
**Error**: `Image exceeds size limit`

**Causes**:
- Image file > 5MB
- Image resolution > 8000×8000 pixels
- Base64 encoding increases size by ~33%

**Solution**:
```typescript
async function validateAndOptimize(imagePath: string) {
  const stats = fs.statSync(imagePath)
  const sizeInMB = stats.size / (1024 * 1024)

  if (sizeInMB > 5) {
    console.log('Image too large, optimizing...')
    return await optimizeImage(imagePath)
  }

  return imagePath
}
```

### Multi-Image Limits
**Error**: Too many images in request

**Solution**:
- Claude supports up to 5 images per request
- Batch larger comparisons into multiple requests
- Aggregate results client-side

```typescript
async function analyzeMultipleProducts(imagePaths: string[]) {
  const batchSize = 5
  const results = []

  for (let i = 0; i < imagePaths.length; i += batchSize) {
    const batch = imagePaths.slice(i, i + batchSize)
    const result = await compareProducts(batch)
    results.push(result)
  }

  return results
}
```

### OCR Accuracy Issues
**Error**: Extracted text is incomplete or incorrect

**Causes**:
- Low image quality
- Blurry or small text
- Poor contrast
- Unusual fonts

**Solution**:
```typescript
async function extractWithConfidence(imagePath: string) {
  const prompt = `Extract all text from this image. Return JSON:
{
  "text": "extracted text",
  "confidence": 0-100,
  "warnings": ["issues like: blurry, small text, etc"]
}

If confidence is below 70%, explain why.`

  const result = await analyzeImage(imagePath, prompt)
  const data = JSON.parse(result)

  if (data.confidence < 70) {
    console.warn('Low OCR confidence:', data.warnings)
    // Maybe request manual review
  }

  return data
}
```

### Vision API Costs
For production, monitor token usage:
```typescript
interface UsageMetrics {
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

function calculateVisionCost(usage: UsageMetrics): number {
  // Claude 3.5 Sonnet pricing (check current rates)
  const INPUT_COST_PER_1M = 3.00  // $3 per 1M input tokens
  const OUTPUT_COST_PER_1M = 15.00 // $15 per 1M output tokens

  // Images count as ~1270 tokens each (for average image)
  const imageCost = (usage.inputTokens / 1_000_000) * INPUT_COST_PER_1M
  const textCost = (usage.outputTokens / 1_000_000) * OUTPUT_COST_PER_1M

  return imageCost + textCost
}
```

### TypeScript Type Issues
If you encounter type errors with vision API:
```typescript
// Define proper types for vision content
interface ImageContent {
  type: 'image'
  source: {
    type: 'base64'
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    data: string
  }
}

interface TextContent {
  type: 'text'
  text: string
}

type MessageContent = ImageContent | TextContent

// Use in API call
const content: MessageContent[] = [
  {
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: base64Image,
    },
  },
  {
    type: 'text',
    text: 'Analyze this image',
  },
]
```

## Deployment Notes

### Environment Variables
Required for Sprint 4 features:
```env
# Claude API (already configured)
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Image storage
NEXT_PUBLIC_MAX_IMAGE_SIZE="5242880"  # 5MB in bytes
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

### Database Changes
No database schema changes required for Sprint 4 concepts and labs.

Optional: Add product analysis table for project:
```prisma
model ProductAnalysis {
  id          String   @id @default(cuid())
  userId      String
  imageUrl    String?  @db.Text
  imageHash   String?  // For caching
  analysis    Json     // Store analysis results
  confidence  Int
  createdAt   DateTime @default(now())

  user User @relation(...)

  @@index([userId, createdAt])
  @@index([imageHash])
}
```

### Performance Optimization
- **Image Upload**: Set reasonable file size limits (5MB)
- **Image Processing**: Resize before encoding (max 1568px)
- **Caching**: Cache analysis results by image hash + prompt
- **Rate Limiting**: Limit analyses per user (e.g., 10/day for free tier)
- **Cost Monitoring**: Log token usage per request

### Production Checklist
- [ ] Set up Claude API key
- [ ] Configure image upload limits
- [ ] Implement request timeouts (30s)
- [ ] Add cost monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics for vision API usage
- [ ] Test with production API quotas
- [ ] Monitor vision API usage daily
- [ ] Set up alerts for high costs
- [ ] Implement user rate limiting

## Extension Ideas

For advanced learners who complete the project:

1. **Advanced Features**:
   - Visual search with embedding similarity
   - Batch product analysis from CSV
   - Product recommendation engine
   - Price tracking from screenshots
   - Brand logo detection

2. **Accessibility**:
   - Alt text generation for product images
   - Screen reader descriptions
   - High contrast mode
   - Keyboard navigation

3. **E-commerce Integration**:
   - Shopping cart with analyzed products
   - Price comparison across stores
   - Product review summarization
   - Similar product suggestions

4. **Data Management**:
   - Analysis history tracking
   - Favorite products
   - Export to PDF/CSV
   - Share analysis links

5. **Advanced Vision**:
   - Video frame analysis
   - Multi-angle product views
   - 3D product visualization
   - Color palette extraction

6. **Social Features**:
   - Share product comparisons
   - Collaborative wishlists
   - Product reviews with images
   - Community recommendations

## Resources

### Documentation
- [Anthropic Vision Guide](https://docs.anthropic.com/claude/docs/vision)
- [Claude Vision Examples](https://github.com/anthropics/anthropic-cookbook/tree/main/multimodal)
- [Vision Transformers Paper](https://arxiv.org/abs/2010.11929)
- [Multimodal LLMs Overview](https://arxiv.org/abs/2306.13549)

### Libraries
- [@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk): Claude API client
- [sharp](https://www.npmjs.com/package/sharp): Image processing
- [file-type](https://www.npmjs.com/package/file-type): File type detection
- [image-size](https://www.npmjs.com/package/image-size): Image dimensions

### Tools & Services
- [Claude Console](https://console.anthropic.com/): API dashboard
- [Anthropic Workbench](https://console.anthropic.com/workbench): Test prompts
- [TinyPNG](https://tinypng.com/): Image compression
- [ImageOptim](https://imageoptim.com/): Batch optimization

### Articles & Tutorials
- [Building with Vision Models](https://www.anthropic.com/research/vision)
- [Multimodal Prompt Engineering](https://learnprompting.org/docs/image_prompting/intro)
- [Production Vision AI](https://eugeneyan.com/writing/vision/)
- [Image Analysis Best Practices](https://platform.openai.com/docs/guides/vision)

### Research Papers
- [Vision Transformer (ViT)](https://arxiv.org/abs/2010.11929)
- [CLIP: Learning Transferable Visual Models](https://arxiv.org/abs/2103.00020)
- [Flamingo: Visual Language Model](https://arxiv.org/abs/2204.14198)
- [Multimodal Chain-of-Thought](https://arxiv.org/abs/2302.00923)

## Next Steps

After completing Sprint 4, learners will be ready for:
- **Sprint 5**: Production Deployment (scaling, monitoring, optimization)
- **Sprint 6**: Advanced AI Patterns (multi-agent, planning, evaluation)
- **Sprint 7**: Capstone Project (full-stack AI application)

Sprint 4 provides the foundation for building production-ready multimodal applications that combine vision and language understanding. Learners will be equipped to build:
- E-commerce product analysis tools
- Document processing systems
- Accessibility features
- Content moderation platforms
- Visual search engines
- Medical imaging assistants (research/education)

## Image Format Reference

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limits
- **File size**: 5MB maximum
- **Resolution**: 8000×8000 pixels maximum
- **Recommended**: 1568px on longest side (optimal quality/cost)

### Media Type Mapping
```typescript
const MEDIA_TYPES = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
} as const
```

### Encoding Example
```typescript
function encodeImage(imagePath: string): {
  data: string
  mediaType: string
} {
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Data = imageBuffer.toString('base64')

  const extension = imagePath.split('.').pop()?.toLowerCase()
  const mediaType = MEDIA_TYPES[extension as keyof typeof MEDIA_TYPES] || 'image/jpeg'

  return { data: base64Data, mediaType }
}
```

---

**Sprint 4 Complete!** You now have comprehensive knowledge of multimodal AI, vision models, and cross-modal applications. You're ready to build production systems that understand and analyze images alongside text, opening up entirely new categories of AI applications.
