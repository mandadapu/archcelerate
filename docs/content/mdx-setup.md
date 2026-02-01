# MDX Content Infrastructure

## Overview

The platform uses MDX (Markdown + JSX) for educational content, enabling rich, interactive lessons with custom components.

## Architecture

### Content Structure

```
content/
└── modules/
    └── module-1-foundations/
        ├── module.mdx           # Module metadata
        ├── lesson-1-intro.mdx   # Lesson 1
        ├── lesson-2-ml.mdx      # Lesson 2
        └── ...
```

### Document Types

#### Module
Represents a collection of related lessons.

**Frontmatter:**
```yaml
---
title: "Module Title"
description: "Module description"
order: 1
icon: "icon-name"
color: "#hex-color"
---
```

#### Lesson
Individual learning unit within a module.

**Frontmatter:**
```yaml
---
title: "Lesson Title"
description: "Lesson description"
duration: 30                    # minutes
difficulty: "beginner"          # beginner | intermediate | advanced
objectives:
  - "Learning objective 1"
  - "Learning objective 2"
prerequisites:
  - "Prerequisite 1"
tags:
  - "tag1"
  - "tag2"
---
```

## Custom MDX Components

### Callout

Highlight important information.

```mdx
<Callout type="info" title="Key Insight">
Important information here
</Callout>
```

**Types:** `info`, `warning`, `success`, `error`

### Exercise

Interactive practice activities.

```mdx
<Exercise title="Practice Problem" difficulty="medium">
Complete the following task...
</Exercise>
```

**Difficulty:** `easy`, `medium`, `hard`

### CodeSandbox

Embed interactive code editors.

```mdx
<CodeSandbox id="sandbox-id" title="Example" height={600} />
```

### Quiz

Multiple choice questions with explanations.

```mdx
<Quiz
  question="What is AI?"
  options={[
    {
      text: "Option 1",
      correct: false,
      explanation: "Why this is wrong"
    },
    {
      text: "Option 2",
      correct: true,
      explanation: "Why this is correct"
    }
  ]}
/>
```

## Content Utilities

### Get All Modules

```typescript
import { getAllModules } from '@/src/lib/mdx'

const modules = getAllModules()
```

### Get Module by Slug

```typescript
import { getModuleBySlug } from '@/src/lib/mdx'

const module = getModuleBySlug('module-1-foundations')
```

### Get Lessons by Module

```typescript
import { getLessonsByModule } from '@/src/lib/mdx'

const lessons = getLessonsByModule('module-1-foundations')
```

### Get Next/Previous Lesson

```typescript
import { getNextLesson, getPreviousLesson } from '@/src/lib/mdx'

const next = getNextLesson('module-1-foundations/lesson-1-intro')
const prev = getPreviousLesson('module-1-foundations/lesson-2-ml')
```

## MDX Processing

The content is processed with the following plugins:

- **remark-gfm**: GitHub Flavored Markdown support
- **remark-math**: Math notation support (LaTeX)
- **rehype-katex**: Render math equations
- **rehype-prism-plus**: Syntax highlighting for code blocks

## Creating New Content

1. Create a new module directory:
   ```bash
   mkdir content/modules/module-name
   ```

2. Add module metadata:
   ```bash
   # content/modules/module-name/module.mdx
   ---
   title: "Module Title"
   description: "Description"
   order: 2
   ---
   ```

3. Add lessons:
   ```bash
   # content/modules/module-name/lesson-1-title.mdx
   ---
   title: "Lesson Title"
   description: "Description"
   duration: 45
   difficulty: "intermediate"
   objectives:
     - "Objective 1"
   ---

   # Lesson content here
   ```

4. Rebuild content:
   ```bash
   npx contentlayer build
   ```

## Best Practices

1. **Naming Convention**: Use `lesson-{number}-{slug}.mdx` for lessons
2. **Order**: Lesson numbers determine display order
3. **Objectives**: Be specific and measurable
4. **Duration**: Estimate realistic completion time
5. **Interactive Elements**: Use Quiz and Exercise components for engagement
6. **Code Examples**: Always provide syntax highlighting language
7. **Callouts**: Use sparingly for key insights
8. **Progressive Difficulty**: Start simple, build complexity

## Troubleshooting

### Content Not Updating

Run `npx contentlayer build` to regenerate content.

### Type Errors

Ensure `tsconfig.json` includes `.contentlayer/generated` in the include array.

### Component Not Rendering

Verify component is imported in `mdxComponents` map in `components.tsx`.
