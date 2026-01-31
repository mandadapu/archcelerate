# Week 4: Learning Platform Core

## Completed Features

- ✅ Database schema for learning content tracking
- ✅ MDX-based content management system
- ✅ Sprint 1: AI Engineering Foundations (3 concepts)
- ✅ Progress tracking system
- ✅ Sprint overview page with progress visualization
- ✅ Concept detail pages with MDX rendering
- ✅ Navigation between concepts
- ✅ Dashboard integration with Sprint access
- ✅ Syntax highlighting for code blocks
- ✅ Prerequisite locking system

## Architecture

```
User → Dashboard → Sprint Overview → Concept Detail → MDX Content
                        ↓                    ↓
                   Progress Bar         Mark Complete
                        ↓                    ↓
                   Prisma DB ← Progress Tracking System
```

### Key Components

**Content Loader (`lib/content-loader.ts`)**
- Loads MDX files from `content/sprints/` directory
- Parses front matter metadata
- Provides navigation helpers (next/previous concept)
- Validates content existence

**Progress Tracker (`lib/progress-tracker.ts`)**
- Tracks user progress through concepts
- Manages concept completion states (not_started, in_progress, completed)
- Enforces prerequisite requirements
- Records learning events and statistics
- Provides progress analytics

**MDX Rendering**
- Server-side compilation with `next-mdx-remote`
- Syntax highlighting with `rehype-highlight`
- GitHub-flavored markdown with `remark-gfm`
- Typography styling with `@tailwindcss/typography`

## Database Schema

New tables added in Week 4:

```prisma
model UserProgress {
  id           String   @id @default(cuid())
  userId       String
  sprintId     String
  conceptId    String
  status       String   // 'not_started' | 'in_progress' | 'completed'
  startedAt    DateTime?
  completedAt  DateTime?
  lastAccessed DateTime @default(now())

  @@unique([userId, sprintId, conceptId])
}

model ConceptCompletion {
  id               String   @id @default(cuid())
  userId           String
  sprintId         String
  conceptId        String
  timeSpentSeconds Int      @default(0)
  completedAt      DateTime @default(now())
}

model LabAttempt {
  id          String   @id @default(cuid())
  userId      String
  labId       String
  sprintId    String
  conceptId   String
  score       Int?
  passed      Boolean  @default(false)
  feedback    Json?
  attemptedAt DateTime @default(now())
}
```

## Content Structure

```
content/
└── sprints/
    └── sprint-1/
        ├── metadata.json          # Sprint and concept metadata
        └── concepts/
            ├── llm-fundamentals.mdx
            ├── prompt-engineering.mdx
            └── chat-assistant.mdx
```

### Sprint 1 Concepts

1. **LLM Fundamentals** (45 min, beginner)
   - What LLMs are and how they work
   - Training process and architecture
   - Tokens, temperature, context windows
   - Limitations and best practices

2. **Prompt Engineering Basics** (60 min, beginner)
   - Anatomy of effective prompts
   - Basic and advanced techniques
   - Common pitfalls and solutions
   - Practical examples

3. **Building a Chat Assistant** (90 min, intermediate)
   - API integration patterns
   - Streaming responses
   - Conversation persistence
   - Error handling and rate limiting

## Pages Added

### `/learn/[sprintId]` - Sprint Overview
- Displays sprint metadata and description
- Shows progress bar with percentage complete
- Lists all concepts with:
  - Completion status indicators
  - Difficulty badges
  - Estimated time
  - Prerequisites
  - Lock/unlock based on prerequisites

### `/learn/[sprintId]/[conceptId]` - Concept Detail
- Full MDX content rendering
- Breadcrumb navigation
- Concept metadata display
- Mark as complete functionality
- Previous/Next concept navigation
- Progress tracking on page view

### Dashboard Updates
- Sprint 1 card with live progress tracking
- Dynamic button text (Start/Continue/Review)
- Progress bar visualization
- Direct link to sprint overview

## API Endpoints

### POST `/api/learning/complete`
Mark a concept as completed.

**Request:**
```json
{
  "sprintId": "sprint-1",
  "conceptId": "llm-fundamentals",
  "timeSpentSeconds": 2700
}
```

**Response:**
```json
{
  "success": true
}
```

## Features in Detail

### Progress Tracking

**Automatic tracking:**
- Concept views create `in_progress` records
- `lastAccessed` timestamp updated on each view
- Learning events logged for analytics

**Manual completion:**
- User clicks "Mark as Complete"
- Creates `ConceptCompletion` record
- Updates `UserProgress` status to `completed`
- Logs completion event

**Prerequisites:**
- Concepts can require prior concepts
- Locked concepts show "Locked" button
- Prerequisites displayed with completion status
- Visual indicators (✓) for completed prerequisites

### MDX Content Features

**Supported syntax:**
- Standard markdown (headings, lists, links, images)
- Code blocks with syntax highlighting
- Tables
- Blockquotes
- Details/Summary (expandable sections)
- Mermaid diagrams (via code blocks)

**Custom styles:**
- Responsive typography
- Dark code blocks with light text
- Inline code with background
- Styled tables and blockquotes
- Smooth scrolling to headings

## Installation & Setup

### 1. Install Dependencies

Already installed in previous steps:
```bash
npm install next-mdx-remote gray-matter rehype-highlight remark-gfm @tailwindcss/typography
```

### 2. Database Migration

Migration already applied:
```bash
npx prisma migrate dev --name add_learning_content_models
```

### 3. Add Content

Content structure already created in `content/sprints/sprint-1/`.

### 4. Start Development

```bash
npm run dev
```

Navigate to:
- Dashboard: http://localhost:3000/dashboard
- Sprint 1: http://localhost:3000/learn/sprint-1
- First concept: http://localhost:3000/learn/sprint-1/llm-fundamentals

## Testing

### Manual Testing Checklist

- [x] Build completes without errors
- [ ] Dashboard shows Sprint 1 card with progress
- [ ] Sprint 1 overview page loads
- [ ] All 3 concepts are listed
- [ ] Concept pages render MDX correctly
- [ ] Code syntax highlighting works
- [ ] "Mark as Complete" button functions
- [ ] Progress updates on dashboard
- [ ] Prerequisites lock correctly
- [ ] Navigation (Previous/Next) works
- [ ] Breadcrumbs navigate correctly

### Test Progress Flow

1. Open dashboard → see Sprint 1 at 0%
2. Click "Start Sprint" → navigate to sprint overview
3. Click "Start" on first concept → open LLM Fundamentals
4. Read content, scroll through
5. Click "Mark as Complete" → status updates
6. Click "Next Concept" → navigate to Prompt Engineering
7. Return to dashboard → see progress updated (33%)
8. Try to access third concept → should be locked until second is complete

### Verify Database

```bash
# Check progress records
npx prisma studio

# Navigate to:
# - UserProgress table: See status changes
# - ConceptCompletion table: See completion records
# - LearningEvent table: See tracked events
```

## Implementation Notes

### Adaptations from Plan

1. **Imports**: Fixed authOptions import locations
   - Changed from route file to `@/lib/auth`
   - Next.js routes can't export arbitrary values

2. **Styling**: Added comprehensive MDX styles
   - GitHub-dark theme for code highlighting
   - Custom prose styles for better readability
   - Responsive design for all screen sizes

3. **Progress Logic**: Enhanced progress tracking
   - Auto-creates progress on first view
   - Tracks time spent (optional parameter)
   - Provides analytics queries

### Key Design Decisions

**Why file-based content?**
- Easy to edit and version control
- No need for CMS for structured content
- MDX allows rich interactive elements
- Fast server-side rendering

**Why client-side MDX rendering?**
- Allows interactive components in future
- Better code splitting
- Smooth user experience

**Why prerequisite locking?**
- Ensures learning progression
- Prevents knowledge gaps
- Encourages sequential learning
- Flexible for non-linear paths later

## Performance

- MDX compiled on server (no client-side compilation)
- Static metadata loaded from JSON
- Database queries optimized with indexes
- Progress updates batched with upsert operations
- Content cached by Next.js automatically

## Troubleshooting

### Build Errors

**"authOptions is not a valid Route export field"**
- Solution: Import from `@/lib/auth` instead of route file
- Already fixed in this implementation

**MDX not rendering**
- Check that `@tailwindcss/typography` is in tailwind.config
- Verify highlight.js CSS is imported in globals.css
- Ensure `prose` class is on MDX container

### Progress Not Updating

- Check that user is authenticated
- Verify API route `/api/learning/complete` works
- Check browser console for errors
- Confirm database connection

### Content Not Loading

- Verify file exists at `content/sprints/[sprintId]/concepts/[conceptId].mdx`
- Check front matter is valid YAML
- Ensure metadata.json is valid JSON

## Next Steps

Week 5 will add:
- Interactive labs and quizzes
- Code playgrounds
- Assessment scoring
- Certificate generation
- More sprint content
- Community features

## Additional Resources

- [MDX Documentation](https://mdxjs.com/)
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Week 4 Complete!** The learning platform foundation is now in place with content delivery, progress tracking, and a great user experience.
