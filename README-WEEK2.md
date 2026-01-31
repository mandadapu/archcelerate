# Week 2: Skill Diagnosis Implementation

## Completed Features

- ✅ Database schema for skill diagnosis
- ✅ 20-question quiz bank across 6 skill areas
- ✅ Claude AI integration for analysis
- ✅ Interactive quiz UI with progress tracking
- ✅ Results page with skill radar chart
- ✅ Personalized learning path recommendations
- ✅ Dashboard integration
- ✅ Validation and error handling
- ✅ Toast notifications

## How It Works

1. User takes 20-question quiz covering AI fundamentals
2. Answers submitted to API route
3. Claude analyzes results and generates:
   - Skill scores (0-1 for each area)
   - Recommended path (foundation/standard/fast-track)
   - Focus areas and concepts to skip
4. Results stored in database
5. User sees personalized recommendations

## API Endpoints

### POST /api/diagnosis/analyze
Analyzes quiz results and returns recommendations

**Request:**
```json
{
  "answers": [
    {
      "questionId": "llm-1",
      "selectedOptions": ["b"],
      "isCorrect": true
    }
  ]
}
```

**Response:**
```json
{
  "userId": "...",
  "analysis": {
    "skillScores": {
      "llm_fundamentals": 0.8,
      "prompt_engineering": 0.6,
      ...
    },
    "recommendedPath": "standard",
    "summary": "..."
  }
}
```

## Database Tables

### SkillDiagnosis
Stores quiz results and AI analysis

**Schema:**
- `userId` (String, Primary Key)
- `quizAnswers` (JSON)
- `skillScores` (JSON)
- `recommendedPath` (String)
- `completedAt` (DateTime)

### LearningEvent
Logs diagnosis completion events

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **Anthropic Claude API** - AI-powered quiz analysis
- **Recharts** - Data visualization for skill radar
- **Sonner** - Toast notifications
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running on port 5433
- Anthropic API key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create/update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   ANTHROPIC_API_KEY="your-api-key-here"
   ```

3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open http://localhost:3000

## Testing the Feature

### Manual Testing Flow

1. **Navigate to Dashboard**
   - Go to http://localhost:3000/dashboard
   - Verify "Start Skill Diagnosis" prompt appears

2. **Start Quiz**
   - Click "Start Skill Diagnosis"
   - Navigate to /diagnosis
   - Verify 20 questions load correctly

3. **Complete Quiz**
   - Answer all 20 questions
   - Test navigation (Previous/Next buttons)
   - Verify progress bar updates
   - Submit quiz

4. **View Results**
   - Verify loading state shows during analysis
   - Check results page displays:
     - Overall percentage score
     - Skill radar chart
     - Learning path recommendation
     - Skill breakdown with progress bars

5. **Return to Dashboard**
   - Navigate back to dashboard
   - Verify diagnosis shows as completed
   - Check "View results" link works

### Edge Cases to Test

- Try answering only some questions (should require all)
- Test multiple-choice questions work correctly
- Verify navigation limits (can't go before first/after last)
- Test error handling (disconnect from network during submission)

## Project Structure

```
app/
├── (dashboard)/
│   ├── dashboard/page.tsx          # Main dashboard with diagnosis status
│   └── diagnosis/
│       ├── page.tsx                # Quiz interface
│       ├── loading.tsx             # Loading skeleton
│       └── results/page.tsx        # Results display
├── api/
│   └── diagnosis/
│       └── analyze/route.ts        # Analysis API endpoint
├── layout.tsx                      # Root layout with Providers
└── providers.tsx                   # Client-side providers

components/
├── diagnosis/
│   ├── SkillRadar.tsx             # Radar chart visualization
│   └── LearningPathCard.tsx       # Learning path recommendation card
├── quiz/
│   ├── QuizQuestion.tsx           # Question display with options
│   ├── QuizProgress.tsx           # Progress bar
│   └── QuizNavigation.tsx         # Navigation buttons
└── ui/                            # shadcn/ui components

lib/
├── ai/
│   ├── client.ts                  # Claude API integration
│   └── prompts.ts                 # System prompts
├── quiz/
│   └── questions.ts               # Question bank (20 questions)
└── utils/
    └── validation.ts              # Quiz answer validation

types/
├── database.ts                    # Prisma types
└── diagnosis.ts                   # Quiz and diagnosis types

prisma/
├── schema.prisma                  # Database schema
└── migrations/                    # Database migrations
```

## Key Implementation Details

### Quiz Question Types
- **Single Choice**: Standard multiple choice (1 answer)
- **Multiple Choice**: Select all that apply
- **Code Evaluation**: Code snippet with choices

### Skill Areas Assessed
1. **LLM Fundamentals** (5 questions)
2. **Prompt Engineering** (4 questions)
3. **RAG** (3 questions)
4. **Agents** (3 questions)
5. **Multimodal** (2 questions)
6. **Production AI** (3 questions)

### Learning Path Logic
- **Foundation First**: <50% overall score
- **Standard Track**: 50-80% overall score
- **Fast Track**: >80% overall score

## Troubleshooting

### Common Issues

**Issue: API key not working**
- Solution: Verify ANTHROPIC_API_KEY in .env.local
- Check key is valid at https://console.anthropic.com/

**Issue: Database connection error**
- Solution: Ensure PostgreSQL is running on port 5433
- Run `npx prisma migrate dev` to apply migrations

**Issue: Toast notifications not showing**
- Solution: Verify Providers wrapper is in root layout
- Check Toaster component is rendered

## Next Steps (Week 3)

Week 3 will add:
- AI Mentor chat interface
- Sprint 1 content structure
- Labs infrastructure
- Streaming responses
- Chat persistence

## Performance Considerations

- Quiz questions are static (no database queries during quiz)
- Results page uses server-side rendering for SEO
- Client-side state management for quiz navigation
- Optimistic UI updates with loading states

## Security

- Quiz answers validated on both client and server
- Authentication required for all API routes
- RLS policies on database (Prisma enforces user ownership)
- API key stored in environment variables (not committed)

---

**Status:** ✅ Week 2 Complete - Skill Diagnosis Ready for Production
