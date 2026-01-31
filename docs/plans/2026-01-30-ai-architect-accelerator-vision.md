# Product Vision: AI Architect Accelerator

**Document Version:** 1.0
**Date:** 2026-01-30
**Purpose:** Internal alignment for development team
**Timeline:** MVP in 3 months
**Author:** Product Team

---

## Vision Statement

Transform experienced software engineers into job-ready AI Product Builders through an AI-powered, project-based learning platform that delivers measurable outcomes in 12 weeks. Unlike traditional courses that focus on theory, we provide a "learn by shipping" experience where every graduate leaves with 7 deployed AI products and proven interview skills.

---

## Strategic Approach (MVP - 3 Months)

Given solo development with technical complexity as the primary risk, the MVP strategy focuses on **proving the core learning loop** with Sprint 0 + Sprint 1, while building reusable AI infrastructure that powers all features.

### MVP Scope

**Included in MVP:**
- Sprint 0: Skill diagnosis and personalized learning path
- Sprint 1: Foundation concepts + Project 1 (AI Chat Assistant)
- AI Mentor: Context-aware assistant available throughout
- Code Review AI: Automated feedback on project submissions
- Mock Interview Platform: AI interviewer for system design practice

**Why this scope:** This validates the entire learning experience end-to-end (diagnosis → learning → building → review → interview prep) with one complete project, while building the AI infrastructure that will be reused for Sprints 2-7.

**Post-MVP expansion:** Once validated, add Sprints 2-7 incrementally based on learner feedback and completion rates.

---

## Technical Architecture

### Core Principles

1. **Monolith-first for speed**: Single Next.js app to ship faster as a solo builder
2. **AI-first infrastructure**: Build reusable AI components that power all features
3. **Managed services everywhere**: Minimize operational burden (Vercel, Supabase, hosted AI)
4. **Progressive enhancement**: Start simple, add complexity only when needed

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                  (Single deployment on Vercel)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pages/Routes:                                              │
│  • /dashboard          - Learning progress                  │
│  • /sprint/[n]         - Sprint content & labs             │
│  • /project/[n]        - Project workspace & submission    │
│  • /mentor             - AI Mentor chat interface          │
│  • /interview          - Mock interview platform           │
│  • /api/*              - Backend API routes                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Supabase   │   │   Claude    │   │   Vercel    │
│  (Postgres) │   │     API     │   │   AI SDK    │
│             │   │             │   │             │
│ • Users     │   │ • Mentor    │   │ • Streaming │
│ • Progress  │   │ • Reviews   │   │ • Chat UI   │
│ • Projects  │   │ • Interview │   │             │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Key Technical Decisions

**Frontend:**
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS for styling
- Vercel AI SDK for streaming AI responses
- Zustand or React Context for state management

**Backend:**
- Next.js API routes for all backend logic
- PostgreSQL (Supabase) for data persistence
- Supabase Auth for authentication
- Redis (Upstash) for caching AI responses and session data

**AI Infrastructure:**
- Claude API (Anthropic) as primary LLM
- Single `AIService` abstraction layer for all AI features
- Prompt templates stored in codebase (not DB initially)
- Streaming responses everywhere for better UX

**Deployment:**
- Vercel for hosting (zero config, auto-scaling)
- GitHub for code + CI/CD
- Supabase for database (managed Postgres)
- Upstash for Redis (serverless)

---

## AI Infrastructure Design

### The AI Service Layer

All AI features share a common infrastructure to avoid duplication and manage complexity:

```typescript
// Core AI Service Architecture

class AIService {
  // Unified interface for all AI interactions
  async chat(options: {
    systemPrompt: string
    messages: Message[]
    context?: Record<string, any>
    stream?: boolean
  }): Promise<Response>

  async review(code: string, projectType: string): Promise<Review>
  async interview(problem: string, userResponse: string): Promise<InterviewFeedback>
  async diagnose(answers: DiagnosisAnswers): Promise<LearningPath>
}
```

### AI Feature Breakdown

#### 1. AI Mentor (24/7 Support)

```
User Question → Context Assembly → Claude API → Streamed Response

Context Assembly includes:
├── Current sprint/project
├── User's code (if debugging)
├── Previous mentor conversations (last 5)
├── Concept materials already covered
└── Skill mastery levels

System Prompt Template:
"You are an AI mentor for Sprint {N}. The learner is building {project}.
They have mastered: {skills}. They are currently stuck on: {topic}.
Provide guidance without giving away the solution. Ask probing questions."
```

**Implementation:**
- Stored conversations in `ai_conversations` table
- Context window management (keep last 10 messages + system prompt)
- Streaming UI with typing indicators
- Cost control: Max 4096 tokens per response

#### 2. Code Review AI

```
Code Submission → Analysis → Structured Feedback → UI Presentation

Analysis Pipeline:
1. Extract files from GitHub repo URL or direct upload
2. Identify key files (main logic, not boilerplate)
3. Send to Claude with project rubric
4. Parse structured JSON response
5. Store review in database
6. Present in diff-style UI
```

**System Prompt Template:**
```
You are reviewing Project {N}: {title}.

Review criteria:
- Functionality: Does it work as specified?
- Code quality: Clean, readable, well-structured?
- AI best practices: Proper error handling, streaming, cost optimization?
- Architecture: Appropriate patterns for the problem?

Return JSON:
{
  "overall_score": 0-100,
  "suggestions": [{
    "file": "path/to/file",
    "line": 45,
    "severity": "warning|suggestion",
    "issue": "Description",
    "recommendation": "What to do",
    "why": "Educational explanation"
  }],
  "good_practices": ["What they did well"],
  "next_steps": ["What to improve"]
}
```

**Implementation:**
- GitHub API integration to fetch repo files
- File size limits (max 50KB per file, skip node_modules)
- Review caching (don't re-review same commit)
- Rubrics stored per project in codebase

#### 3. Mock Interview Platform

```
Interview Session:
├── Problem selection (based on sprint progress)
├── Real-time conversation (user ↔ AI interviewer)
├── Diagram canvas (user draws architecture)
├── Live transcript + evaluation
└── Post-interview detailed feedback
```

**AI Interviewer Behavior:**
```
System Prompt:
"You are conducting a {company_style} AI system design interview.
Problem: {problem_description}

Interview stages:
1. Requirements clarification (5 min)
2. High-level design (15 min)
3. Deep dives (15 min)
4. Wrap-up (5 min)

Be challenging but fair. Ask follow-ups when answers are vague.
Probe on: scale, failure modes, cost, monitoring.
Track time and guide the candidate through stages."
```

**Real-time Features:**
- WebSocket or Server-Sent Events for live conversation
- Canvas saves every 5 seconds
- Transcript stored for playback
- Post-interview analysis: separate Claude call with full transcript

#### 4. Skill Diagnosis (Sprint 0)

```
Quiz Flow:
├── 15-20 questions covering AI fundamentals
├── Adaptive: harder questions if doing well
├── Code snippets to evaluate: "What does this do?"
├── Scenario-based: "How would you build X?"
└── Generate personalized learning path

AI Analysis:
Input: All answers + explanations
Output: {
  "skill_levels": {
    "llm_fundamentals": 0.7,
    "prompt_engineering": 0.3,
    "rag": 0.0,
    ...
  },
  "recommended_path": "standard|fast-track|foundation-first",
  "skip_concepts": ["api_basics", "http"],
  "focus_areas": ["prompt_engineering", "rag"]
}
```

---

## Data Models

### Core Tables (MVP)

```sql
-- Users and Authentication (Supabase Auth handles most of this)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    experience_years INT,
    target_role VARCHAR(100),
    onboarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Skill Diagnosis Results
CREATE TABLE skill_diagnosis (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    quiz_answers JSONB NOT NULL,
    skill_scores JSONB NOT NULL,
    -- {"llm_fundamentals": 0.7, "prompt_engineering": 0.3, ...}
    recommended_path VARCHAR(50),
    -- "standard", "fast-track", "foundation-first"
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Learning Progress
CREATE TABLE user_progress (
    user_id UUID REFERENCES users(id),
    sprint_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started',
    -- 'not_started', 'in_progress', 'completed'
    concepts_completed TEXT[],
    labs_completed TEXT[],
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, sprint_number)
);

-- Project Submissions
CREATE TABLE project_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_number INT NOT NULL,
    github_repo_url VARCHAR(500),
    deployed_url VARCHAR(500),
    submission_data JSONB,
    -- stores code snapshot, environment info, etc.

    -- AI Review Results
    review_status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'reviewed', 'revision_needed'
    ai_review JSONB,
    -- structured feedback from Code Review AI
    overall_score DECIMAL(3,2),

    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,

    UNIQUE(user_id, project_number)
);

-- AI Mentor Conversations
CREATE TABLE mentor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    context_sprint INT,
    context_project INT,
    messages JSONB NOT NULL,
    -- [{"role": "user|assistant", "content": "...", "timestamp": "..."}]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentor_user_updated
ON mentor_conversations(user_id, updated_at DESC);

-- Interview Sessions
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    problem_slug VARCHAR(100) NOT NULL,
    -- e.g., "design-rag-customer-support"
    company_style VARCHAR(50),
    -- "google", "amazon", "startup", "generic"

    -- Session data
    transcript JSONB NOT NULL,
    diagram_snapshots JSONB,
    -- array of canvas states with timestamps
    duration_seconds INT,

    -- Evaluation
    overall_score DECIMAL(3,2),
    detailed_feedback JSONB,
    -- breakdown by: requirements, design, depth, communication

    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Learning Events (for analytics)
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    -- 'concept.viewed', 'lab.started', 'lab.completed',
    -- 'project.submitted', 'mentor.question', 'interview.started'
    event_data JSONB,
    occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_user_time
ON learning_events(user_id, occurred_at DESC);
CREATE INDEX idx_events_type
ON learning_events(event_type, occurred_at DESC);
```

### Key Design Decisions

**Why JSONB for AI data:**
- AI responses have variable structure (different feedback formats)
- Faster to iterate without migrations during MVP
- Can extract to structured tables later if needed

**Why separate conversations table:**
- Mentor conversations grow large (100+ messages)
- Need fast retrieval of recent conversations
- Separate from project data for cleaner queries

**Why events table:**
- Powers adaptive learning (which concepts are hard?)
- Analytics dashboard (engagement, drop-off points)
- Future: ML model to predict completion likelihood

---

## User Workflows

### Critical Path: First-Time User to First Project Deployed

```
Day 0: Onboarding (30 minutes)
├── 1. Sign up with email
├── 2. Welcome screen: "Build 7 AI products in 12 weeks"
├── 3. Skill diagnosis quiz (15-20 questions, 20 min)
├── 4. AI analyzes results → personalized dashboard
└── 5. CTA: "Start Sprint 1: Build Your AI Chat Assistant"

Day 1-3: Foundation Concepts (3-4 hours)
├── Video/text modules: LLM fundamentals
├── Interactive code examples (embedded editors)
├── AI Mentor available: "Ask me anything"
└── Short quizzes after each module (track progress)

Day 4-7: Hands-on Labs (4-6 hours)
├── Lab 1: Compare GPT-4 vs Claude on prompts
├── Lab 2: Build prompt library
├── Lab 3: Streaming chat prototype
└── Each lab: code → run → AI feedback → iterate

Day 8-14: Build Project 1 (8-12 hours)
├── Day 8-9: Setup (Next.js scaffold, API keys)
├── Day 10-11: Core features (chat interface, streaming)
├── Day 12-13: Polish and deploy to Vercel
├── Day 14: Submit for AI review
└── Throughout: AI Mentor helps debug

Day 15: Review & Next Steps
├── Receive AI code review (within hours)
├── Review feedback, make improvements (optional)
├── Celebrate deployed project 🎉
├── Preview Sprint 2 or try mock interview
└── Decision: Continue to Sprint 2 or pause
```

### AI Mentor Workflow

```
User asks question in mentor chat:
├── "Why is my RAG returning irrelevant results?"
│
├── System assembles context:
│   ├── Current location: Sprint 2, Project 2
│   ├── User's code: [fetch from last submission or paste]
│   ├── Previous 5 messages in conversation
│   └── Concepts already covered in Sprint 2
│
├── Send to Claude API with mentor system prompt
│
├── Stream response back to UI
│   └── Show typing indicator → chunks appear
│
├── Store message pair in database
│
└── Suggest related resources:
    └── "Want to review the chunking strategies module?"
```

### Code Review Workflow

```
User submits project:
├── Paste GitHub repo URL or upload zip
│
├── Backend fetches code:
│   ├── Clone repo or extract zip
│   ├── Identify key files (skip node_modules, .next)
│   ├── Read files (max 10 files, 50KB each)
│   └── Combine into review payload
│
├── Call Claude API with project rubric:
│   ├── System prompt: "Review Project {N}"
│   ├── Include: rubric, code files, project spec
│   └── Request structured JSON response
│
├── Parse response:
│   ├── Extract overall score
│   ├── Parse suggestions (file, line, issue, fix)
│   └── Identify good practices
│
├── Store in database:
│   └── project_submissions.ai_review
│
└── Show in UI:
    ├── Score badge: "82/100 - Great work!"
    ├── Expandable suggestions (grouped by file)
    └── "Good practices" section (encouragement)
```

### Mock Interview Workflow

```
User starts interview:
├── Select problem from available list
│   └── Unlocked based on sprint progress
│
├── Choose company style (optional)
│   └── Changes AI interviewer behavior
│
├── Interview canvas loads:
│   ├── Left: AI interviewer (text + voice option)
│   ├── Right: Diagram canvas (draw.io style)
│   └── Bottom: Timer + notes area
│
├── Interview stages (45 minutes):
│   ├── Stage 1: AI asks clarifying questions (5 min)
│   ├── Stage 2: User presents high-level design (15 min)
│   │   └── AI asks follow-ups, probes deeper
│   ├── Stage 3: Deep dives (scale, failures) (15 min)
│   └── Stage 4: Wrap-up (10 min)
│
├── Throughout:
│   ├── User types or speaks responses
│   ├── User draws on canvas
│   ├── Both transcript and diagram auto-save
│   └── AI evaluates in real-time (internal scoring)
│
├── End interview:
│   ├── "Interview complete" screen
│   └── Processing: AI analyzes full transcript + diagram
│
└── Show detailed feedback (2-3 min later):
    ├── Overall score + breakdown
    ├── Strengths and improvement areas
    ├── Transcript replay with annotations
    └── Diagram review with AI comments
```

---

## Development Phases (3-Month MVP)

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Core platform + Sprint 0 working

```
Week 1: Setup & Authentication
├── Next.js project scaffold
├── Supabase setup (database + auth)
├── Basic UI shell (dashboard, navigation)
├── Authentication flow (email/password)
└── Deliverable: Can sign up and log in

Week 2: Skill Diagnosis (Sprint 0)
├── Quiz question bank (15-20 questions)
├── Quiz UI with progress tracking
├── AI analysis integration
├── Results display + learning path generation
└── Deliverable: Complete diagnosis flow works

Week 3: AI Infrastructure
├── AIService abstraction layer
├── Claude API integration
├── Prompt template system
├── Streaming response handling
├── Error handling + retries
└── Deliverable: Reusable AI service ready

Week 4: Learning Platform Core
├── Sprint content display (concepts, videos)
├── Progress tracking (mark concepts complete)
├── Navigation between modules
├── User dashboard showing progress
└── Deliverable: Can navigate Sprint 1 content
```

### Phase 2: AI Features (Weeks 5-8)

**Goal:** AI Mentor + Code Review working

```
Week 5: AI Mentor
├── Chat interface with streaming
├── Context assembly logic
├── Conversation persistence
├── System prompt templates per sprint
└── Deliverable: Can ask mentor questions

Week 6: Code Review AI
├── GitHub repo fetching
├── File analysis and filtering
├── Review prompt + rubric for Project 1
├── Structured feedback parsing
├── Review UI (suggestions, score)
└── Deliverable: Can submit and review Project 1

Week 7: Project Workspace
├── Project setup instructions
├── Code submission flow
├── Deployment guide (Vercel)
├── Project showcase (portfolio view)
└── Deliverable: Complete project submission flow

Week 8: Labs Infrastructure
├── Embedded code editor (CodeMirror/Monaco)
├── Run code (E2B or similar sandbox)
├── Lab instructions + solutions
├── AI feedback on lab attempts
└── Deliverable: Interactive labs work
```

### Phase 3: Interview + Polish (Weeks 9-12)

**Goal:** Mock interviews + MVP ready for users

```
Week 9: Mock Interview Platform
├── Interview canvas (chat + diagram)
├── Problem bank (3-5 tier 1 problems)
├── Real-time interview flow
├── Transcript recording
└── Deliverable: Can complete an interview

Week 10: Interview Feedback
├── Post-interview AI analysis
├── Detailed feedback generation
├── Transcript replay UI
├── Score breakdown by criteria
└── Deliverable: Receive interview feedback

Week 11: Polish & Content
├── Sprint 1 content finalization
├── All concepts, labs, project complete
├── UI/UX improvements
├── Mobile responsive design
└── Deliverable: Professional, polished experience

Week 12: Testing & Launch Prep
├── End-to-end user testing
├── Bug fixes and edge cases
├── Performance optimization
├── Analytics integration (PostHog/Mixpanel)
├── Landing page for beta signups
└── Deliverable: MVP ready for first users
```

---

## Risk Mitigation

### Technical Complexity Risks

**Risk 1: AI responses are inconsistent or low-quality**

*Mitigation:*
- Start with highly structured prompts
- Use JSON mode for code reviews (force structure)
- Test prompts extensively before shipping
- Keep human-in-loop option (flag bad responses)
- Version control prompts (can rollback)
- A/B test prompt variations

**Risk 2: AI costs spiral out of control**

*Mitigation:*
- Set hard rate limits per user (10 mentor questions/day)
- Cache common questions/responses (Redis)
- Use streaming to stop if response too long
- Monitor costs daily via Anthropic dashboard
- Budget: $5-10 per user for MVP (acceptable)
- Fail gracefully: "Daily limit reached, try tomorrow"

**Risk 3: Code review AI misses critical issues or gives wrong advice**

*Mitigation:*
- Start with simple rubrics (does it work? is it clean?)
- Disclaimer: "AI review for learning, not production"
- Allow users to request human review (post-MVP)
- Collect feedback on review quality
- Build test suite of good/bad code examples
- Iterate on prompts based on user feedback

**Risk 4: Interview AI gets stuck or loops**

*Mitigation:*
- Hard time limits per stage (force progression)
- System prompt includes stage transitions
- Track conversation depth (max 3 back-and-forths per topic)
- User can manually advance stages
- Escape hatch: "Skip to feedback" button
- Test with real users before launch

**Risk 5: Context window limitations (conversations too long)**

*Mitigation:*
- Keep only last N messages (10 for mentor, 20 for interview)
- Summarize older context (AI-generated summary)
- Reset conversations after each sprint
- Use smaller models for simple tasks
- Monitor token usage per request

### Product/UX Risks

**Risk 6: Users don't complete projects (drop-off)**

*Early detection:*
- Track events: concept views, lab attempts, project starts
- Flag users stuck for >3 days
- Weekly email nudges with tips

*Interventions:*
- AI Mentor proactively reaches out
- Simplified project templates
- Office hours (async, post-MVP)

**Risk 7: Learning content is too hard or too easy**

*Mitigation:*
- Skill diagnosis sets expectations correctly
- Adaptive content (skip basics if advanced)
- Multiple difficulty tracks per concept
- Collect feedback after each module
- Iterate based on completion rates

**Risk 8: Solo development takes longer than 3 months**

*Mitigation:*
- Cut scope aggressively (MVP = Sprint 0 + Sprint 1 only)
- Use starter templates (shadcn/ui for components)
- Don't build custom video player (use YouTube embeds)
- Don't build custom diagram tool initially (use Excalidraw)
- Focus on core loop, polish later
- Acceptable: Some rough edges for first 10 users

---

## Implementation Priorities

### Critical Path Items (Must Build First)

These are the foundation everything else depends on:

**1. Database Schema + Auth (Week 1)**
- Why critical: Everything needs user identity and data persistence
- Dependencies: None
- Effort: Medium
- Risk: Low (well-understood tech)

**2. AI Service Layer (Week 3)**
- Why critical: All features depend on this abstraction
- Dependencies: Database for logging/caching
- Effort: Medium
- Risk: Medium (need to get prompting right)

**3. Skill Diagnosis (Week 2)**
- Why critical: First user touchpoint, sets learning path
- Dependencies: AI Service, Auth
- Effort: High (question bank + analysis logic)
- Risk: Medium (needs quality questions)

**4. AI Mentor (Week 5)**
- Why critical: Primary differentiator, reduces support burden
- Dependencies: AI Service, context assembly logic
- Effort: Medium
- Risk: High (quality and consistency concerns)

### Quick Wins (Build Early for Validation)

**1. Simple chat interface**
- Build in Week 3 to test AI Service
- Reuse for Mentor and Interview
- Validates streaming works

**2. Content display (read-only)**
- Build in Week 4 to show value
- Just markdown rendering initially
- Proves learning platform concept

**3. Progress tracking**
- Build in Week 4 for engagement
- Simple checkboxes → dopamine hits
- Shows completion percentage

### Can Wait (Post-MVP or Nice-to-Have)

**Defer to Month 4+:**
- Video hosting (use YouTube initially)
- Custom diagram tool (use Excalidraw embed)
- Advanced analytics dashboard
- Social features (user communities)
- Mobile app (responsive web is enough)
- Payment integration (manual invoicing for beta)
- Multiple AI model support (Claude only for MVP)

**Defer to Month 6+:**
- Sprints 2-7 content and projects
- Team/cohort features
- Human mentor marketplace
- Custom learning paths
- Certification system
- Job board integration

---

## Technology Stack Summary

### Locked In (Core Decisions)

```
Frontend:
├── Next.js 14 (App Router)
├── React 18 + TypeScript
├── Tailwind CSS
├── shadcn/ui components
└── Vercel AI SDK

Backend:
├── Next.js API routes
├── Supabase (Postgres + Auth)
├── Upstash Redis (caching)
└── Claude API (Anthropic)

Deployment:
├── Vercel (hosting)
├── GitHub (code + CI/CD)
└── Supabase (managed services)

Development:
├── VSCode
├── Cursor (AI pair programming)
└── GitHub Copilot
```

### Open Questions (Decide in Week 1)

**Code Sandbox for Labs:**
- Option A: E2B (dedicated code execution)
- Option B: CodeSandbox API
- Option C: Simple iframe with RunKit
- **Recommendation:** Start with Option C (simplest), upgrade if needed

**Diagram Tool:**
- Option A: Excalidraw (embed)
- Option B: tldraw (embed)
- Option C: Build custom canvas
- **Recommendation:** Option A (Excalidraw is production-ready)

**Analytics:**
- Option A: PostHog (self-serve, generous free tier)
- Option B: Mixpanel (better retention analysis)
- Option C: Simple custom events table
- **Recommendation:** Option C for MVP, PostHog in Month 4

**Email:**
- Option A: Resend (developer-friendly)
- Option B: SendGrid (established)
- Option C: Supabase Auth emails only
- **Recommendation:** Option C initially, Resend when needed

---

## Next Steps (Week 0 - Before Development)

### Day 1: Setup & Planning
```
Morning:
├── Create GitHub repo
├── Set up Vercel account
├── Set up Supabase project
└── Create project board (Linear/GitHub Projects)

Afternoon:
├── Initialize Next.js project locally
├── Connect to Supabase
├── Test Claude API (get API key, test call)
└── Create simple prompt → response flow
```

### Day 2: Database Design
```
├── Implement schema (users, progress, submissions)
├── Set up Supabase Auth
├── Create seed data for testing
└── Test queries locally
```

### Day 3: Content Preparation
```
├── Outline Sprint 0 quiz questions (15-20)
├── Outline Sprint 1 concept modules (titles, bullets)
├── Define Project 1 spec and rubric
└── Write system prompts (diagnosis, mentor, review)
```

### Day 4-5: First Feature Spike
```
├── Build simple diagnosis quiz UI
├── Integrate with Claude for analysis
├── Display results page
└── Validate: Can a user complete diagnosis end-to-end?
```

**Decision point:** If diagnosis works smoothly, proceed with full development plan. If struggling, reassess complexity and scope.

---

## Budget Estimate (3 Months)

### Development Costs

| Item | Cost | Notes |
|------|------|-------|
| Vercel (hosting) | $0-20/mo | Free tier likely sufficient for MVP |
| Supabase (database) | $0-25/mo | Free tier: 500MB, upgrade if needed |
| Upstash Redis | $0 | Free tier: 10K requests/day |
| Claude API | $200-500 | Estimate: 20 beta users × $10-25 each |
| Domain | $15/yr | yourproduct.com |
| Email (Resend) | $0 | Free tier: 3K emails/mo |
| **Total/month** | **~$100** | Conservative estimate |

### Time Investment

| Phase | Weeks | Hours/week | Total hours |
|-------|-------|------------|-------------|
| Phase 1 | 4 | 30-40 | 140 hours |
| Phase 2 | 4 | 30-40 | 140 hours |
| Phase 3 | 4 | 30-40 | 140 hours |
| **Total** | **12 weeks** | | **~420 hours** |

**Reality check:** As a solo builder, expect some weeks to be slower. Build in 1-2 weeks buffer. Target: Working MVP by end of Month 3, polished by Month 4.

---

## Success Metrics (MVP)

### Must-Hit (Launch Criteria)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| End-to-end completion | 1 user completes Sprint 0 → Sprint 1 → Project 1 deployed | Manual verification |
| AI Mentor works | User asks 5+ questions, gets useful responses | User testing feedback |
| Code review accuracy | Review identifies real issues in test projects | Manual review of 10 submissions |
| Interview experience | User completes 45-min interview without breaking | Technical QA |

### Aspirational (Post-Launch)

| Metric | Target | Timeline |
|--------|--------|----------|
| Beta users | 10 users in first month | Month 4 |
| Sprint 1 completion | 70% of starters finish | Month 5 |
| Projects deployed | 10 live projects | Month 5 |
| Paid conversions | 2 users pay $499 | Month 6 |

---

## Definition of Done (MVP Launch Checklist)

### Functional Requirements

- [ ] User can sign up and log in
- [ ] User can complete skill diagnosis
- [ ] User can view Sprint 1 content (concepts)
- [ ] User can complete at least 1 interactive lab
- [ ] User can access AI Mentor and get helpful responses
- [ ] User can build and submit Project 1
- [ ] User receives AI code review with actionable feedback
- [ ] User can complete a mock interview (45 min)
- [ ] User receives interview feedback
- [ ] Dashboard shows progress across all activities

### Quality Requirements

- [ ] Mobile responsive (works on phone/tablet)
- [ ] No critical bugs (breaks user flow)
- [ ] AI responses are relevant 80%+ of the time
- [ ] Page load times < 2 seconds
- [ ] Works in Chrome, Safari, Firefox
- [ ] Basic error handling (doesn't crash on errors)
- [ ] Cost per user < $15 in AI calls

### Launch Requirements

- [ ] Landing page with clear value prop
- [ ] Simple waitlist/beta signup
- [ ] Onboarding email sequence (Welcome → Getting started)
- [ ] Analytics tracking (signups, completions)
- [ ] Feedback collection mechanism
- [ ] Privacy policy + Terms of Service
- [ ] Backup strategy for database

---

## Closing Thoughts

### Why This Will Work

1. **Clear value prop:** "7 deployed AI products in 12 weeks" is concrete and measurable
2. **AI-powered scale:** One person can support 100+ learners with AI Mentor and Code Review
3. **Project-based proof:** Employers value portfolios over certificates
4. **Fast time-to-value:** Users see progress in Week 1 (diagnosis + first concepts)
5. **Managed complexity:** Reusable AI infrastructure pays dividends across all features

### Biggest Unknowns (To Validate in MVP)

1. **Will AI Mentor be helpful enough?** → Test with first 10 users, iterate prompts
2. **Can users actually deploy projects?** → Provide templates, clear guides
3. **Is $499 the right price?** → Test with free beta first, gauge willingness to pay
4. **How much AI support is needed?** → Track mentor usage, optimize for most common questions
5. **What's the real completion rate?** → May need to simplify content or add more support

### The Path Forward

**Weeks 1-4:** Build core platform and validate diagnosis works
**Weeks 5-8:** Add AI features and test with friends/family
**Weeks 9-12:** Polish and recruit 10 beta users
**Month 4:** Iterate based on feedback, add Sprint 2 content
**Month 5:** Soft launch, charge first customers
**Month 6:** Decide: Double down or pivot based on data

---

## Document Summary

**Product:** AI Architect Accelerator - Transform SWEs into AI Product Builders in 12 weeks

**MVP Scope (3 months):**
- Sprint 0: Skill diagnosis
- Sprint 1: Foundation + Project 1 (AI Chat Assistant)
- AI Mentor: 24/7 context-aware assistant
- Code Review AI: Automated feedback
- Mock Interview Platform: AI interviewer with real-time feedback

**Architecture:** Next.js monolith + Supabase + Claude API + Vercel

**Key Risks:** AI quality/consistency, cost control, solo development speed

**Success Criteria:** 10 beta users complete Sprint 0 → Sprint 1 → Deploy Project 1

**Next Action:** Set up development environment and build Week 1 foundations

---

*This document is a living artifact and will be updated as we learn and iterate through development.*
