# User Onboarding Design

## Overview

The onboarding flow is designed to personalize the learning experience by assessing user skills and recommending an appropriate learning path.

## Flow Structure

```
┌─────────────┐
│   Welcome   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Assessment  │ (3 questions)
└──────┬──────┘
       │
       v
┌─────────────┐
│ Path Select │ (Recommendation shown)
└──────┬──────┘
       │
       v
┌─────────────┐
│  All Set!   │
└──────┬──────┘
       │
       v
   Dashboard
```

## Components

### 1. WelcomeFlow (`src/components/onboarding/WelcomeFlow.tsx`)

Main orchestrator component that:
- Manages step navigation
- Tracks user progress (4 steps)
- Saves onboarding data via API
- Redirects to dashboard on completion

**Props**: None (self-contained)

**State**:
- `currentStep`: 0-3
- `answers`: Assessment responses
- `selectedPath`: Chosen learning path

### 2. SkillAssessment (`src/components/onboarding/SkillAssessment.tsx`)

Collects user information through 3 multiple-choice questions:

1. **Programming Experience**
   - Beginner (< 1 year)
   - Intermediate (1-3 years)
   - Advanced (3+ years)

2. **AI Exposure**
   - No experience
   - Played with ChatGPT/Claude
   - Used AI APIs in projects
   - Built production AI apps

3. **Primary Goal**
   - Learn fundamentals
   - Build specific applications
   - Career transition
   - Business integration

**Props**:
- `answers`: Record<string, string>
- `onAnswersChange`: (answers) => void

### 3. LearningPathSelector (`src/components/onboarding/LearningPathSelector.tsx`)

Displays 4 learning path options with automatic recommendation based on assessment:

**Paths**:
1. **Full Curriculum** (12 weeks, 8 modules)
   - Complete journey
   - All topics covered
   - Recommended for most users

2. **Rapid Builder** (6 weeks, 5 modules)
   - Skip theory
   - Focus on building
   - For experienced developers

3. **RAG Specialist** (4 weeks, 3 modules)
   - Deep dive into RAG
   - Document processing
   - Vector search

4. **Agent Developer** (4 weeks, 3 modules)
   - Focus on agents
   - Tool use
   - Autonomous systems

**Props**:
- `answers`: Assessment responses
- `selectedPath`: Currently selected path ID
- `onPathChange`: (pathId) => void

**Behavior**:
- Auto-selects recommended path based on assessment
- User can override recommendation
- Shows "Recommended" badge on suggested path

## Recommendation Logic

Defined in `src/lib/onboarding/personalization.ts`:

```typescript
function recommendPath(answers: AssessmentAnswers): LearningPath
```

**Rules**:

1. **Beginner Path** → Full Curriculum (slow pace)
   - If `experience === 'beginner'` OR `ai_exposure === 'none'`

2. **Rapid Builder** → 5 modules (fast pace)
   - If `goal === 'build'` AND `experience === 'advanced'` AND `ai_exposure !== 'none'`

3. **RAG Specialist** → 3 modules (medium pace)
   - If `goal === 'learn'` AND `ai_exposure` in ['some', 'api']

4. **Agent Developer** → 3 modules (medium pace)
   - If `goal === 'build'` AND `ai_exposure === 'api'`

5. **Default** → Full Curriculum (medium pace)
   - For career transition and business goals

## API Integration

### POST `/api/onboarding/complete`

Saves user's onboarding data to database.

**Request Body**:
```json
{
  "answers": {
    "experience": "intermediate",
    "ai_exposure": "some",
    "goal": "learn"
  },
  "selectedPath": "full"
}
```

**Response**:
```json
{
  "success": true,
  "path": {
    "id": "full",
    "recommendedPace": "medium"
  }
}
```

**Storage**:
Data is saved in `user.metadata` as JSON:

```json
{
  "learningPathId": "full",
  "recommendedPace": "medium",
  "assessmentAnswers": { /* ... */ },
  "onboardingCompletedAt": "2026-02-01T..."
}
```

## User Experience Principles

### 1. Progressive Disclosure
- One question at a time
- Clear progress indicator
- No overwhelming choices

### 2. Smart Defaults
- Auto-recommend based on answers
- Allow user override
- Explain reasoning

### 3. Low Friction
- 4 steps only
- ~2 minutes to complete
- Skip option (future)

### 4. Clear Navigation
- Visible progress dots
- Previous/Next buttons
- Disabled when invalid

### 5. Visual Feedback
- Selected state clearly shown
- Smooth transitions
- Loading states for API calls

## Design System

### Colors
- Primary: Purple (#8b5cf6)
- Secondary: Blue (#3b82f6)
- Success: Green (#10b981)
- Background: Gradient purple-50 to blue-50

### Typography
- Title: 2xl, bold
- Description: base, text-slate-600
- Card text: sm to base

### Spacing
- Card padding: 4-6
- Gap between cards: 4
- Progress bar height: 2

## Accessibility

- Keyboard navigation (Tab, Enter)
- Screen reader labels
- Focus indicators
- High contrast text
- Skip to content (future)

## Analytics

Track onboarding metrics:

```typescript
// Step completion
analytics.track('onboarding_step_completed', {
  step: 'assessment',
  stepNumber: 1,
})

// Path selected
analytics.track('learning_path_selected', {
  pathId: 'full',
  recommended: true,
  overridden: false,
})

// Onboarding completed
analytics.track('onboarding_completed', {
  timeSpent: 120, // seconds
  pathSelected: 'full',
})

// Onboarding abandoned
analytics.track('onboarding_abandoned', {
  lastStep: 'assessment',
  stepNumber: 1,
})
```

## Performance

- Initial load: < 1s
- Step transitions: < 200ms
- API save: < 500ms
- Bundle size: ~15KB gzipped

## Testing

### Unit Tests
```typescript
describe('LearningPathSelector', () => {
  it('recommends full curriculum for beginners', () => {
    const answers = {
      experience: 'beginner',
      ai_exposure: 'none',
      goal: 'learn',
    }
    const path = recommendPath(answers)
    expect(path.id).toBe('full')
  })
})
```

### E2E Tests
```typescript
test('complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding')

  // Welcome step
  await page.click('button:has-text("Next")')

  // Assessment
  await page.click('[id="experience-intermediate"]')
  await page.click('[id="ai_exposure-some"]')
  await page.click('[id="goal-learn"]')
  await page.click('button:has-text("Next")')

  // Path selection
  await expect(page.locator('.recommended-badge')).toBeVisible()
  await page.click('button:has-text("Next")')

  // Completion
  await page.click('button:has-text("Start Learning")')
  await expect(page).toHaveURL('/dashboard')
})
```

## Future Enhancements

1. **A/B Testing**
   - Test different question orders
   - Test different path descriptions
   - Optimize conversion

2. **Skip Onboarding**
   - Option to skip for returning users
   - Default to most popular path

3. **Video Introduction**
   - Welcome video from instructor
   - Platform tour video

4. **Social Proof**
   - "Join 10,000+ learners"
   - Student testimonials
   - Success stories

5. **Personalized Welcome Email**
   - Send after onboarding
   - Include recommended first steps
   - Link to community

6. **Adaptive Learning**
   - Update path based on progress
   - Suggest path changes
   - Skill gap analysis

## Maintenance

### Weekly
- Monitor completion rate
- Check for drop-offs
- Review user feedback

### Monthly
- Analyze path selection distribution
- Update recommendations if needed
- A/B test variations

### Quarterly
- User interviews
- Comprehensive UX review
- Major improvements

## Metrics to Track

- **Completion Rate**: % who finish all 4 steps
- **Time to Complete**: Average duration
- **Path Distribution**: % selecting each path
- **Override Rate**: % who change recommendation
- **Abandonment Points**: Where users drop off
- **Conversion to First Lesson**: % who start learning

## Contact

For onboarding improvements:
- Product: product@aicelerate.com
- Design: design@aicelerate.com
- Engineering: dev@aicelerate.com
