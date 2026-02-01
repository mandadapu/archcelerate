# Sprint 4: Multimodal AI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create Sprint 4 content teaching learners to build multimodal AI applications using vision models and image understanding.

**Architecture:** Following Sprint 3's pattern - 3 comprehensive MDX concepts, 4 interactive lab exercises with test cases, 1 real-world project specification, dashboard integration, and complete documentation.

**Tech Stack:** Next.js, TypeScript, MDX, Claude API (vision), Prisma

---

## Task 1: Create Sprint 4 Content Structure

**Files:**
- Create: `content/sprints/sprint-4/metadata.json`
- Create: `content/sprints/sprint-4/concepts/` (directory)
- Create: `content/sprints/sprint-4/labs/` (directory)

**Step 1: Create metadata.json**

Create `content/sprints/sprint-4/metadata.json`:

```json
{
  "id": "sprint-4",
  "title": "Multimodal AI (Vision & Beyond)",
  "description": "Build applications that understand images, combine text and vision, and create multimodal experiences",
  "order": 4,
  "concepts": [
    {
      "id": "vision-models",
      "title": "Vision Models & Image Understanding",
      "description": "Learn how vision models work and how to analyze images with AI",
      "difficulty": "intermediate",
      "order": 1,
      "estimatedMinutes": 60,
      "prerequisites": ["chat-assistant"],
      "tags": ["vision", "image-analysis", "multimodal", "theory"]
    },
    {
      "id": "multimodal-prompting",
      "title": "Multimodal Prompting Techniques",
      "description": "Master techniques for combining text and image inputs effectively",
      "difficulty": "intermediate",
      "order": 2,
      "estimatedMinutes": 75,
      "prerequisites": ["vision-models"],
      "tags": ["prompting", "multimodal", "vision", "best-practices"]
    },
    {
      "id": "cross-modal-applications",
      "title": "Cross-Modal Applications & Use Cases",
      "description": "Build real-world applications that leverage multimodal AI",
      "difficulty": "advanced",
      "order": 3,
      "estimatedMinutes": 90,
      "prerequisites": ["multimodal-prompting"],
      "tags": ["applications", "multimodal", "vision", "production", "advanced"]
    }
  ]
}
```

**Step 2: Create directory structure**

```bash
mkdir -p content/sprints/sprint-4/concepts
mkdir -p content/sprints/sprint-4/labs
```

**Step 3: Verify structure**

```bash
ls -la content/sprints/sprint-4/
cat content/sprints/sprint-4/metadata.json
```

Expected: Directory structure created, metadata.json contains valid JSON with 3 concepts.

**Step 4: Commit**

```bash
git add content/sprints/sprint-4/
git commit -m "feat: add Sprint 4 metadata structure

- Added metadata.json with 3 concepts
- Created directory structure for concepts and labs
- Sprint 4: Multimodal AI (Vision & Beyond)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Concept 1 - Vision Models & Image Understanding

**Files:**
- Create: `content/sprints/sprint-4/concepts/vision-models.mdx`

**Step 1: Write vision models concept**

Create comprehensive MDX content covering:
- What are vision models and how they work
- Claude's vision capabilities
- Image analysis fundamentals
- How vision transformers process images
- Common vision tasks (classification, OCR, object detection, scene understanding)
- Limitations and best practices

Target: 400-600 lines of comprehensive content (intermediate difficulty).

**Step 2: Commit**

```bash
git add content/sprints/sprint-4/concepts/vision-models.mdx
git commit -m "feat: add vision models & image understanding concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Concept 2 - Multimodal Prompting Techniques

**Files:**
- Create: `content/sprints/sprint-4/concepts/multimodal-prompting.mdx`

**Step 1: Write multimodal prompting concept**

Create comprehensive MDX content covering:
- How to combine text and image inputs
- Effective multimodal prompt patterns
- Image encoding and API formats
- Multi-image analysis techniques
- Prompt engineering for vision tasks
- Common pitfalls and solutions
- Best practices for accuracy

Target: 500-700 lines of comprehensive content (intermediate difficulty).

**Step 2: Commit**

```bash
git add content/sprints/sprint-4/concepts/multimodal-prompting.mdx
git commit -m "feat: add multimodal prompting techniques concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Concept 3 - Cross-Modal Applications & Use Cases

**Files:**
- Create: `content/sprints/sprint-4/concepts/cross-modal-applications.mdx`

**Step 1: Write cross-modal applications concept**

Create comprehensive MDX content covering:
- Real-world multimodal use cases
- Visual Q&A systems
- Document analysis and OCR
- Product catalog automation
- Accessibility applications
- Content moderation
- Medical imaging assistance
- Architecture patterns for multimodal apps
- Production considerations

Target: 600-800 lines of comprehensive content (advanced difficulty).

**Step 2: Commit**

```bash
git add content/sprints/sprint-4/concepts/cross-modal-applications.mdx
git commit -m "feat: add cross-modal applications & use cases concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Lab Exercises Specifications

**Files:**
- Create: `content/sprints/sprint-4/labs/lab-1-image-analysis.json`
- Create: `content/sprints/sprint-4/labs/lab-2-diagram-extraction.json`
- Create: `content/sprints/sprint-4/labs/lab-3-visual-qa.json`
- Create: `content/sprints/sprint-4/labs/lab-4-multimodal-input.json`

**Step 1: Create Lab 1 - Image Analysis with Claude**

Create `content/sprints/sprint-4/labs/lab-1-image-analysis.json`:

```json
{
  "id": "lab-1-image-analysis",
  "title": "Analyze Images with Claude",
  "description": "Practice basic image analysis using Claude's vision API",
  "difficulty": "intermediate",
  "estimatedMinutes": 30,
  "language": "javascript",
  "starterCode": "/**\n * Analyze an image and extract key information\n * @param {string} imageBase64 - Base64 encoded image\n * @param {string} task - What to analyze (e.g., 'describe', 'identify objects', 'extract text')\n * @returns Analysis result\n */\nasync function analyzeImage(imageBase64, task) {\n  // Your code here\n  // Use Claude API with vision capability\n  return null\n}\n\n/**\n * Encode image file to base64\n * @param {File} file - Image file\n * @returns Base64 string\n */\nfunction encodeImage(file) {\n  // Your code here\n  return null\n}\n",
  "instructions": "Implement image analysis functions:\n1. `encodeImage(file)`: Convert image file to base64 string\n2. `analyzeImage(imageBase64, task)`: Call Claude API with image\n   - Use proper image format (base64 with media type)\n   - Include task in prompt\n   - Return structured analysis\n\nClaude vision API format:\n- model: 'claude-3-5-sonnet-20250129'\n- messages with image content type\n- image_source with base64 data",
  "testCases": [
    {
      "input": "encodeImage(mockImageFile).startsWith('data:image/')",
      "expectedOutput": "true",
      "description": "Encodes image with proper data URL format"
    },
    {
      "input": "encodeImage(mockImageFile).includes('base64,')",
      "expectedOutput": "true",
      "description": "Includes base64 encoding marker"
    },
    {
      "input": "typeof await analyzeImage(mockBase64, 'describe')",
      "expectedOutput": "string",
      "description": "Returns analysis as string"
    },
    {
      "input": "(await analyzeImage(mockBase64, 'describe')).length > 0",
      "expectedOutput": "true",
      "description": "Returns non-empty analysis"
    }
  ],
  "hints": [
    "Use FileReader API for base64 encoding",
    "Image format: {type: 'image', source: {type: 'base64', media_type: 'image/jpeg', data: base64}}",
    "Include image in messages array with text prompt",
    "Handle async/await for Claude API calls"
  ]
}
```

**Step 2: Create Lab 2 - Extract Information from Diagrams**

Create `content/sprints/sprint-4/labs/lab-2-diagram-extraction.json`:

```json
{
  "id": "lab-2-diagram-extraction",
  "title": "Extract Data from Diagrams",
  "description": "Extract structured information from charts, diagrams, and infographics",
  "difficulty": "intermediate",
  "estimatedMinutes": 30,
  "language": "javascript",
  "starterCode": "/**\n * Extract structured data from a diagram\n * @param {string} imageBase64 - Base64 encoded diagram image\n * @param {string} dataType - Type of data to extract ('chart', 'flowchart', 'table')\n * @returns Structured data object\n */\nasync function extractDiagramData(imageBase64, dataType) {\n  // Your code here\n  return null\n}\n\n/**\n * Parse Claude's response into structured format\n * @param {string} response - Claude API response\n * @returns Parsed data object\n */\nfunction parseStructuredData(response) {\n  // Your code here\n  return null\n}\n",
  "instructions": "Build diagram data extraction:\n1. `extractDiagramData(imageBase64, dataType)`: Extract data from visual diagrams\n   - Request structured output (JSON format)\n   - Specify what data format to extract\n   - Handle different diagram types\n\n2. `parseStructuredData(response)`: Parse Claude's text response\n   - Extract JSON from response\n   - Validate data structure\n   - Return parsed object\n\nUse clear prompts like: 'Extract the data from this chart as JSON with keys: labels, values'",
  "testCases": [
    {
      "input": "typeof await extractDiagramData(mockChartImage, 'chart')",
      "expectedOutput": "object",
      "description": "Returns object for chart data"
    },
    {
      "input": "Array.isArray((await extractDiagramData(mockChartImage, 'chart')).labels)",
      "expectedOutput": "true",
      "description": "Chart data has labels array"
    },
    {
      "input": "Array.isArray((await extractDiagramData(mockChartImage, 'chart')).values)",
      "expectedOutput": "true",
      "description": "Chart data has values array"
    },
    {
      "input": "typeof parseStructuredData('{\"key\": \"value\"}')",
      "expectedOutput": "object",
      "description": "Parses JSON string to object"
    },
    {
      "input": "parseStructuredData('{\"key\": \"value\"}').key",
      "expectedOutput": "value",
      "description": "Preserves data structure"
    }
  ],
  "hints": [
    "Be explicit in prompts: 'Return ONLY valid JSON'",
    "Use JSON.parse() to convert response",
    "Wrap in try-catch for parsing errors",
    "Validate expected keys exist in parsed data"
  ]
}
```

**Step 3: Create Lab 3 - Visual Q&A Implementation**

Create `content/sprints/sprint-4/labs/lab-3-visual-qa.json`:

```json
{
  "id": "lab-3-visual-qa",
  "title": "Build Visual Q&A System",
  "description": "Create a system that answers questions about images",
  "difficulty": "advanced",
  "estimatedMinutes": 45,
  "language": "javascript",
  "starterCode": "/**\n * Answer questions about an image\n * @param {string} imageBase64 - Base64 encoded image\n * @param {string} question - Question about the image\n * @returns Answer string\n */\nasync function answerImageQuestion(imageBase64, question) {\n  // Your code here\n  return null\n}\n\n/**\n * Process multiple questions about the same image\n * @param {string} imageBase64 - Base64 encoded image\n * @param {string[]} questions - Array of questions\n * @returns Array of answers\n */\nasync function batchImageQA(imageBase64, questions) {\n  // Your code here\n  return []\n}\n",
  "instructions": "Implement visual Q&A system:\n1. `answerImageQuestion(imageBase64, question)`: Answer single question\n   - Combine image and question in prompt\n   - Get focused answer from Claude\n   - Return concise response\n\n2. `batchImageQA(imageBase64, questions)`: Handle multiple questions\n   - Process all questions for same image\n   - Maintain context across questions\n   - Return array of answers\n\nOptimize for accuracy and relevance.",
  "testCases": [
    {
      "input": "typeof await answerImageQuestion(mockImage, 'What colors are visible?')",
      "expectedOutput": "string",
      "description": "Returns string answer"
    },
    {
      "input": "(await answerImageQuestion(mockImage, 'What is this?')).length > 0",
      "expectedOutput": "true",
      "description": "Returns non-empty answer"
    },
    {
      "input": "Array.isArray(await batchImageQA(mockImage, ['Q1?', 'Q2?']))",
      "expectedOutput": "true",
      "description": "Batch returns array"
    },
    {
      "input": "(await batchImageQA(mockImage, ['Q1?', 'Q2?'])).length",
      "expectedOutput": "2",
      "description": "Returns answer for each question"
    }
  ],
  "hints": [
    "Craft clear, specific prompts",
    "For batch: can make separate API calls or single call with all questions",
    "Consider token costs when batching",
    "Test with different question types"
  ]
}
```

**Step 4: Create Lab 4 - Combine Text + Image Inputs**

Create `content/sprints/sprint-4/labs/lab-4-multimodal-input.json`:

```json
{
  "id": "lab-4-multimodal-input",
  "title": "Multi-Image Analysis",
  "description": "Compare and analyze multiple images with combined text context",
  "difficulty": "advanced",
  "estimatedMinutes": 60,
  "language": "javascript",
  "starterCode": "/**\n * Compare multiple images and provide analysis\n * @param {string[]} imageBase64Array - Array of base64 encoded images\n * @param {string} comparisonTask - What to compare (e.g., 'similarities', 'differences', 'best option')\n * @param {string} context - Additional text context\n * @returns Comparison analysis\n */\nasync function compareImages(imageBase64Array, comparisonTask, context) {\n  // Your code here\n  return null\n}\n\n/**\n * Analyze image in context of text description\n * @param {string} imageBase64 - Base64 encoded image\n * @param {string} textContext - Text providing context\n * @param {string} analysisType - Type of analysis to perform\n * @returns Contextual analysis\n */\nasync function analyzeWithContext(imageBase64, textContext, analysisType) {\n  // Your code here\n  return null\n}\n",
  "instructions": "Build multimodal analysis functions:\n1. `compareImages(imageBase64Array, comparisonTask, context)`: Multi-image comparison\n   - Include all images in single API call\n   - Provide task and context in prompt\n   - Get comparative analysis\n\n2. `analyzeWithContext(imageBase64, textContext, analysisType)`: Contextual analysis\n   - Combine text context with image\n   - Perform analysis based on both inputs\n   - Return integrated insights\n\nUse Claude's ability to see all images in conversation.",
  "testCases": [
    {
      "input": "typeof await compareImages([mockImg1, mockImg2], 'differences', 'products')",
      "expectedOutput": "string",
      "description": "Returns comparison analysis"
    },
    {
      "input": "(await compareImages([mockImg1, mockImg2], 'differences', 'products')).length > 50",
      "expectedOutput": "true",
      "description": "Returns detailed comparison"
    },
    {
      "input": "typeof await analyzeWithContext(mockImage, 'This is a product photo', 'quality')",
      "expectedOutput": "string",
      "description": "Returns contextual analysis"
    },
    {
      "input": "(await analyzeWithContext(mockImage, 'context', 'analysis')).length > 0",
      "expectedOutput": "true",
      "description": "Incorporates context in analysis"
    }
  ],
  "hints": [
    "Multiple images: add each as separate content block in messages",
    "Order matters - reference 'first image', 'second image' in prompt",
    "Include context in system message or user prompt",
    "Request specific comparison format for structured output"
  ]
}
```

**Step 5: Commit**

```bash
git add content/sprints/sprint-4/labs/
git commit -m "feat: add Sprint 4 lab exercise specifications

- Lab 1: Analyze images with Claude vision API
- Lab 2: Extract structured data from diagrams
- Lab 3: Build visual Q&A system
- Lab 4: Multi-image comparison and contextual analysis

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Project Specification

**Files:**
- Create: `content/sprints/sprint-4/project.json`

**Step 1: Create project specification**

Create `content/sprints/sprint-4/project.json`:

```json
{
  "id": "visual-product-analyzer",
  "title": "Visual Product Analyzer",
  "description": "Build an AI-powered product analysis tool that compares product images, extracts features, and generates recommendations",
  "difficulty": "intermediate",
  "estimatedHours": 4,
  "technologies": ["Next.js", "Claude API (Vision)", "TypeScript", "Prisma"],
  "learningObjectives": [
    "Implement Claude vision API for image analysis",
    "Build multi-image comparison features",
    "Extract structured data from product images",
    "Create recommendation engine based on visual features",
    "Handle image uploads and processing",
    "Generate detailed product descriptions"
  ],
  "requirements": {
    "functional": [
      "Upload product images (single or multiple)",
      "Analyze product features from images",
      "Compare multiple products side-by-side",
      "Generate detailed product descriptions",
      "Extract specifications from product photos",
      "Provide purchase recommendations",
      "Display visual evidence for claims"
    ],
    "technical": [
      "Use Claude API with vision capability",
      "Handle image upload and base64 encoding",
      "Implement multi-image analysis",
      "Store analysis results in database",
      "Support multiple image formats (JPEG, PNG, WebP)",
      "Optimize image size for API calls"
    ],
    "ui": [
      "Image upload interface (drag & drop)",
      "Product comparison view (2-4 products)",
      "Analysis results display with image thumbnails",
      "Visual feature highlighting",
      "Recommendation cards with reasoning",
      "Loading states during analysis"
    ]
  },
  "successCriteria": [
    {
      "criterion": "Analysis Accuracy",
      "description": "Correctly identifies products, extracts key features, accurate descriptions",
      "weight": 30
    },
    {
      "criterion": "Comparison Quality",
      "description": "Meaningful comparisons with visual evidence, highlights key differences",
      "weight": 25
    },
    {
      "criterion": "User Experience",
      "description": "Smooth upload, clear results, intuitive comparison interface",
      "weight": 20
    },
    {
      "criterion": "Recommendations",
      "description": "Helpful recommendations based on features and use case",
      "weight": 15
    },
    {
      "criterion": "Code Quality",
      "description": "Clean code, proper error handling, good UI/UX",
      "weight": 10
    }
  ],
  "testProducts": [
    "Compare 3 different laptop models",
    "Analyze smartphone camera features",
    "Extract specifications from product packaging",
    "Compare similar products (e.g., two coffee makers)",
    "Identify product from lifestyle photos"
  ],
  "starterFiles": {
    "structure": [
      "app/api/analyze-product/route.ts",
      "lib/vision/image-processor.ts",
      "lib/vision/product-analyzer.ts",
      "lib/vision/comparison-engine.ts",
      "components/ImageUpload.tsx",
      "components/ProductComparison.tsx",
      "components/AnalysisResults.tsx"
    ]
  },
  "technicalGuidance": {
    "imageFormat": "Convert images to base64 with proper media type (image/jpeg, image/png)",
    "apiUsage": "Use claude-3-5-sonnet-20250129 model with vision capability",
    "multiImageLimit": "Claude supports up to 5 images per request - batch wisely",
    "promptPattern": "Combine visual analysis request with structured output format",
    "optimization": "Resize large images to max 1568px on longest side before encoding",
    "caching": "Cache analysis results for same product to reduce API costs"
  },
  "deploymentRequirements": {
    "platform": "Vercel",
    "environment": [
      "ANTHROPIC_API_KEY",
      "DATABASE_URL"
    ],
    "instructions": "Deploy to Vercel, configure API key, test image upload limits"
  },
  "estimatedCosts": {
    "development": {
      "vision": "$2.00 (100 image analyses @ $0.02 each)",
      "llm": "$0.50 (text generation)",
      "total": "$2.50"
    },
    "production": {
      "vision": "$20/month (1000 analyses)",
      "llm": "$5/month (supporting text)",
      "storage": "$0 (use temporary uploads)",
      "total": "$25/month"
    }
  },
  "extensionIdeas": [
    "Add OCR for extracting text from product labels",
    "Implement product category classification",
    "Build price comparison with web scraping",
    "Add similar product search",
    "Create shopping cart integration",
    "Implement accessibility features (alt text generation)",
    "Add multi-language support",
    "Build product review summarization from images"
  ],
  "rubric": {
    "exceeds": "Analyzes 3+ products accurately, comparisons are insightful with visual evidence, UI is polished, recommendations are helpful, proper error handling",
    "meets": "Analyzes 2+ products, basic comparisons work, functional UI, some recommendations, handles common errors",
    "approaching": "Single product analysis works, limited comparison features, basic UI, few recommendations",
    "incomplete": "Image upload fails, analysis errors, or comparison not working"
  }
}
```

**Step 2: Commit**

```bash
git add content/sprints/sprint-4/project.json
git commit -m "feat: add Sprint 4 project specification

Visual Product Analyzer - Build AI-powered product analysis tool with
multi-image comparison and recommendations.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build and Test Sprint 4 Content

**Files:**
- Test: Build succeeds
- Test: All Sprint 4 routes load

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Verify content structure**

```bash
ls -la content/sprints/sprint-4/concepts/
ls -la content/sprints/sprint-4/labs/
```

Expected: All 3 concept files and 4 lab files present

**Step 3: Report success**

No commit needed - this is verification only.

---

## Task 8: Update Dashboard to Show Sprint 4

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Add Sprint 4 progress fetching**

After Sprint 3 progress (around line 30), add:
```typescript
const sprint4Progress = user ? await getSprintProgress(user.id, 'sprint-4') : null
```

**Step 2: Add Sprint 4 card to dashboard**

After Sprint 3 card, add:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sprint 4</CardTitle>
    <CardDescription>Multimodal AI</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Build applications that understand images and combine text with vision
    </p>
    {sprint4Progress && sprint4Progress.totalCount > 0 ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              {sprint4Progress.completedCount} of {sprint4Progress.totalCount} concepts
            </span>
            <span className="font-medium">
              {Math.round(sprint4Progress.percentComplete)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${sprint4Progress.percentComplete}%` }}
            />
          </div>
        </div>
        <Link href="/learn/sprint-4">
          <Button size="sm" variant="outline" className="w-full">
            {sprint4Progress.completedCount === 0
              ? 'Start Sprint'
              : sprint4Progress.completedCount === sprint4Progress.totalCount
              ? 'Review Sprint'
              : 'Continue Sprint'}
          </Button>
        </Link>
      </div>
    ) : (
      <Link href="/learn/sprint-4">
        <Button size="sm" variant="outline">
          Start Sprint
        </Button>
      </Link>
    )}
  </CardContent>
</Card>
```

**Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/page.tsx
git commit -m "feat: add Sprint 4 card to dashboard

Display Sprint 4: Multimodal AI on dashboard with progress tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Documentation and README Update

**Files:**
- Modify: `README.md`
- Create: `docs/SPRINT-4-GUIDE.md`

**Step 1: Update README**

Add Sprint 4 to Learning Platform features (around line 197):
```markdown
- ✅ **Sprint 4**: Multimodal AI (vision models, image analysis, cross-modal apps)
```

**Step 2: Create Sprint 4 guide**

Create comprehensive `docs/SPRINT-4-GUIDE.md` with:
- Overview of Sprint 4
- Learning path (3 concepts, 4 labs, 1 project)
- Technical details on vision APIs and multimodal prompting
- Testing checklist
- Common issues (image encoding, API limits, costs)
- Deployment notes
- Resources

**Step 3: Commit**

```bash
git add README.md docs/SPRINT-4-GUIDE.md
git commit -m "docs: add Sprint 4 documentation and update README

- Update README with Sprint 4 in Learning Platform
- Create comprehensive Sprint 4 implementation guide
- Document vision APIs, multimodal patterns, and best practices

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification

After completing all tasks:

1. **Build passes**: `npm run build` succeeds
2. **All routes load**: Sprint 4 pages accessible
3. **Content quality**: Concepts are comprehensive and accurate
4. **Labs functional**: Lab exercises have clear instructions and test cases
5. **Project well-defined**: Project spec has clear requirements and rubric
6. **Documentation complete**: README and guides updated

---

## Summary

This plan implements Sprint 4 with:
- ✅ Sprint structure (metadata, directories)
- ✅ 3 comprehensive concept lessons (vision models, multimodal prompting, cross-modal applications)
- ✅ 4 hands-on lab exercises (image analysis, diagram extraction, visual Q&A, multi-image comparison)
- ✅ 1 real-world project (Visual Product Analyzer)
- ✅ Dashboard integration
- ✅ Complete documentation

**Estimated Time**: 8-12 hours for full implementation
**Complexity**: Similar to Sprint 3, intermediate-to-advanced content
