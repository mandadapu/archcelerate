# Sprint 6: Advanced Techniques (Optimization & Evaluation) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create Sprint 6 curriculum content teaching prompt optimization, evaluation frameworks, and systematic AI improvement with metrics-driven development

**Architecture:** Follow established Sprint 3/4/5 pattern with 3 concept MDX files (500-900 lines), 4 lab JSON specifications, 1 project JSON, dashboard integration, and documentation. Focus on systematic evaluation and optimization techniques.

**Tech Stack:** Braintrust (eval framework), TypeScript, Next.js, MDX, Claude API, evaluation metrics, A/B testing patterns

---

## Task 1: Create Sprint 6 Metadata and Structure

**Files:**
- Create: `content/sprints/sprint-6/metadata.json`
- Create: `content/sprints/sprint-6/concepts/` (directory)
- Create: `content/sprints/sprint-6/labs/` (directory)

**Step 1: Create Sprint 6 directories**

```bash
mkdir -p content/sprints/sprint-6/concepts
mkdir -p content/sprints/sprint-6/labs
```

**Step 2: Create metadata.json**

File: `content/sprints/sprint-6/metadata.json`

```json
{
  "id": "sprint-6",
  "title": "Advanced Techniques (Optimization & Evaluation)",
  "description": "Master prompt optimization, evaluation frameworks, and systematic AI improvement with metrics",
  "order": 6,
  "concepts": [
    {
      "id": "prompt-optimization",
      "title": "Prompt Optimization & Testing",
      "description": "Systematically improve prompts with testing and metrics",
      "difficulty": "advanced",
      "order": 1,
      "estimatedMinutes": 75,
      "prerequisites": ["chat-assistant", "prompt-engineering"],
      "tags": ["prompts", "optimization", "testing", "metrics", "iteration"]
    },
    {
      "id": "evaluation-frameworks",
      "title": "Evaluation Frameworks & Metrics",
      "description": "Build comprehensive evaluation systems for AI applications",
      "difficulty": "advanced",
      "order": 2,
      "estimatedMinutes": 90,
      "prerequisites": ["prompt-optimization"],
      "tags": ["evaluation", "metrics", "testing", "quality", "frameworks"]
    },
    {
      "id": "architecture-tradeoffs",
      "title": "Fine-tuning vs RAG vs Agents",
      "description": "Understand when to use different AI architecture patterns",
      "difficulty": "advanced",
      "order": 3,
      "estimatedMinutes": 90,
      "prerequisites": ["evaluation-frameworks", "rag-system", "tool-use"],
      "tags": ["architecture", "tradeoffs", "fine-tuning", "rag", "agents", "decision-making"]
    }
  ]
}
```

**Step 3: Verify structure**

```bash
ls -la content/sprints/sprint-6/
ls -la content/sprints/sprint-6/concepts/
ls -la content/sprints/sprint-6/labs/
```

Expected: Directories exist, metadata.json present

**Step 4: Commit**

```bash
git add content/sprints/sprint-6/
git commit -m "feat: add Sprint 6 metadata structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Concept 1 - Prompt Optimization & Testing

**Files:**
- Create: `content/sprints/sprint-6/concepts/prompt-optimization.mdx`

**Target:** 600-800 lines of comprehensive MDX content

**Required sections:**
1. Why prompt optimization matters (examples of before/after improvements)
2. Systematic testing approaches (test suites, evaluation metrics)
3. Prompt versioning and iteration strategies
4. Measuring prompt quality (accuracy, latency, cost)
5. Common optimization patterns (few-shot examples, chain-of-thought, structured output)
6. A/B testing prompts in production
7. Prompt regression testing
8. Tools and frameworks (Braintrust, custom eval)

**Frontmatter:**
```yaml
---
id: prompt-optimization
title: Prompt Optimization & Testing
description: Systematically improve prompts with testing and metrics
difficulty: advanced
estimatedMinutes: 75
order: 1
prerequisites:
  - chat-assistant
  - prompt-engineering
tags:
  - prompts
  - optimization
  - testing
  - metrics
  - iteration
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (6-8 items)
- Before/after examples showing 30%+ improvement
- TypeScript code for prompt testing framework
- Metrics calculation (accuracy, consistency, cost per request)
- A/B testing implementation
- Braintrust integration example
- Regression test suite pattern
- Mermaid diagrams (2+) for optimization workflow
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-6/concepts/prompt-optimization.mdx
git commit -m "feat: add prompt optimization & testing concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Concept 2 - Evaluation Frameworks & Metrics

**Files:**
- Create: `content/sprints/sprint-6/concepts/evaluation-frameworks.mdx`

**Target:** 700-900 lines of comprehensive MDX content

**Required sections:**
1. Types of AI evaluation (deterministic, LLM-as-judge, human eval)
2. Building evaluation datasets (golden sets, edge cases)
3. Key metrics (accuracy, precision, recall, F1, latency, cost)
4. LLM-as-judge patterns (self-evaluation, pairwise comparison)
5. Evaluation frameworks (Braintrust, custom solutions)
6. Continuous evaluation in production
7. Regression detection and alerting
8. ROI calculation for AI improvements

**Frontmatter:**
```yaml
---
id: evaluation-frameworks
title: Evaluation Frameworks & Metrics
description: Build comprehensive evaluation systems for AI applications
difficulty: advanced
estimatedMinutes: 90
order: 2
prerequisites:
  - prompt-optimization
tags:
  - evaluation
  - metrics
  - testing
  - quality
  - frameworks
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (7-9 items)
- Complete evaluation framework implementation
- TypeScript code for metrics calculation
- LLM-as-judge implementation (using Claude)
- Braintrust integration with code examples
- Golden dataset creation strategies
- Regression test suite
- Statistical significance testing
- Mermaid diagrams (2-3) for evaluation architecture
- Real-world case studies (3 examples)
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-6/concepts/evaluation-frameworks.mdx
git commit -m "feat: add evaluation frameworks & metrics concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Concept 3 - Architecture Tradeoffs (Fine-tuning vs RAG vs Agents)

**Files:**
- Create: `content/sprints/sprint-6/concepts/architecture-tradeoffs.mdx`

**Target:** 800-1000 lines of comprehensive MDX content

**Required sections:**
1. The three main patterns (fine-tuning, RAG, agents)
2. When to use fine-tuning (cost/benefit analysis)
3. When to use RAG (document Q&A, knowledge bases)
4. When to use agents (complex tasks, tool use)
5. Comparing approaches with metrics
6. Hybrid approaches (RAG + agents, fine-tuned + RAG)
7. Cost analysis for each approach
8. Decision framework with flowchart

**Frontmatter:**
```yaml
---
id: architecture-tradeoffs
title: Fine-tuning vs RAG vs Agents
description: Understand when to use different AI architecture patterns
difficulty: advanced
estimatedMinutes: 90
order: 3
prerequisites:
  - evaluation-frameworks
  - rag-system
  - tool-use
tags:
  - architecture
  - tradeoffs
  - fine-tuning
  - rag
  - agents
  - decision-making
---
```

**Step 1: Create comprehensive MDX file**

Include:
- Learning objectives (7-9 items)
- Comparison table (cost, latency, accuracy, complexity)
- Fine-tuning example with cost breakdown
- RAG example with performance metrics
- Agent example with tool orchestration
- Decision tree flowchart (Mermaid)
- Real-world case studies (4-5 examples)
- Cost calculator for each approach
- Performance benchmarks
- Mermaid diagrams (3+) for architecture patterns
- Practice exercises (5 items)

**Step 2: Commit**

```bash
git add content/sprints/sprint-6/concepts/architecture-tradeoffs.mdx
git commit -m "feat: add architecture tradeoffs concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Lab 1-4 JSON Specifications

**Files:**
- Create: `content/sprints/sprint-6/labs/lab-1-eval-suite.json`
- Create: `content/sprints/sprint-6/labs/lab-2-approach-comparison.json`
- Create: `content/sprints/sprint-6/labs/lab-3-prompt-optimizer.json`
- Create: `content/sprints/sprint-6/labs/lab-4-ab-testing.json`

**Reference:** Read `content/sprints/sprint-3/labs/lab-1-tool-definition.json` for structure

**Lab 1: Build Evaluation Test Suite**
- Build comprehensive eval suite for AI chat feature
- Include golden dataset (20+ examples)
- Implement LLM-as-judge evaluation
- Calculate accuracy, latency, cost metrics
- Target: 180 minutes, intermediate difficulty

**Lab 2: Compare Approaches Systematically**
- Compare 3 approaches to same problem (fine-tuning vs RAG vs agent)
- Measure accuracy, latency, cost for each
- Create comparison dashboard
- Make data-driven recommendation
- Target: 240 minutes, advanced difficulty

**Lab 3: Optimize Prompts with Metrics**
- Start with baseline prompt (50% accuracy)
- Build test suite with 30+ cases
- Iterate on prompt with metrics feedback
- Achieve 80%+ accuracy improvement
- Target: 180 minutes, intermediate difficulty

**Lab 4: Implement A/B Testing**
- Build A/B testing framework for prompts
- Track variant performance (A: baseline, B: optimized)
- Implement statistical significance testing
- Display results in dashboard
- Target: 240 minutes, advanced difficulty

**Step 1: Read reference lab structure**

```bash
cat content/sprints/sprint-3/labs/lab-1-tool-definition.json | head -50
```

**Step 2: Create all 4 lab JSON files**

Each must include:
- `id`, `title`, `description`
- `difficulty`, `estimatedMinutes`, `language: "typescript"`
- `starterCode` (complete TypeScript starter)
- `instructions` (detailed step-by-step)
- `testCases` (6-8 programmatic tests)
- `hints` (8-12 helpful tips)

**Step 3: Commit**

```bash
git add content/sprints/sprint-6/labs/
git commit -m "feat: add Sprint 6 lab specifications

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Project Specification - AI Product Optimizer

**Files:**
- Create: `content/sprints/sprint-6/project.json`

**Reference:** Read `content/sprints/sprint-3/project.json` for structure

**Project Requirements:**
- Take existing AI feature (provided baseline)
- Build comprehensive evaluation suite
- Optimize prompts/approach iteratively
- Measure improvement with metrics
- Demonstrate 20%+ improvement on defined metric
- Include A/B testing comparison
- Display results in dashboard

**Key sections:**
- `id`: "ai-product-optimizer"
- `title`: "AI Product Optimizer"
- `description`: "Systematically improve AI features with evaluation and metrics"
- `difficulty`: "advanced"
- `estimatedHours`: 4
- `technologies`: ["Next.js", "Claude API", "Braintrust", "TypeScript"]
- `learningObjectives`: 8 items
- `requirements`: functional (10), technical (10), ui (8)
- `successCriteria`: weighted criteria totaling 100%
  - Evaluation Quality (30%): Comprehensive test suite, accurate metrics
  - Optimization Results (30%): 20%+ improvement on key metric
  - A/B Testing (20%): Statistical comparison, clear winner
  - Dashboard & UX (20%): Visual metrics, clear presentation
- `testScenarios`: 10 detailed scenarios
- `starterFiles`: 15-18 files
- `technicalGuidance`: detailed implementation guide
- `deploymentRequirements`: Vercel + environment variables
- `estimatedCosts`: development ($3-5), production ($25-50/month)
- `extensionIdeas`: 12 advanced features
- `rubric`: excellent/good/needs-improvement/incomplete

**Step 1: Read reference project structure**

```bash
cat content/sprints/sprint-3/project.json | head -100
```

**Step 2: Create comprehensive project.json**

Follow Sprint 3/5 pattern exactly with all required fields.

**Step 3: Commit**

```bash
git add content/sprints/sprint-6/project.json
git commit -m "feat: add AI Product Optimizer project specification

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build and Test Sprint 6 Content

**Files:**
- No file changes (verification only)

**Step 1: Run Next.js build**

```bash
npm run build
```

Expected: Build succeeds, no TypeScript errors, all Sprint 6 routes compile

**Step 2: Verify content loading**

```bash
ls -la content/sprints/sprint-6/concepts/
ls -la content/sprints/sprint-6/labs/
```

Expected: All 3 concept files and 4 lab files present

**Step 3: Report success**

No commit needed - this is verification only.

---

## Task 8: Update Dashboard to Show Sprint 6

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Add Sprint 6 progress fetching**

After Sprint 5 progress (around line 32), add:
```typescript
const sprint6Progress = user ? await getSprintProgress(user.id, 'sprint-6') : null
```

**Step 2: Add Sprint 6 card to dashboard**

After Sprint 5 card, add:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sprint 6</CardTitle>
    <CardDescription>Advanced Techniques</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Master prompt optimization, evaluation frameworks, and systematic AI improvement
    </p>
    {sprint6Progress && sprint6Progress.totalCount > 0 ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              {sprint6Progress.completedCount} of {sprint6Progress.totalCount} concepts
            </span>
            <span className="font-medium">
              {Math.round(sprint6Progress.percentComplete)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${sprint6Progress.percentComplete}%` }}
            />
          </div>
        </div>
        <Link href="/learn/sprint-6">
          <Button size="sm" variant="outline" className="w-full">
            {sprint6Progress.completedCount === 0
              ? 'Start Sprint'
              : sprint6Progress.completedCount === sprint6Progress.totalCount
              ? 'Review Sprint'
              : 'Continue Sprint'}
          </Button>
        </Link>
      </div>
    ) : (
      <Link href="/learn/sprint-6">
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
git commit -m "feat: add Sprint 6 card to dashboard

Display Sprint 6: Advanced Techniques on dashboard with progress tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Documentation and README Update

**Files:**
- Modify: `README.md`
- Create: `docs/SPRINT-6-GUIDE.md`

**Step 1: Update README**

Add Sprint 6 to Learning Platform features (around line 199):
```markdown
- ✅ **Sprint 6**: Advanced Techniques (prompt optimization, evaluation, architecture tradeoffs)
```

**Step 2: Create SPRINT-6-GUIDE.md**

Create comprehensive guide at `docs/SPRINT-6-GUIDE.md`:

```markdown
# Sprint 6: Advanced Techniques (Optimization & Evaluation) Guide

## Overview
Sprint 6 teaches systematic AI improvement through prompt optimization, evaluation frameworks, and architecture decision-making.

## Concepts

### Concept 1: Prompt Optimization & Testing
- Systematic testing approaches
- Prompt versioning and iteration
- Measuring prompt quality (accuracy, latency, cost)
- A/B testing in production
- Regression testing
- Tools: Braintrust, custom eval frameworks

### Concept 2: Evaluation Frameworks & Metrics
- Types of evaluation (deterministic, LLM-as-judge, human)
- Building evaluation datasets
- Key metrics (accuracy, precision, recall, F1)
- LLM-as-judge patterns
- Continuous evaluation
- ROI calculation

### Concept 3: Fine-tuning vs RAG vs Agents
- Understanding the three main patterns
- When to use each approach
- Cost/benefit analysis
- Hybrid approaches
- Decision framework

## Labs

### Lab 1: Evaluation Test Suite (180 min)
Build comprehensive eval suite with golden dataset, LLM-as-judge, and metrics.

### Lab 2: Approach Comparison (240 min)
Compare fine-tuning vs RAG vs agents with data-driven metrics.

### Lab 3: Prompt Optimizer (180 min)
Achieve 80%+ accuracy improvement through systematic iteration.

### Lab 4: A/B Testing (240 min)
Implement A/B testing framework with statistical significance.

## Project: AI Product Optimizer

Systematically improve an AI feature:
- Build evaluation suite
- Optimize iteratively with metrics
- Demonstrate 20%+ improvement
- A/B test variants
- Display results in dashboard

**Estimated Time**: 4 hours (advanced)

## Technologies
- Braintrust (eval framework)
- Claude API
- Statistical analysis
- Next.js
- TypeScript

## Success Criteria
- Evaluation quality (30%): Comprehensive test suite, accurate metrics
- Optimization results (30%): 20%+ improvement demonstrated
- A/B testing (20%): Statistical comparison with clear winner
- Dashboard & UX (20%): Visual metrics, clear presentation

## Getting Started
1. Complete Sprints 1-5 (prerequisite knowledge)
2. Start with Concept 1: Prompt Optimization
3. Complete all 4 labs for hands-on practice
4. Build capstone project demonstrating systematic improvement
5. Deploy with Braintrust integration

## Common Challenges

**Challenge**: Hard to measure prompt improvements objectively
**Solution**: Build golden dataset with 30+ examples, use LLM-as-judge for consistency

**Challenge**: A/B test shows no statistical significance
**Solution**: Increase sample size, ensure variants are meaningfully different

**Challenge**: Don't know which approach to choose (fine-tuning vs RAG vs agents)
**Solution**: Use decision framework from Concept 3, start with simplest (RAG), measure

## Cost Estimates

**Development**: ~$3-5 (eval API calls)
**Production**: $25-50/month (continuous evaluation)
**ROI**: 20%+ performance improvement typically saves 2-3x eval costs

## Next Steps
After Sprint 6:
- Sprint 7: Capstone Project (build portfolio-worthy AI product)
- Or revisit earlier sprints with advanced evaluation techniques
```

**Step 3: Commit**

```bash
git add README.md docs/SPRINT-6-GUIDE.md
git commit -m "docs: add Sprint 6 documentation and update README

Add Sprint 6 to README features list and create comprehensive Sprint 6 Guide

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

**9 tasks total:**
1. Create Sprint 6 metadata and structure
2. Create Concept 1: Prompt Optimization & Testing (600-800 lines)
3. Create Concept 2: Evaluation Frameworks & Metrics (700-900 lines)
4. Create Concept 3: Architecture Tradeoffs (800-1000 lines)
5. Create Lab 1-4 JSON specifications (4 files)
6. Create Project: AI Product Optimizer
7. Build and test Sprint 6 content
8. Update dashboard with Sprint 6 card
9. Update documentation and README

**Expected commits:** 9 commits
**Estimated time:** 4-6 hours for implementation
**Files created:** 10 new files (1 metadata, 3 concepts, 4 labs, 1 project, 1 guide)
**Files modified:** 2 files (dashboard, README)
