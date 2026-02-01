# Sprint 7: Capstone Project (Learner-Designed) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create Sprint 7 curriculum content teaching product thinking, architecture design, and guiding learners to build portfolio-worthy AI products using techniques from Sprints 1-6

**Architecture:** Follow established Sprint 3/4/5/6 pattern with 3 concept MDX files, 4 lab JSON specifications, and 1 unique project template system that provides scaffolding for learner-designed capstone projects with predefined templates (AI writing assistant, code explainer, data analyzer, creative tool).

**Tech Stack:** MDX, TypeScript, Next.js, Claude API, learner-choice integration of previous sprint technologies, project templates, architecture diagrams, deployment guides

---

## Task 1: Create Sprint 7 Metadata and Structure

**Files:**
- Create: `content/sprints/sprint-7/metadata.json`
- Create: `content/sprints/sprint-7/concepts/` (directory)
- Create: `content/sprints/sprint-7/labs/` (directory)

**Step 1: Create Sprint 7 directories**

```bash
mkdir -p content/sprints/sprint-7/concepts
mkdir -p content/sprints/sprint-7/labs
```

**Step 2: Create metadata.json**

File: `content/sprints/sprint-7/metadata.json`

```json
{
  "id": "sprint-7",
  "title": "Capstone Project (Build Your AI Product)",
  "description": "Apply everything you've learned to build a portfolio-worthy AI product from scratch",
  "order": 7,
  "concepts": [
    {
      "id": "product-thinking",
      "title": "Product Thinking for AI",
      "description": "Learn to identify problems, define solutions, and scope AI products effectively",
      "difficulty": "advanced",
      "order": 1,
      "estimatedMinutes": 60,
      "prerequisites": ["chat-assistant", "tool-use", "cost-optimization"],
      "tags": ["product", "strategy", "scoping", "user-research", "problem-solving"]
    },
    {
      "id": "architecture-design",
      "title": "Architecture Design Patterns",
      "description": "Design scalable, maintainable AI application architectures",
      "difficulty": "advanced",
      "order": 2,
      "estimatedMinutes": 75,
      "prerequisites": ["product-thinking", "architecture-tradeoffs"],
      "tags": ["architecture", "design", "patterns", "scalability", "system-design"]
    },
    {
      "id": "launch-deployment",
      "title": "Launch Planning & Deployment",
      "description": "Plan your launch strategy and deploy AI products to production",
      "difficulty": "advanced",
      "order": 3,
      "estimatedMinutes": 90,
      "prerequisites": ["architecture-design", "monitoring-observability"],
      "tags": ["deployment", "launch", "production", "planning", "go-to-market"]
    }
  ]
}
```

**Step 3: Verify structure**

```bash
ls -la content/sprints/sprint-7/
ls -la content/sprints/sprint-7/concepts/
ls -la content/sprints/sprint-7/labs/
```

Expected: Directories exist, metadata.json present

**Step 4: Commit**

```bash
git add content/sprints/sprint-7/
git commit -m "feat: add Sprint 7 metadata structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Concept 1 - Product Thinking for AI

**Files:**
- Create: `content/sprints/sprint-7/concepts/product-thinking.mdx`

**Target:** 600-800 lines of comprehensive MDX content

**Required sections:**
1. Why product thinking matters (AI is means, not end)
2. Identifying real problems worth solving
3. User research for AI products (understanding needs, not wants)
4. Defining success metrics (business + technical)
5. Scoping AI products (MVP vs full vision)
6. Choosing the right AI techniques (when to use RAG, agents, fine-tuning, etc.)
7. Cost-benefit analysis for AI features
8. Building in public & getting feedback

**Frontmatter:**
```yaml
---
id: product-thinking
title: Product Thinking for AI
description: Learn to identify problems, define solutions, and scope AI products effectively
difficulty: advanced
estimatedMinutes: 60
order: 1
prerequisites:
  - chat-assistant
  - tool-use
  - cost-optimization
tags:
  - product
  - strategy
  - scoping
  - user-research
  - problem-solving
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (6-8 items)
- Real-world problem identification examples
- User research frameworks (jobs-to-be-done, user interviews)
- Success metrics framework (SMART goals, leading/lagging indicators)
- MVP scoping techniques (80/20 rule, hypothesis-driven)
- Decision tree for technique selection (from Sprint 6)
- Cost-benefit calculator TypeScript code
- Case studies (3 examples: successful + failed products)
- Mermaid diagrams (2+) for product development workflow
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-7/concepts/product-thinking.mdx
git commit -m "feat: add product thinking for AI concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Concept 2 - Architecture Design Patterns

**Files:**
- Create: `content/sprints/sprint-7/concepts/architecture-design.mdx`

**Target:** 700-900 lines of comprehensive MDX content

**Required sections:**
1. Principles of good architecture (scalability, maintainability, testability)
2. Component-based architecture for AI apps
3. Data flow patterns (unidirectional, event-driven)
4. State management strategies (client vs server, caching)
5. API design for AI features (REST, streaming, webhooks)
6. Database design for AI products (vector + relational)
7. Common architecture patterns (monolith, microservices, serverless)
8. Documenting architecture (C4 diagrams, ADRs)

**Frontmatter:**
```yaml
---
id: architecture-design
title: Architecture Design Patterns
description: Design scalable, maintainable AI application architectures
difficulty: advanced
estimatedMinutes: 75
order: 2
prerequisites:
  - product-thinking
  - architecture-tradeoffs
tags:
  - architecture
  - design
  - patterns
  - scalability
  - system-design
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (7-9 items)
- SOLID principles applied to AI apps
- Component diagrams with TypeScript interfaces
- Data flow diagrams (Mermaid)
- State management patterns with code examples
- API design examples (REST + streaming)
- Database schema examples (Prisma)
- C4 architecture diagrams (3-4 levels)
- Architecture Decision Record (ADR) template
- Real-world architecture examples (3 case studies)
- Mermaid diagrams (3+) for system architecture
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-7/concepts/architecture-design.mdx
git commit -m "feat: add architecture design patterns concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Concept 3 - Launch Planning & Deployment

**Files:**
- Create: `content/sprints/sprint-7/concepts/launch-deployment.mdx`

**Target:** 800-1000 lines of comprehensive MDX content

**Required sections:**
1. Pre-launch checklist (technical + product readiness)
2. Deployment strategies (blue-green, canary, feature flags)
3. Vercel deployment deep dive (configuration, environment, domains)
4. Monitoring & observability setup (integrating Sprint 5 concepts)
5. Launch day operations (what to watch, how to respond)
6. Post-launch iteration (gathering feedback, measuring success)
7. Go-to-market strategies (landing page, demos, documentation)
8. Building in public & portfolio presentation

**Frontmatter:**
```yaml
---
id: launch-deployment
title: Launch Planning & Deployment
description: Plan your launch strategy and deploy AI products to production
difficulty: advanced
estimatedMinutes: 90
order: 3
prerequisites:
  - architecture-design
  - monitoring-observability
tags:
  - deployment
  - launch
  - production
  - planning
  - go-to-market
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (8-10 items)
- Pre-launch checklist (technical: 15 items, product: 10 items)
- Deployment strategy comparison table
- Complete Vercel deployment guide with code
- Environment variable management patterns
- Feature flag implementation (TypeScript)
- Monitoring dashboard setup (from Sprint 5)
- Launch day runbook (incident response)
- Post-launch metrics tracking
- Landing page template (React component)
- Documentation structure template
- Portfolio presentation guide
- Mermaid diagrams (3+) for deployment workflow
- Case studies (3 examples: launch successes)
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-7/concepts/launch-deployment.mdx
git commit -m "feat: add launch planning & deployment concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Lab 1-4 JSON Specifications

**Files:**
- Create: `content/sprints/sprint-7/labs/lab-1-project-scoping.json`
- Create: `content/sprints/sprint-7/labs/lab-2-architecture-diagram.json`
- Create: `content/sprints/sprint-7/labs/lab-3-success-metrics.json`
- Create: `content/sprints/sprint-7/labs/lab-4-deployment-plan.json`

**Reference:** Read `content/sprints/sprint-3/labs/lab-1-tool-definition.json` for structure

**Lab 1: Practice Project Scoping**
- Given a vague idea, create detailed project scope
- Define MVP, user stories, success metrics
- Estimate effort and choose AI techniques
- Target: 45 minutes, intermediate difficulty

**Lab 2: Create Architecture Diagrams**
- Design complete system architecture for AI product
- Create C4 diagrams (context, container, component)
- Document key decisions in ADR format
- Target: 60 minutes, advanced difficulty

**Lab 3: Define Success Metrics**
- Create comprehensive metrics framework
- Define leading/lagging indicators
- Set up tracking implementation plan
- Build basic analytics dashboard spec
- Target: 45 minutes, intermediate difficulty

**Lab 4: Plan Deployment Strategy**
- Create deployment checklist and runbook
- Design feature flag strategy
- Plan monitoring and alerting setup
- Write launch communication plan
- Target: 50 minutes, advanced difficulty

**Step 1: Read reference lab structure**

```bash
cat content/sprints/sprint-3/labs/lab-1-tool-definition.json | head -50
```

**Step 2: Create all 4 lab JSON files**

Each must include:
- `id`, `title`, `description`
- `difficulty`, `estimatedMinutes`, `language: "typescript"`
- `starterCode` (templates, frameworks, boilerplate)
- `instructions` (detailed step-by-step)
- `testCases` (6-8 validation criteria)
- `hints` (8-12 helpful tips)

**Step 3: Commit**

```bash
git add content/sprints/sprint-7/labs/
git commit -m "feat: add Sprint 7 lab specifications

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Project Template System

**Files:**
- Create: `content/sprints/sprint-7/project.json`
- Create: `content/sprints/sprint-7/templates/` (directory with 4 template JSONs)

**Project Template System Design:**

Instead of a single prescriptive project, Sprint 7 provides a template system where learners choose their path.

**Main project.json** - Describes the capstone project framework:
- Learner selects from 4 predefined templates OR proposes custom
- Must integrate 2+ techniques from Sprints 1-6
- Must be deployed and documented
- Portfolio-worthy quality requirements

**Template files** (4 templates):
1. `ai-writing-assistant.json` - Content generation, editing, style transfer
2. `code-explainer.json` - Code analysis, documentation, learning tool
3. `data-analyzer.json` - Data insights, visualization, natural language queries
4. `creative-tool.json` - Image generation integration, creative writing, ideation

**Step 1: Create main project.json**

File: `content/sprints/sprint-7/project.json`

Reference Sprint 3 project structure but adapt for template system:

```json
{
  "id": "capstone-project",
  "title": "Build Your AI Product (Capstone)",
  "description": "Design and build a complete, portfolio-worthy AI product using techniques from Sprints 1-6",
  "difficulty": "advanced",
  "estimatedHours": 8,
  "type": "template-based",
  "technologies": ["Next.js", "Claude API", "TypeScript", "Learner Choice"],
  "learningObjectives": [
    "Apply product thinking to identify and scope an AI product",
    "Design scalable architecture integrating multiple AI techniques",
    "Implement 2+ techniques from previous sprints cohesively",
    "Deploy production-ready application to Vercel",
    "Create comprehensive documentation and demo",
    "Present project in portfolio-worthy format",
    "Demonstrate end-to-end product development skills",
    "Build public-facing AI product with real users"
  ],
  "requirements": {
    "functional": [
      "Choose template OR propose custom project (approved by self-assessment)",
      "Integrate minimum 2 techniques from Sprints 1-6 (e.g., RAG + Agents, Multimodal + Caching)",
      "Implement core user workflow end-to-end",
      "Include authentication/user management if applicable",
      "Provide clear value proposition to users",
      "Handle errors gracefully with helpful messages",
      "Include basic analytics/usage tracking",
      "Support mobile responsive design"
    ],
    "technical": [
      "Deploy to Vercel with custom domain (optional)",
      "Implement at least one optimization technique (caching, rate limiting, etc.)",
      "Include monitoring with Sentry or similar",
      "Write comprehensive README with setup instructions",
      "Document architecture decisions (ADRs)",
      "Include API documentation if applicable",
      "Pass TypeScript type checking",
      "Follow accessibility best practices (WCAG 2.1 Level A minimum)"
    ],
    "ui": [
      "Professional, polished user interface",
      "Clear navigation and user flow",
      "Loading states for async operations",
      "Error states with actionable guidance",
      "Success feedback for user actions",
      "Responsive design (mobile + desktop)",
      "Consistent design system/styling",
      "Demo video or walkthrough (2-3 minutes)"
    ]
  },
  "successCriteria": [
    {
      "criterion": "Integration Depth",
      "description": "Effectively combines 2+ AI techniques with clear synergy",
      "weight": 25
    },
    {
      "criterion": "Production Quality",
      "description": "Deployed, monitored, optimized, and documented like a real product",
      "weight": 25
    },
    {
      "criterion": "User Experience",
      "description": "Polished UI/UX, clear value prop, handles edge cases gracefully",
      "weight": 20
    },
    {
      "criterion": "Architecture & Code Quality",
      "description": "Well-structured, maintainable, follows best practices",
      "weight": 15
    },
    {
      "criterion": "Portfolio Presentation",
      "description": "Excellent documentation, demo, and presentation materials",
      "weight": 15
    }
  ],
  "templates": [
    {
      "id": "ai-writing-assistant",
      "title": "AI Writing Assistant",
      "file": "templates/ai-writing-assistant.json"
    },
    {
      "id": "code-explainer",
      "title": "Code Explainer & Learning Tool",
      "file": "templates/code-explainer.json"
    },
    {
      "id": "data-analyzer",
      "title": "Natural Language Data Analyzer",
      "file": "templates/data-analyzer.json"
    },
    {
      "id": "creative-tool",
      "title": "AI Creative Assistant",
      "file": "templates/creative-tool.json"
    }
  ],
  "customProjectGuidelines": {
    "description": "If proposing a custom project, use this self-assessment checklist",
    "requirements": [
      "Clearly defined problem and target user",
      "Realistic scope for 8 hours of development",
      "Integrates 2+ techniques from Sprints 1-6",
      "Feasible with Claude API + available tools",
      "Provides clear value to users",
      "Can be fully deployed and demonstrated"
    ]
  },
  "estimatedCosts": {
    "development": {
      "claude": "$5-10 (testing and iteration)",
      "deployment": "$0 (Vercel free tier)",
      "other": "$0-5 (optional: domain, additional services)",
      "total": "$5-15"
    },
    "production": {
      "claude": "$10-50/month (depends on usage)",
      "vercel": "$0-20/month (free tier usually sufficient)",
      "other": "$0-20/month (monitoring, storage, etc.)",
      "total": "$10-90/month"
    }
  },
  "deliverables": [
    "Deployed application (live URL)",
    "GitHub repository with complete source code",
    "Comprehensive README with setup instructions",
    "Architecture documentation (diagrams + ADRs)",
    "Demo video (2-3 minutes)",
    "Portfolio presentation page",
    "User documentation/guide"
  ],
  "rubric": {
    "exceeds": "Exceptional integration of 3+ techniques, production-grade quality, outstanding UX, comprehensive documentation, creative problem-solving, ready for real users",
    "meets": "Solid integration of 2+ techniques, deployed successfully, good UX, well-documented, demonstrates learning, portfolio-worthy",
    "approaching": "Integrates 2 techniques but weak synergy, deployed with issues, basic UX, incomplete documentation, shows potential but needs polish",
    "incomplete": "Single technique only, not deployed, poor UX, minimal documentation, or doesn't work end-to-end"
  }
}
```

**Step 2: Create templates directory and 4 template files**

```bash
mkdir -p content/sprints/sprint-7/templates
```

Each template JSON should include:
- Template-specific requirements
- Suggested AI techniques to integrate
- User stories and features
- Architecture recommendations
- Sample component structure
- Deployment considerations
- Success criteria specific to template

Example structure for `ai-writing-assistant.json`:

```json
{
  "id": "ai-writing-assistant",
  "title": "AI Writing Assistant",
  "tagline": "Help users write better with AI-powered editing, suggestions, and style transfer",
  "suggestedTechniques": [
    "Prompt Engineering (Sprint 1) - for different writing styles",
    "Prompt Optimization (Sprint 6) - for better output quality",
    "Caching (Sprint 5) - for common suggestions",
    "Streaming (Sprint 1) - for real-time generation"
  ],
  "coreFeatures": [
    "Document editor with AI suggestions",
    "Multiple writing styles (professional, casual, creative)",
    "Grammar and clarity improvements",
    "Tone adjustment",
    "Content expansion/summarization"
  ],
  "userStories": [
    "As a writer, I want AI to suggest improvements to my draft",
    "As a student, I want help making my essay more academic",
    "As a marketer, I want to adjust tone for different audiences",
    "As a content creator, I want to expand brief notes into full articles"
  ],
  "architectureGuidance": {
    "frontend": "Rich text editor (Tiptap, Slate, or Lexical)",
    "backend": "Next.js API routes with streaming",
    "storage": "Optional: Save documents to database",
    "ai": "Claude with multiple prompt templates"
  },
  "integrationExamples": [
    {
      "technique1": "Streaming",
      "technique2": "Prompt Optimization",
      "synergy": "Stream optimized prompts for real-time editing suggestions"
    },
    {
      "technique1": "Caching",
      "technique2": "Prompt Engineering",
      "synergy": "Cache common style transformations to reduce costs"
    }
  ]
}
```

Create similar template files for:
- `code-explainer.json`
- `data-analyzer.json`
- `creative-tool.json`

**Step 3: Commit**

```bash
git add content/sprints/sprint-7/project.json
git add content/sprints/sprint-7/templates/
git commit -m "feat: add Sprint 7 capstone project template system

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build and Test Sprint 7 Content

**Files:**
- No file changes (verification only)

**Step 1: Run Next.js build**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors, all Sprint 7 routes compile

**Step 2: Verify content loading**

```bash
ls -la content/sprints/sprint-7/concepts/
ls -la content/sprints/sprint-7/labs/
ls -la content/sprints/sprint-7/templates/
```

Expected: All 3 concept files, 4 lab files, 1 project file, and 4 template files present

**Step 3: Report success**

No commit needed - this is verification only.

---

## Task 8: Update Dashboard to Show Sprint 7

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Add Sprint 7 progress fetching**

After Sprint 6 progress (around line 33), add:
```typescript
const sprint7Progress = user ? await getSprintProgress(user.id, 'sprint-7') : null
```

**Step 2: Add Sprint 7 card to dashboard**

After Sprint 6 card (around line 373), add:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sprint 7</CardTitle>
    <CardDescription>Capstone Project</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Build your own portfolio-worthy AI product using everything you've learned
    </p>
    {sprint7Progress && sprint7Progress.totalCount > 0 ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              {sprint7Progress.completedCount} of {sprint7Progress.totalCount} concepts
            </span>
            <span className="font-medium">
              {Math.round(sprint7Progress.percentComplete)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${sprint7Progress.percentComplete}%` }}
            />
          </div>
        </div>
        <Link href="/learn/sprint-7">
          <Button size="sm" variant="outline" className="w-full">
            {sprint7Progress.completedCount === 0
              ? 'Start Sprint'
              : sprint7Progress.completedCount === sprint7Progress.totalCount
              ? 'Review Sprint'
              : 'Continue Sprint'}
          </Button>
        </Link>
      </div>
    ) : (
      <Link href="/learn/sprint-7">
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
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat: add Sprint 7 card to dashboard

Display Sprint 7: Capstone Project on dashboard with progress tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Documentation and README Update

**Files:**
- Modify: `README.md`
- Create: `docs/SPRINT-7-GUIDE.md`

**Step 1: Update README**

Add Sprint 7 to Learning Platform features (around line 200):
```markdown
- ✅ **Sprint 7**: Capstone Project (product thinking, architecture design, build your AI product)
```

**Step 2: Create SPRINT-7-GUIDE.md**

Create comprehensive guide at `docs/SPRINT-7-GUIDE.md`:

```markdown
# Sprint 7: Capstone Project Guide

## Overview
Sprint 7 is your opportunity to build a complete, portfolio-worthy AI product using everything you've learned in Sprints 1-6.

## What Makes This Different

Unlike previous sprints where projects were prescribed, Sprint 7 is **learner-designed**. You choose what to build based on your interests and career goals.

## Concepts

### Concept 1: Product Thinking for AI
- Identifying real problems worth solving
- User research and needs analysis
- Defining success metrics (SMART goals)
- Scoping MVPs effectively
- Choosing the right AI techniques for your problem
- Cost-benefit analysis

### Concept 2: Architecture Design Patterns
- Component-based architecture
- Data flow patterns
- State management strategies
- API design for AI features
- Database design (vector + relational)
- Documenting architecture (C4 diagrams, ADRs)

### Concept 3: Launch Planning & Deployment
- Pre-launch checklists
- Deployment strategies (blue-green, canary, feature flags)
- Vercel deployment deep dive
- Monitoring & observability setup
- Launch day operations
- Go-to-market strategies

## Labs

### Lab 1: Project Scoping (45 min)
Practice turning vague ideas into detailed project scopes with MVPs and success metrics.

### Lab 2: Architecture Diagrams (60 min)
Design complete system architecture using C4 diagrams and document decisions with ADRs.

### Lab 3: Success Metrics (45 min)
Define comprehensive metrics frameworks with leading/lagging indicators.

### Lab 4: Deployment Planning (50 min)
Create deployment checklists, runbooks, and launch communication plans.

## Capstone Project Options

### Template-Based Projects

**Option 1: AI Writing Assistant**
- Content generation, editing, style transfer
- Suggested techniques: Prompt Optimization + Caching + Streaming
- Target users: Writers, students, marketers

**Option 2: Code Explainer & Learning Tool**
- Code analysis, documentation generation, learning assistance
- Suggested techniques: Multimodal (Vision) + Agents + RAG
- Target users: Developers, students, educators

**Option 3: Natural Language Data Analyzer**
- Data insights, visualization, natural language queries
- Suggested techniques: Agents + RAG + Evaluation
- Target users: Business analysts, researchers, data teams

**Option 4: AI Creative Assistant**
- Image generation integration, creative writing, ideation
- Suggested techniques: Multimodal + Prompt Optimization + Streaming
- Target users: Designers, creators, artists

### Custom Projects

If none of the templates fit, propose your own! Use the self-assessment checklist:
- ✅ Clearly defined problem and target user
- ✅ Realistic scope for 8 hours
- ✅ Integrates 2+ techniques from Sprints 1-6
- ✅ Feasible with Claude API + available tools
- ✅ Provides clear value to users
- ✅ Can be fully deployed and demonstrated

## Requirements

### Must Have
- **Integration**: Minimum 2 techniques from previous sprints
- **Deployment**: Live on Vercel with working demo
- **Documentation**: Comprehensive README + architecture docs
- **Demo**: 2-3 minute video walkthrough
- **Quality**: Production-ready code, monitoring, error handling

### Should Have
- Custom domain (optional but recommended)
- Analytics/usage tracking
- Responsive design (mobile + desktop)
- Accessibility (WCAG 2.1 Level A minimum)

## Success Criteria

**Integration Depth (25%)**
- Effectively combines 2+ AI techniques with clear synergy
- Demonstrates understanding of when/why to use each technique

**Production Quality (25%)**
- Deployed, monitored, optimized, documented
- Handles edge cases and errors gracefully
- Includes basic security and cost optimization

**User Experience (20%)**
- Polished UI/UX with clear value proposition
- Intuitive navigation and workflow
- Professional design and branding

**Architecture & Code Quality (15%)**
- Well-structured, maintainable codebase
- Follows best practices from previous sprints
- Clear documentation of technical decisions

**Portfolio Presentation (15%)**
- Excellent README with screenshots/demo
- Architecture diagrams and documentation
- Compelling demo video
- Ready to show employers/clients

## Estimated Time & Cost

**Development Time**: 8 hours (can extend if needed)
**Development Cost**: $5-15 (mostly Claude API)
**Production Cost**: $10-90/month (depends on usage)

## Deliverables

1. **Live Application** - Deployed on Vercel with working demo
2. **GitHub Repository** - Complete source code, well-organized
3. **README** - Setup instructions, features, screenshots
4. **Architecture Docs** - C4 diagrams, ADRs, technical decisions
5. **Demo Video** - 2-3 minute walkthrough showing key features
6. **Portfolio Page** - Presentation of your project for portfolio

## Tips for Success

1. **Start with the problem**: Don't start with "I want to use RAG" - start with "Users need X"
2. **Scope ruthlessly**: 8 hours goes fast. Build MVP first, add features later
3. **Pick complementary techniques**: Choose techniques that enhance each other
4. **Deploy early**: Don't wait until the end to deploy
5. **Document as you go**: Write README and docs while building, not after
6. **Get feedback**: Share your WIP with others for early feedback
7. **Make it yours**: This is your portfolio piece - make it unique and interesting

## Common Pitfalls

❌ **Over-scoping**: Trying to build too much in 8 hours
✅ **Solution**: Focus on one core workflow, make it excellent

❌ **Tech for tech's sake**: Using techniques because you can, not because you should
✅ **Solution**: Always ask "does this serve the user need?"

❌ **Waiting to deploy**: Deployment issues discovered at the end
✅ **Solution**: Deploy a "hello world" on day 1

❌ **Weak integration**: Two techniques present but not working together
✅ **Solution**: Ensure techniques have clear synergy (e.g., RAG provides context for Agent's tool calls)

## Examples of Strong Integration

**Example 1: Research Assistant**
- **RAG**: Retrieve relevant documents from knowledge base
- **Agents**: Use tools to fetch external data and synthesize
- **Synergy**: RAG provides internal context, Agents add external intelligence

**Example 2: Content Optimizer**
- **Prompt Optimization**: Iterate on prompts with A/B testing
- **Evaluation**: Score outputs with LLM-as-judge
- **Synergy**: Evaluation drives optimization in tight feedback loop

**Example 3: Multimodal Analyzer**
- **Vision**: Extract information from images/screenshots
- **RAG**: Augment with related textual knowledge
- **Synergy**: Vision provides structured data, RAG adds context

## Next Steps After Sprint 7

Congratulations on completing the AI Product Builder curriculum!

**Career paths**:
- Apply for AI/ML engineering roles
- Build a portfolio of AI products
- Start freelancing with AI consulting
- Contribute to open source AI projects
- Continue learning with advanced topics (fine-tuning, reinforcement learning)

**Keep building**: The best way to improve is to keep shipping AI products!
```

**Step 3: Commit**

```bash
git add README.md docs/SPRINT-7-GUIDE.md
git commit -m "docs: add Sprint 7 documentation and update README

Add Sprint 7 to README and create comprehensive Capstone Project Guide

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

**9 tasks total:**
1. Create Sprint 7 metadata and structure
2. Create Concept 1: Product Thinking for AI (600-800 lines)
3. Create Concept 2: Architecture Design Patterns (700-900 lines)
4. Create Concept 3: Launch Planning & Deployment (800-1000 lines)
5. Create Lab 1-4 JSON specifications (4 files)
6. Create Project template system (1 main + 4 template files)
7. Build and test Sprint 7 content
8. Update dashboard with Sprint 7 card
9. Update documentation and README

**Expected commits:** 9 commits
**Estimated time:** 5-7 hours for implementation
**Files created:** 14 new files (1 metadata, 3 concepts, 4 labs, 1 project, 4 templates, 1 guide)
**Files modified:** 2 files (dashboard, README)

**Unique aspects of Sprint 7:**
- Template-based project system (not prescriptive)
- 4 predefined project templates + custom option
- Focus on learner autonomy and portfolio building
- Integration of all previous sprint techniques
- Production deployment emphasis
- Portfolio presentation requirements
