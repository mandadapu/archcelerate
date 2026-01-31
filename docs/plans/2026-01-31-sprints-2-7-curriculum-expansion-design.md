# Post-MVP Curriculum Expansion: Sprints 2-7 Design

## Vision & Scope

Expanding from the MVP (Sprint 0-1) to the complete 12-week AI Product Builder curriculum by adding Sprints 2-7. This gives learners the full journey from fundamentals through advanced AI product development, culminating in a self-designed capstone project.

**Rollout Strategy**: Build all 6 sprints before launch so learners have the complete 12-week program from day one. No waiting for content - they can progress at their own pace through the entire curriculum.

**Quality Bar**: Each sprint maintains the same high-quality structure as Sprint 1:
- 3 core concept lessons (theory + practice balanced)
- 1 hands-on coding lab with isolated exercises
- 1 real-world project with consistent scope
- Full AI Mentor support
- Code Review AI for project submissions

**Sprint Progression**: Learners have flexibility to explore but get smart recommendations. The system warns if they skip ahead (e.g., "Sprint 3 builds on Sprint 2 concepts") but doesn't block them. This respects different learning goals - some want the full certification path, others want to deep-dive specific topics.

## Sprint-by-Sprint Breakdown

### Sprint 2: RAG System (Retrieval-Augmented Generation)

**Concepts**:
1. Vector embeddings & similarity search
2. Chunking strategies & document processing
3. Retrieval pipelines & citation tracking

**Lab Exercises**:
1. Chunk a document into optimal segments
2. Generate embeddings and store in vector DB
3. Implement semantic search with ranking
4. Combine retrieval + generation for Q&A

**Project**: Document Q&A System
- Upload 3-5 PDFs → Ask questions → Get cited answers
- Services: Pinecone (vectors), Claude API (generation)
- Key feature: Citation tracking (answers reference specific pages)
- Success: Correctly answers 8/10 test questions with valid citations
- Scope: 3-5 hours, 200-400 LOC, 3-5 files

**New Skills**: Working with vector databases (Pinecone/Weaviate), document processing, citation tracking

---

### Sprint 3: AI Agents (Multi-Step Task Automation)

**Concepts**:
1. Agent architectures (ReAct, planning)
2. Tool use & function calling
3. Agent loops & error recovery

**Lab Exercises**:
1. Define and register custom tools
2. Practice function calling with Claude
3. Implement retry logic and error handling
4. Build multi-step agent loop

**Project**: Research Agent
- Input: Topic → Output: Research report with sources
- Services: Tavily Search API, Claude API
- Key feature: Multi-step planning (search → analyze → synthesize → report)
- Success: Report covers 5+ relevant sources, coherent synthesis
- Scope: 3-5 hours, 200-400 LOC, 3-5 files

**New Skills**: Tool definition, agent orchestration, iterative refinement

---

### Sprint 4: Multimodal AI (Vision & Beyond)

**Concepts**:
1. Vision models & image understanding
2. Multimodal prompting techniques
3. Cross-modal applications & use cases

**Lab Exercises**:
1. Practice image analysis with Claude
2. Extract information from diagrams
3. Visual Q&A implementation
4. Combine text + image inputs

**Project**: Visual Product Analyzer
- Upload product images → Get descriptions, comparisons, recommendations
- Services: Claude API (vision), product database
- Key feature: Multi-image comparison with visual evidence
- Success: Accurate descriptions, meaningful comparisons
- Scope: 3-5 hours, 200-400 LOC, 3-5 files

**New Skills**: Working with vision APIs, combining text + image inputs, structured visual outputs

---

### Sprint 5: Production Deployment (Scale & Reliability)

**Concepts**:
1. Cost optimization & caching strategies
2. Monitoring & observability
3. Error handling & fallbacks

**Lab Exercises**:
1. Implement rate limiting with Redis
2. Add caching layers for AI responses
3. Set up monitoring with Sentry
4. Build retry logic with exponential backoff

**Project**: Production-Ready API
- Take any previous project → Add monitoring, caching, error handling
- Services: Vercel, Sentry, Upstash Redis
- Key feature: Observable, cost-optimized, reliable
- Success: Passes load test, <$0.10 per 100 requests, 99% uptime
- Scope: 3-5 hours, 200-400 LOC, 3-5 files

**New Skills**: Production patterns, cost management, reliability engineering

---

### Sprint 6: Advanced Techniques (Optimization & Evaluation)

**Concepts**:
1. Prompt optimization & testing
2. Evaluation frameworks & metrics
3. Fine-tuning vs RAG vs agents (when to use what)

**Lab Exercises**:
1. Build evaluation test suites
2. Compare different approaches systematically
3. Optimize prompts with metrics
4. Implement A/B testing for AI features

**Project**: AI Product Optimizer
- Take existing AI feature → Build evals → Improve → Measure
- Services: Braintrust or custom eval framework
- Key feature: Systematic improvement with metrics
- Success: Demonstrate 20%+ improvement on defined metric
- Scope: 3-5 hours, 200-400 LOC, 3-5 files

**New Skills**: Systematic evaluation, A/B testing AI, making architecture trade-offs

---

### Sprint 7: Capstone Project (Learner-Designed)

**Concepts**:
1. Product thinking for AI
2. Architecture design patterns
3. Launch planning & deployment

**Lab Exercises**:
1. Practice project scoping
2. Create architecture diagrams
3. Define success metrics
4. Plan deployment strategy

**Project**: Build Your AI Product
- Learner chooses what to build using any techniques from Sprints 1-6
- Predefined templates: AI writing assistant, code explainer, data analyzer, creative tool
- Services: Learner chooses (must use 2+ techniques from previous sprints)
- Key feature: Portfolio-worthy, demonstrates learning
- Success: Works end-to-end, deployed, documented
- Scope: 3-5 hours, 200-400 LOC, same constraints as other projects but fully custom

**New Skills**: End-to-end product thinking, integrating multiple AI techniques, portfolio building

## Content Creation Workflow (AI-Assisted)

### Phase 1: Concept Outlining (1-2 days per sprint)
- Define learning objectives for each concept
- Outline key points, examples, common pitfalls
- Specify prerequisite knowledge and connections to other sprints
- Create evaluation criteria (what should learners be able to do after?)

### Phase 2: AI-Generated Drafts (1 day per sprint)
- Use Claude with your outlines to generate MDX concept files
- Provide existing Sprint 1 concepts as style/quality examples
- Generate code examples, diagrams, practice exercises
- Create lab exercises with test cases
- Draft project specifications with success criteria

### Phase 3: Review & Refinement (2-3 days per sprint)
- Review for technical accuracy (especially critical for RAG, agents, production patterns)
- Refine tone, add personal insights, fix errors
- Test all code examples actually work
- Validate lab exercises are the right difficulty
- Ensure projects are scoped consistently with Sprint 1

**Total per sprint**: ~1 week from outline to polished content. For 6 sprints working sequentially: 6-8 weeks of content creation work.

## Infrastructure Architecture (Built for Scale)

### Content Management Layer

**Headless CMS** (Sanity recommended):
- Move from MDX files to proper CMS for easier updates
- Non-technical contributors can help with content updates
- Version history and content scheduling built-in
- API-first so content can be used in mobile apps, email courses, etc.

**Hybrid Approach**:
- Keep MDX for code-heavy examples
- CMS for text/structure
- Content API abstracts source (can migrate providers later)

### AI Service Layer (Microservice)

**Separate AI service**: Extract from Next.js monolith into standalone service
- Handles all Claude API calls, prompt management, context assembly
- Can be reused across web app, API, future mobile apps
- Independent scaling (AI calls might need different resources than web pages)
- Easier to swap AI providers or add multi-model support

**Tech Stack**: Node.js/Express or Python/FastAPI with Redis for caching

**Features**:
- Rate limiting
- Cost tracking
- A/B testing prompts
- Observability (Sentry, logging)

### Database Evolution

**Vector Database** (Pinecone/Weaviate/pgvector):
- Required for Sprint 2+ RAG features
- Store concept embeddings for semantic search
- Support "find similar projects" or "related concepts"
- Enable intelligent content recommendations

**Analytics Database** (separate from Supabase):
- ClickHouse or BigQuery for event analytics
- Enables cohort analysis, funnel optimization, ML on learning patterns
- Track learning analytics at scale

### Migration Path: MVP to Scaled Architecture

**Phase 1: Content Infrastructure** (Week 9-10)
- Set up headless CMS (Sanity)
- Migrate Sprint 1 MDX content to CMS as proof-of-concept
- Keep MDX rendering but source from CMS API
- No user-facing changes - backend only

**Phase 2: AI Service Extraction** (Week 11-12)
- Build standalone AI service (Node.js + Express)
- Migrate AIService class from Next.js to new service
- Update Next.js app to call AI service via REST API
- Deploy AI service separately (Railway or Fly.io)
- Keep feature parity - users see no difference

**Phase 3: Vector Database** (Week 13)
- Add Pinecone or pgvector (Supabase extension)
- Embed all existing concept content
- Add semantic search capability to AI Mentor
- This unlocks Sprint 2 RAG functionality

**Phase 4: Analytics Infrastructure** (Week 14)
- Set up analytics database (start simple with Supabase, migrate to ClickHouse later)
- Implement event tracking across all user actions
- Build admin dashboard for insights

**Phase 5: Sprint 2-7 Content** (Weeks 15-20, ~1 week per sprint)
- Use AI-assisted workflow to create content
- Add to CMS as you go
- Test labs and projects before publishing
- Each sprint goes live as completed

**Total migration + expansion timeline**: ~12 weeks to fully scaled architecture with all 7 sprints

## AI Features Across Sprints

### Consistent AI Support

AI Mentor and Code Review AI maintain the same level of support across all sprints. Learners can rely on the same helpful tools whether they're in Sprint 1 or Sprint 7.

### AI Mentor Evolution

**Context awareness expands**:
- Sprints 1-2: References only current sprint concepts
- Sprints 3-5: Can reference previous sprint techniques ("Remember the RAG system you built in Sprint 2?")
- Sprints 6-7: Full context of their learning journey, can suggest integrations across sprints

**Same interaction model**: Streaming chat, conversation history, quick help suggestions

**Smart prompting**: Backend prompts include sprint-specific context but maintain consistent helpfulness

### Code Review AI Enhancements

**Sprint-specific rubrics**: Review criteria adapt to sprint focus
- Sprint 2: Checks vector search quality, chunking strategy, citation accuracy
- Sprint 3: Evaluates agent planning, tool usage, error recovery
- Sprint 5: Focuses on production patterns, monitoring, cost optimization

**Same interface**: Learners submit GitHub repos, get AI reviews, iterate

**Progressive feedback**: Later sprints expect cleaner code but don't become harder - just different focus areas

### New AI Feature: Project Templates

- For each sprint project, provide AI-generated starter templates
- Learners can start from scratch or use templates to move faster
- Templates include basic structure, comments explaining what to build where

## Lab Structure & Progression

### Consistent Lab Format (Same as Sprint 1)

- **Bite-sized exercises**: 3-5 focused coding challenges per sprint
- **Isolated skill practice**: Each exercise targets one specific technique before the full project
- **Auto-grading**: Test cases run in sandbox (E2B), instant feedback
- **Progressive hints**: Learners can request hints if stuck, AI provides scaffolding

### Sprint Progression Mechanics

**Flexible with guardrails**: System tracks completion but doesn't block

**Smart warnings**:
- "⚠️ Sprint 3 builds heavily on Sprint 2's RAG concepts. Complete Sprint 2 first?"
- "✓ You can skip ahead, but you might need to review Sprint 2 later"

**Progress tracking**: Dashboard shows completion status across all sprints
- Green: Completed (concepts + lab + project)
- Yellow: In progress
- Gray: Not started
- Badge: Can skip but not recommended

**Recommended path visible**: Visual flow showing ideal Sprint 0→1→2→3→4→5→6→7 journey

**Analytics**: Track skip patterns to identify if any sprint is too hard/easy

### Completion Incentives (Not gates)

- Portfolio page shows completed projects with badges
- Certificate requires completing all 7 sprints
- Learners who complete full path get "AI Product Builder" credential

## Project Scoping & Consistency

### Consistent Project Parameters (Same across all sprints)

- **Time to complete**: 3-5 hours for average learner
- **Lines of code**: 200-400 LOC (not counting boilerplate)
- **Complexity**: 3-5 files, 1-2 external services/APIs
- **Deployment**: All projects deploy to Vercel for portfolio
- **Success criteria**: Clear, testable requirements (no ambiguity)

## Success Metrics & Analytics

### Learning Outcomes Tracking

**Per-Sprint Metrics**:
- **Completion rate**: % of learners who finish concepts + lab + project
- **Time to complete**: Median hours spent per sprint (target: 8-12 hours)
- **Drop-off points**: Where learners get stuck (specific concepts, lab exercises, project phases)
- **Code review iterations**: Average attempts before project approval
- **Help requests**: AI Mentor conversation volume and topics

**Cross-Sprint Patterns**:
- **Sequential completion**: % who follow recommended 0→1→2→...→7 path vs skip around
- **Retention by sprint**: What % of Sprint 1 completers reach Sprint 3? Sprint 5? Sprint 7?
- **Sprint difficulty curve**: Are later sprints taking longer than early ones? (Should be consistent)
- **Skill transfer**: Do learners who complete Sprint 2 perform better on Sprint 3 projects?

**Portfolio & Outcomes**:
- **Certification rate**: % who complete all 7 sprints and earn credential
- **Project quality**: Code review scores trending up over time?
- **Portfolio showcase**: % who deploy and share their capstone projects
- **Post-program outcomes**: Job changes, product launches, confidence surveys

**AI System Health**:
- **AI Mentor helpfulness**: User ratings per conversation
- **Code review accuracy**: % of reviews that lead to improved code
- **Cost per learner**: AI API spend across full 12-week journey (budget: <$50/learner)
- **Response quality**: Manual review of AI outputs for accuracy

**Early Warning Signals**:
- Sprint completion rate drops below 60% → content too hard or unclear
- Time to complete spike >15 hours → project scope creep
- AI Mentor conversations spike without completion → learners stuck but AI not helping
- Code review rejection >3 iterations → project requirements unclear

## Testing & Quality Assurance

### Content Testing (Before publishing each sprint)

**Technical Accuracy**:
- **Code examples**: Every code snippet must run without errors
- **API integrations**: Test all external services (Pinecone, Tavily, etc.) with real API keys
- **Lab exercises**: All test cases must pass with reference solutions
- **Project specs**: Build each project yourself to validate 3-5 hour estimate

**Learning Effectiveness**:
- **Beta testers**: 3-5 developers test each sprint before launch
  - Mix of experience levels (some AI-familiar, some new)
  - Track completion time, confusion points, feedback
  - Pay them or give free access
- **Comprehension checks**: Embedded quizzes after concepts validate understanding
- **AI review calibration**: Test Code Review AI on known good/bad submissions

### Infrastructure Testing

**Load Testing** (Before launching all 7 sprints):
- **Concurrent learners**: Simulate 100 users going through content simultaneously
- **AI service load**: Test AI microservice handles 50 concurrent Claude API calls
- **Database performance**: Vector searches with 1000+ embedded documents
- **Code sandbox**: Multiple learners running labs at same time

**Resilience Testing**:
- **AI API failures**: What happens when Claude API is down? (Graceful degradation)
- **Cost controls**: Rate limiting actually prevents runaway costs
- **CMS outage**: Content cached/fallbacks work
- **Payment failures**: Learners don't lose progress if subscription lapses

### Continuous Quality

**Post-Launch Monitoring**:
- **Weekly content reviews**: Check AI Mentor conversations for patterns (learners consistently confused about X)
- **Monthly project audits**: Sample submitted projects to validate rubrics are working
- **Quarterly curriculum updates**: Refresh content based on AI industry changes
- **A/B testing**: Try different explanations, examples, project variants

## Implementation Timeline

**Total Timeline: 20 weeks from MVP completion to full 7-sprint launch**

### Weeks 9-14: Infrastructure Migration (6 weeks)
- Week 9-10: CMS setup + content migration
- Week 11-12: AI service extraction
- Week 13: Vector database integration
- Week 14: Analytics infrastructure

### Weeks 15-20: Sprint Content Creation (6 weeks)
- Week 15: Sprint 2 (RAG System)
- Week 16: Sprint 3 (AI Agents)
- Week 17: Sprint 4 (Multimodal AI)
- Week 18: Sprint 5 (Production Deployment)
- Week 19: Sprint 6 (Advanced Techniques)
- Week 20: Sprint 7 (Capstone)

### Weeks 21-22: Beta Testing & Polish (2 weeks)
- 5-10 beta testers run through full curriculum
- Fix issues, refine content
- Load testing and performance optimization

### Week 23: Launch (soft launch)
- Open to first cohort of 20-50 learners
- Heavy monitoring and support
- Rapid iteration based on feedback

**Parallelization Opportunities**:
- While building infrastructure (Weeks 9-14), start outlining Sprint 2-3 content
- While beta testing Sprint 2, create Sprint 4 content
- Can compress timeline by 2-4 weeks with parallel work

## Risks & Mitigation

### Risk 1: Content Quality Inconsistency
- **Risk**: AI-generated content has errors or doesn't match Sprint 1 quality
- **Impact**: Learners lose trust, poor learning outcomes
- **Mitigation**:
  - Manual review every concept before publishing
  - Beta test each sprint with real developers
  - Build reference solutions for all projects yourself
  - Version control all content, easy rollback if issues found

### Risk 2: Infrastructure Migration Breaks MVP
- **Risk**: Extracting AI service or moving to CMS causes bugs in working Sprint 0-1
- **Impact**: Current learners disrupted, negative reviews
- **Mitigation**:
  - Feature flags for gradual rollout (run old + new in parallel)
  - Comprehensive testing before switching traffic
  - Keep MVP code frozen during migration
  - Easy rollback plan (keep old monolith deployable)

### Risk 3: External Service Dependencies
- **Risk**: Pinecone, Tavily, or other APIs change pricing or go down
- **Impact**: Projects break, costs spike, learner frustration
- **Mitigation**:
  - Abstract all external services (easy to swap providers)
  - Cost monitoring alerts ($50/day threshold)
  - Fallback options (pgvector instead of Pinecone, multiple search APIs)
  - Document alternative services in project specs

### Risk 4: AI API Costs Spiral
- **Risk**: 100 learners × 7 sprints × AI interactions = unexpected costs
- **Impact**: Profitability issues, need to restrict AI features
- **Mitigation**:
  - Aggressive caching (90% hit rate target)
  - Rate limiting per user (10 AI Mentor msgs/hour, 3 code reviews/day)
  - Cost budgets per learner ($50 max for full 7 sprints)
  - Monitoring dashboard with automatic alerts

### Risk 5: Content Becomes Outdated
- **Risk**: AI landscape changes fast, Sprint 3-7 content obsolete in 6 months
- **Impact**: Teaching deprecated patterns, learners learn wrong things
- **Mitigation**:
  - Focus on fundamentals (embeddings, agents) not specific tools
  - CMS makes updates quick (no redeployment needed)
  - Quarterly content review process
  - Community feedback loop to catch outdated info

### Risk 6: Scope Creep on Projects
- **Risk**: Later sprint projects become too complex (>5 hours)
- **Impact**: Learners frustrated, completion rates drop
- **Mitigation**:
  - Build each project yourself to validate scope
  - Strict complexity budget (3-5 files, 200-400 LOC)
  - Beta tester time tracking
  - Offer "stretch goals" for advanced learners, not required

## Next Steps

1. **Review and validate** this design document
2. **Set up git worktree** for isolated development (using `superpowers:using-git-worktrees`)
3. **Create implementation plan** with bite-sized tasks (using `superpowers:writing-plans`)
4. **Begin Phase 1**: CMS setup and infrastructure migration
