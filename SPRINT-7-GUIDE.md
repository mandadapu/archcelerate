# Sprint 7: Capstone Project Guide

**Ship Your AI Product from Start to Finish**

Sprint 7 is the culmination of the AI Product Builder curriculum. Unlike previous sprints with specific requirements, this is your opportunity to design, build, deploy, and launch your own AI product with full creative freedom.

## Overview

**Duration**: 4-5 weeks (30-40 hours)
**Difficulty**: Advanced
**Prerequisites**: Completion of Sprints 1-6 (or equivalent experience)

### What Makes Sprint 7 Different

- **Template-based, not prescriptive**: Choose from 4 curated project templates or propose your own
- **Full product lifecycle**: Go from idea validation to public launch
- **Portfolio-worthy outcome**: Build a real product you can show to employers or users
- **Creative freedom**: You decide features, tech stack details, and product direction

## Learning Path

### Phase 1: Product Thinking (Week 1)

**Concepts to Study**:
- Product Thinking for AI (`/learn/sprint-7/product-thinking`)
- Problem identification and validation
- User research techniques
- Success metrics (SMART framework)
- MVP scoping strategies

**Labs**:
- Lab 1: Project Scoping Exercise
- Lab 3: Success Metrics Definition

**Deliverables**:
- Problem statement (100-200 words)
- User research summary (5+ interviews or secondary research)
- Success metrics (3-5 SMART metrics)
- MVP scope document (3-5 core features)

### Phase 2: Architecture Design (Week 1-2)

**Concepts to Study**:
- Architecture Design Patterns (`/learn/sprint-7/architecture-design`)
- SOLID principles for AI applications
- Component architecture (layered design)
- Data flow patterns (RAG, agents, streaming)
- Database schema design

**Labs**:
- Lab 2: Architecture Diagram Exercise

**Deliverables**:
- Architecture diagram (C4 or similar)
- Component breakdown (responsibilities, dependencies)
- Tech stack decision with rationale
- 2-3 Architecture Decision Records (ADRs)

### Phase 3: Development (Week 2-3)

**What to Build**:
Choose from 4 templates or propose custom:

1. **AI Writing Assistant** (Medium difficulty, 30 hours)
   - Help users write better content faster
   - Examples: Email writer, blog post generator, copywriting tool
   - Core techniques: Prompt engineering, few-shot learning, streaming

2. **Code Explainer & Documenter** (Medium difficulty, 35 hours)
   - Explain code and generate documentation
   - Examples: Code tutor, documentation generator, code review assistant
   - Core techniques: Multi-turn conversation, structured output, syntax analysis

3. **Data Analysis Assistant** (Hard difficulty, 40 hours)
   - Analyze CSV/JSON data with natural language
   - Examples: Business intelligence tool, data insights generator
   - Core techniques: Tool use (agents), structured output, data summarization

4. **Creative AI Tool** (Medium difficulty, 30 hours)
   - Generate creative content (stories, ideas, characters, worlds)
   - Examples: Story generator, brainstorming tool, character creator
   - Core techniques: Creative prompting, temperature control, iterative refinement

**Technical Requirements**:
- Built with Next.js 14 App Router + TypeScript
- Uses Claude API or OpenAI API (or both)
- Database for persistence (Vercel Postgres, Supabase, etc.)
- Authentication (NextAuth.js recommended)
- Error handling and retry logic
- LLM metrics tracking (tokens, cost, latency)

**Development Checklist**:
- [ ] Core AI feature working reliably
- [ ] Basic UI/UX functional and intuitive
- [ ] Database schema implemented
- [ ] Authentication working
- [ ] Error handling for LLM failures
- [ ] Caching to reduce costs
- [ ] Rate limiting on API routes
- [ ] Mobile responsive design

### Phase 4: Deployment & Launch (Week 4)

**Concepts to Study**:
- Launch Planning & Deployment (`/learn/sprint-7/launch-deployment`)
- Pre-launch checklist
- Deployment strategies (direct, canary, feature flags)
- Monitoring and observability
- Launch operations
- Go-to-market planning

**Labs**:
- Lab 4: Deployment Plan Exercise

**Deliverables**:
- Deployed application (Vercel or similar)
- Environment variables configured in production
- Error tracking setup (Sentry recommended)
- Basic analytics (Vercel Analytics)
- Uptime monitoring
- Public URL accessible to anyone

**Launch Checklist**:
- [ ] All tests passing (`npm test`)
- [ ] No console.log in production code
- [ ] Environment variables properly configured
- [ ] API keys secured (not hardcoded)
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Cost limits/alerts configured
- [ ] Monitoring setup (Sentry, Uptime Robot)
- [ ] Demo video or GIF created
- [ ] README with setup instructions
- [ ] Launched on at least 1 channel (Product Hunt, Twitter, HN)

## Project Templates

Each template includes:
- **Problem space**: Common problems worth solving
- **Suggested techniques**: AI approaches that work well
- **Core features**: Must-have vs nice-to-have features
- **User stories**: Who uses this and why
- **Architecture guidance**: Frontend, backend, database recommendations
- **Prompt examples**: Starter prompts with variables
- **Success metrics**: How to measure success
- **Cost estimates**: Development time, API costs, hosting

### Choosing Your Template

**Pick AI Writing Assistant if**:
- You're new to shipping AI products
- You want to focus on prompt engineering mastery
- Your users are content creators, marketers, or professionals
- You want a simpler project (30 hours)

**Pick Code Explainer if**:
- Your users are developers
- You're comfortable with code parsing/syntax highlighting
- You want to implement multi-turn conversations
- You like educational/learning tools

**Pick Data Analyzer if**:
- You're interested in data and business intelligence
- You want to implement agents with tool use
- You're comfortable with complex architecture
- You don't mind the extra complexity (40 hours)

**Pick Creative Tool if**:
- You're building for creative users (writers, game designers)
- You want to explore creative AI applications
- You like high temperature, diverse outputs
- You want flexibility in product direction

**Propose Custom Project if**:
- None of the templates fit your interests
- You have a specific problem you want to solve
- You're confident scoping a 30-40 hour project
- You get instructor approval first (submit 1-page proposal)

## Success Criteria & Grading

Your capstone is evaluated on 5 dimensions (100 points total):

### 1. Product Quality (25 points)
- **Excellent (23-25)**: Solves clearly validated problem, polished UX, reliable AI features, users love it
- **Good (18-22)**: Addresses real problem, functional UX, working AI features
- **Adequate (13-17)**: Interesting idea but validation weak, basic functionality works
- **Needs Work (0-12)**: Problem unclear, core features unreliable

### 2. Technical Implementation (25 points)
- **Excellent (23-25)**: Clean architecture, proper error handling, well-tested, follows SOLID principles
- **Good (18-22)**: Organized code, basic error handling, some tests
- **Adequate (13-17)**: Works but code quality issues, minimal tests
- **Needs Work (0-12)**: Poorly structured, no error handling, brittle

### 3. AI Integration (20 points)
- **Excellent (18-20)**: Excellent prompts, cost optimized (caching), quality outputs, graceful failures
- **Good (14-17)**: Good prompts, basic cost optimization, consistent quality
- **Adequate (10-13)**: Prompts work but inconsistent, no cost optimization
- **Needs Work (0-9)**: Poor prompt quality, expensive, unreliable outputs

### 4. Deployment & Operations (15 points)
- **Excellent (14-15)**: Production-ready, comprehensive monitoring, publicly accessible, >95% uptime
- **Good (11-13)**: Deployed, basic monitoring, accessible, mostly stable
- **Adequate (8-10)**: Deployed but limited monitoring, occasional issues
- **Needs Work (0-7)**: Not deployed or major stability issues

### 5. Launch & Documentation (15 points)
- **Excellent (14-15)**: Public launch with user feedback, excellent docs, demo video, portfolio-quality
- **Good (11-13)**: Public launch, clear docs, demo, good presentation
- **Adequate (8-10)**: Launched but minimal docs, basic demo
- **Needs Work (0-7)**: No launch or poor documentation

## Submission Requirements

**Required**:
1. **Public URL**: Link to deployed application
2. **GitHub Repository**: Public or private (share access if private)
3. **README**: Setup instructions, features, tech stack
4. **Demo Video**: 60-90 seconds showing key features
5. **Write-up**: 200-300 words covering:
   - Problem you're solving
   - How your solution works
   - Tech choices and why
   - Key learnings

**Optional (but recommended)**:
- User testimonials (5+ users)
- Metrics screenshot (users, usage, feedback)
- Architecture diagram
- Product Hunt launch link
- Blog post about building it

## Development Timeline

### Week 1: Planning & Design (5-8 hours)
- **Mon-Tue**: Study product-thinking concept, complete Lab 1 (project scoping)
- **Wed-Thu**: User research (5 interviews or secondary research)
- **Fri-Sun**: Study architecture-design concept, complete Lab 2 (architecture diagram)
- **Deliverable**: Project scope doc, architecture diagram, ADRs

### Week 2: Core Development (12-15 hours)
- **Mon-Tue**: Set up Next.js project, database, authentication
- **Wed-Thu**: Implement core AI feature (prompts, API integration)
- **Fri-Sun**: Build basic UI, connect frontend to backend
- **Deliverable**: Working MVP with 1-2 core features

### Week 3: Features & Polish (8-10 hours)
- **Mon-Tue**: Add 2-3 additional features from MVP scope
- **Wed-Thu**: Implement error handling, caching, rate limiting
- **Fri-Sun**: Polish UI/UX, mobile responsive, loading states
- **Deliverable**: Feature-complete application

### Week 4: Deploy & Launch (5-7 hours)
- **Mon-Tue**: Study launch-deployment concept, complete Lab 4
- **Wed**: Deploy to production, set up monitoring
- **Thu**: Create demo video, write README
- **Fri**: Launch on 1-2 channels (Product Hunt, Twitter, etc.)
- **Weekend**: Respond to feedback, fix critical bugs
- **Deliverable**: Public launch, user feedback

## Tips for Success

### Product Tips
1. **Start with user research, not technology**: Validate the problem before building
2. **Scope ruthlessly**: Ship 3 great features, not 10 mediocre ones
3. **Get real users early**: Get feedback within first 2 weeks
4. **Build in public**: Share progress on Twitter for accountability

### Technical Tips
1. **Use existing UI components**: shadcn/ui lets you focus on AI features
2. **Deploy early and often**: Don't wait for perfection
3. **Track costs from day 1**: Implement caching early to avoid $500 bills
4. **Start with simple prompts**: Iterate based on real outputs
5. **Test with edge cases**: Empty inputs, very long inputs, special characters

### Launch Tips
1. **Focus on one great demo**: Quality over quantity
2. **Prepare launch assets beforehand**: Demo video, screenshots, copy
3. **Launch on Tuesday-Thursday**: Best days for Product Hunt
4. **Respond to every comment**: Engagement drives visibility
5. **Share your journey**: People love behind-the-scenes

## Common Pitfalls to Avoid

1. **Scope creep**: Trying to build too many features (stick to 3-5 core features)
2. **Skipping user research**: Building features nobody wants
3. **Poor prompt engineering**: Leads to inconsistent AI outputs
4. **No cost monitoring**: Surprise $500 API bills are real
5. **Delaying deployment**: Waiting for perfection prevents learning
6. **No error handling**: App crashes on API failures frustrate users
7. **Weak product positioning**: Unclear value proposition
8. **Skipping launch**: Not getting product in front of users

## Resources

### Concept Pages
- [Product Thinking for AI](/learn/sprint-7/product-thinking)
- [Architecture Design Patterns](/learn/sprint-7/architecture-design)
- [Launch Planning & Deployment](/learn/sprint-7/launch-deployment)

### Project Templates
- [AI Writing Assistant](/learn/sprint-7/templates/ai-writing-assistant)
- [Code Explainer & Documenter](/learn/sprint-7/templates/code-explainer)
- [Data Analysis Assistant](/learn/sprint-7/templates/data-analyzer)
- [Creative AI Tool](/learn/sprint-7/templates/creative-tool)

### External Resources
- [The Mom Test](http://momtestbook.com/) - User research
- [Lean Product Playbook](https://leanproductplaybook.com/) - Product development
- [Product Hunt Launch Guide](https://www.producthunt.com/launch) - Launching products
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview) - Deployment
- [Anthropic API Docs](https://docs.anthropic.com/) - Claude integration

## Getting Help

- **AI Mentor**: Use `/mentor` for 24/7 assistance
- **Concept pages**: Comprehensive guides with examples
- **Lab exercises**: Hands-on practice for each phase
- **Template guides**: Detailed implementation guidance

## Final Thoughts

Sprint 7 is not just about building an AI application - it's about shipping a real product that solves a real problem for real users. The skills you develop here (product thinking, architecture design, deployment, launch) are what separate engineers who code from engineers who ship.

Your goal is not perfection. It's to:
1. **Validate a real problem** (5+ user interviews)
2. **Ship an MVP quickly** (2-3 weeks max)
3. **Get real user feedback** (10+ users)
4. **Iterate based on data** (metrics, not assumptions)
5. **Build a portfolio piece** (demo video, case study)

The best time to start was yesterday. The second best time is now.

**Good luck, and ship it!**
