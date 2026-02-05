# Skill Diagnosis Dashboard: UI Specification
## Real-Time Telemetry of AI Architect Proficiency

> **Purpose**: Provide students and hiring managers with quantified proof of architectural capability across 7 core domains.

---

## Dashboard Layout

### Page Title
**Architectural Skill Diagnosis**

**Subtitle**:
"Real-time telemetry of your proficiency across the 7 core domains of AI Product Leadership."

---

## Section 1: The Radar Chart (Visual Header)

### Component: Interactive Radar Chart

**Visualization**: 7-axis radar chart with 0-100 scale on each axis

**The 7 Domains** (clockwise from top):
1. Systematic Prompting (The Engine)
2. Sovereign Governance (The Shield)
3. Knowledge Architecture (The Memory)
4. Interface Engineering (The Bridge)
5. Agentic Orchestration (The Logic)
6. Retrieval Optimization (The Optimizer)
7. Production Observability (The Reliability)

**Visual Design**:
- Background grid at 20, 40, 60, 80, 100 intervals
- Filled area showing current proficiency
- Color coding based on proficiency level:
  - Junior (0-60): Gray/Light Blue
  - Mid (61-80): Blue
  - Lead (81-95): Green
  - Architect (96-100): Gold

**Interactivity**:
- Hover over each axis to see exact score
- Click axis to scroll to detailed domain breakdown

**Example Data Display**:
```
Systematic Prompting: 92/100 (Lead)
Sovereign Governance: 88/100 (Lead)
Knowledge Architecture: 85/100 (Lead)
Interface Engineering: 94/100 (Architect)
Agentic Orchestration: 82/100 (Lead)
Retrieval Optimization: 89/100 (Lead)
Production Observability: 93/100 (Lead)

Overall Proficiency: 87/100 (Distinguished)
```

---

## Section 2: Domain Breakdowns (The Data)

### Layout: Expandable Cards (Accordion Style)

Each domain card shows:
- Domain name and icon
- Current score (0-100) with proficiency level
- Progress bar visualization
- "View Details" expansion

### Domain 1: Systematic Prompting
**Icon**: ⚙️ The Engine

**Card Header**:
```
Systematic Prompting (The Engine)          92/100 Lead
████████████░
```

**Competency**: Engineering deterministic logic and reducing model variance.

**Telemetry Sources**:
- Week 1 Lab: Adversarial Prompts (25 pts)
- Week 1 Project: Production Chat Assistant (25 pts)
- Week 4 Lab: Ticket Router (15 pts)
- Week 4 Project: Enterprise Support Orchestrator (15 pts)
- Week 5 Lab: Multi-Agent Workflows (10 pts)
- Week 5 Project: Full-Stack Dev Team (10 pts)

**Key Metric**: Success rate in zero-shot vs. few-shot consistency tests

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W1 Lab: Adversarial Prompts | 95% | 23.75 | 25 |
| W1 Project: Chat Assistant | 88% | 22.00 | 25 |
| W4 Lab: Ticket Router | 92% | 13.80 | 15 |
| W4 Project: Support Orchestrator | 96% | 14.40 | 15 |
| W5 Lab: Multi-Agent Workflows | 90% | 9.00 | 10 |
| W5 Project: Dev Team | 85% | 8.50 | 10 |
| **TOTAL** | **92%** | **91.45** | **100** |

**Evidence**:
- CoT implementation reducing variance by 45%
- Few-shot learning achieving 94% intent classification
- Decision journal documenting all routing logic

---

### Domain 2: Sovereign Governance
**Icon**: 🛡️ The Shield

**Card Header**:
```
Sovereign Governance (The Shield)          88/100 Lead
████████████░
```

**Competency**: Implementing data sovereignty and adversarial defense.

**Telemetry Sources**:
- Week 2 Lab: PII Redaction (35 pts)
- Week 2 Project: Safety Proxy (35 pts)
- Week 6 Project: HIPAA-Grade RAG (10 pts)
- Week 7 Lab: Audit Trails (15 pts)
- Week 7 Project: Red Team Testing (15 pts)

**Key Metric**: Red-team resilience score & compliance audit pass rate

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W2 Lab: PII Redaction | 92% | 32.20 | 35 |
| W2 Project: Safety Proxy | 90% | 31.50 | 35 |
| W6 Project: HIPAA RAG | 85% | 8.50 | 10 |
| W7 Lab: Audit Trails | 88% | 13.20 | 15 |
| W7 Project: Red Team Testing | 84% | 12.60 | 15 |
| **TOTAL** | **88%** | **98.00** | **110** |

**Evidence**:
- Zero PII leakage across 10,000 query load test
- 97% attack detection rate in red team simulation
- Automated GDPR/HIPAA compliance patterns

---

### Domain 3: Knowledge Architecture
**Icon**: 🧠 The Memory

**Card Header**:
```
Knowledge Architecture (The Memory)        85/100 Lead
███████████░░
```

**Competency**: Designing scalable semantic search and ingestion pipelines.

**Telemetry Sources**:
- Week 3 Lab: Document Q&A (40 pts)
- Week 3 Project: Multi-Doc RAG (40 pts)
- Week 6 Lab: Chunking Strategy (20 pts)
- Week 6 Project: Clinical RAG (20 pts)

**Key Metric**: Retrieval hit rate and source attribution accuracy

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W3 Lab: Document Q&A | 88% | 35.20 | 40 |
| W3 Project: Multi-Doc RAG | 83% | 33.20 | 40 |
| W6 Lab: Chunking Strategy | 85% | 17.00 | 20 |
| W6 Project: Clinical RAG | 84% | 16.80 | 20 |
| **TOTAL** | **85%** | **102.20** | **120** |

**Evidence**:
- RAGAS faithfulness improved from 0.72 to 1.0
- Implemented optimal chunking strategy (500 tokens, 50 overlap)
- Metadata filtering reducing retrieval latency by 40%

---

### Domain 4: Interface Engineering
**Icon**: 🔌 The Bridge

**Card Header**:
```
Interface Engineering (The Bridge)         94/100 Architect
████████████▓
```

**Competency**: Type-safe system communication and self-healing JSON.

**Telemetry Sources**:
- Week 4 Lab: Ticket Extraction (45 pts)
- Week 4 Project: Tool Chaining (45 pts)
- Week 1 Lab: API Integration (10 pts)
- Week 1 Project: Chat Assistant (10 pts)

**Key Metric**: JSON schema validation success & recovery from malformed outputs

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W4 Lab: Ticket Extraction | 95% | 42.75 | 45 |
| W4 Project: Tool Chaining | 97% | 43.65 | 45 |
| W1 Lab: API Integration | 90% | 9.00 | 10 |
| W1 Project: Chat Assistant | 92% | 9.20 | 10 |
| **TOTAL** | **94%** | **104.60** | **110** |

**Evidence**:
- 99.7% function calling success rate
- Self-healing JSON repair in 23 edge cases
- Modular tool definitions supporting 12+ external APIs

---

### Domain 5: Agentic Orchestration
**Icon**: 🤖 The Logic

**Card Header**:
```
Agentic Orchestration (The Logic)          82/100 Lead
██████████░░░
```

**Competency**: Coordinating multi-agent workflows with stateful persistence.

**Telemetry Sources**:
- Week 5 Lab: Supervisor Routing (50 pts)
- Week 5 Project: Collaborative Logic (50 pts)
- Week 8 Capstone: Multi-Agent Platform (15 pts)

**Key Metric**: State recovery success & agent-to-agent communication efficiency

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W5 Lab: Supervisor Routing | 82% | 41.00 | 50 |
| W5 Project: Collaborative Logic | 78% | 39.00 | 50 |
| W8 Capstone: Multi-Agent Platform | 85% | 12.75 | 15 |
| **TOTAL** | **82%** | **92.75** | **115** |

**Evidence**:
- Multi-agent workflows with zero deadlocks
- LangGraph state recovery from 3 simulated failures
- Memory trimming preventing context bloat in long sessions

---

### Domain 6: Retrieval Optimization
**Icon**: ⚡ The Optimizer

**Card Header**:
```
Retrieval Optimization (The Optimizer)     89/100 Lead
████████████░
```

**Competency**: Maximizing precision and minimizing unit economics.

**Telemetry Sources**:
- Week 6 Lab: Hybrid Search RRF (50 pts)
- Week 6 Project: Cross-Encoders (50 pts)
- Week 3 Lab: Semantic Search (10 pts)
- Week 3 Project: Hybrid Search Basics (10 pts)

**Key Metric**: Reciprocal Rank Fusion (RRF) score & token-cost reduction

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W6 Lab: Hybrid Search RRF | 90% | 45.00 | 50 |
| W6 Project: Cross-Encoders | 94% | 47.00 | 50 |
| W3 Lab: Semantic Search | 85% | 8.50 | 10 |
| W3 Project: Hybrid Basics | 83% | 8.30 | 10 |
| **TOTAL** | **89%** | **108.80** | **120** |

**Evidence**:
- Hybrid search improved precision by 31%
- Model routing reduced costs by 68%
- Context window engineering solving "lost in middle" problem

---

### Domain 7: Production Observability
**Icon**: 📊 The Reliability

**Card Header**:
```
Production Observability (The Reliability)  93/100 Lead
████████████▓
```

**Competency**: Automated QA, regression testing, and distributed tracing.

**Telemetry Sources**:
- Week 7 Lab: Trace Analysis (55 pts)
- Week 7 Project: LLM-as-a-Judge (55 pts)
- Week 8 Capstone: Full Observability Stack (15 pts)

**Key Metric**: Automated Evaluation (Eval) accuracy & latency-to-SLO mapping

**Breakdown**:
| Activity | Score | Points Earned | Max Points |
|----------|-------|---------------|------------|
| W7 Lab: Trace Analysis | 96% | 52.80 | 55 |
| W7 Project: LLM-as-a-Judge | 94% | 51.70 | 55 |
| W8 Capstone: Full Stack | 90% | 13.50 | 15 |
| **TOTAL** | **93%** | **118.00** | **125** |

**Evidence**:
- Full observability stack (traces, evals, economics)
- Regression testing caught 5 breaking changes before production
- LLM-as-Judge achieving 89% agreement with human evaluators

---

## Section 3: The "AI Architect" Certification Status

### Component: Certification Card

**Layout**: Full-width card at bottom of page

**Background**: Gradient based on achievement level
- Junior: Gray gradient
- Mid: Blue gradient
- Lead: Green gradient
- Architect: Gold gradient

**Content**:

```
┌─────────────────────────────────────────────────────────────┐
│  AI ARCHITECT CERTIFICATION STATUS                          │
│                                                              │
│  Current Level: TECHNICAL LEAD                              │
│  Overall Proficiency: 87/100 (Distinguished)                │
│                                                              │
│  Technical Verification Summary:                            │
│  "The candidate has demonstrated a high degree of           │
│  Retrieval Optimization (89th percentile) and Sovereign     │
│  Governance (88th percentile), with proven experience in    │
│  deploying Self-Healing Interfaces. Systems architected by  │
│  this individual prioritize Unit Economics and              │
│  Auditability."                                             │
│                                                              │
│  Evidence Portfolio:                                        │
│  • 3 Production-Grade Repositories (GitHub)                 │
│  • 1.0 RAGAS Faithfulness on 50-query golden dataset       │
│  • 68% Cost Reduction through intelligent model routing    │
│  • 99.7% Function Calling Success Rate                      │
│  • Zero PII Leakage in 10K query load test                 │
│                                                              │
│  [Download Technical Brief PDF]  [Share to LinkedIn]       │
└─────────────────────────────────────────────────────────────┘
```

### Certification Levels

#### Junior Builder (0-60)
- **Status**: Developing
- **Description**: "Understands AI concepts and can implement basic features with guidance."
- **Ready For**: Junior AI Engineer roles

#### Senior Engineer (61-80)
- **Status**: Proficient
- **Description**: "Can independently build production AI features and optimize for specific metrics."
- **Ready For**: Mid-level or Senior AI Engineer roles

#### Technical Lead (81-95)
- **Status**: Distinguished
- **Description**: "Can architect AI systems from scratch, optimize for multiple objectives, and mentor others."
- **Ready For**: Lead Engineer or AI Architect roles

#### AI Architect (96-100)
- **Status**: Exceptional
- **Description**: "Sets standards for the domain, innovates solutions, and leads technical initiatives."
- **Ready For**: Staff/Principal Engineer or Founding AI Architect roles

---

## Implementation Notes

### Scoring Logic

**Labs**: 0-10 point boost per domain (typically 50 points total per lab)
**Projects**: 0-25 point boost per domain (typically 50 points total per project)

**Formula**:
```typescript
interface ActivityScore {
  activityId: string
  scorePercentage: number // 0-100
  maxPoints: number
}

interface DomainScore {
  domainId: string
  totalPoints: number // Calculated
  maxPoints: number // Sum of all activities
  percentage: number // (totalPoints / maxPoints) * 100
  proficiencyLevel: 'junior' | 'mid' | 'lead' | 'architect'
}

function calculateDomainScore(
  userId: string,
  domainId: string,
  activities: ActivityScore[]
): DomainScore {
  let totalPoints = 0
  let maxPoints = 0

  for (const activity of activities) {
    maxPoints += activity.maxPoints
    totalPoints += (activity.scorePercentage / 100) * activity.maxPoints
  }

  const percentage = (totalPoints / maxPoints) * 100

  return {
    domainId,
    totalPoints,
    maxPoints,
    percentage,
    proficiencyLevel: getProficiencyLevel(percentage)
  }
}

function getProficiencyLevel(percentage: number): string {
  if (percentage >= 96) return 'architect'
  if (percentage >= 81) return 'lead'
  if (percentage >= 61) return 'mid'
  return 'junior'
}
```

### The "Lead" Threshold

**Requirement**: To achieve "Technical Lead" status, a student must maintain >80 points across all 7 domains simultaneously.

**Calculation**:
```typescript
function getOverallLevel(domainScores: DomainScore[]): string {
  const averageScore = domainScores.reduce((sum, d) => sum + d.percentage, 0) / 7
  const allAbove80 = domainScores.every(d => d.percentage >= 80)

  if (averageScore >= 96) return 'architect'
  if (averageScore >= 81 && allAbove80) return 'lead'
  if (averageScore >= 61) return 'mid'
  return 'junior'
}
```

---

## Technical Brief PDF Generation

### Trigger: User clicks "Download Technical Brief PDF"

### PDF Structure (6 pages):

1. **Page 1**: Skill Radar Chart with scores
2. **Page 2**: Portfolio links and metrics
3. **Page 3**: Quantitative performance benchmarks
4. **Page 4**: Architectural board review summary
5. **Page 5**: Capstone project highlights
6. **Page 6**: Technical verification and hiring recommendation

### Auto-Generated Text Example:

```
Technical Verification Summary for [Student Name]

Overall Proficiency: 87/100 (Distinguished - Technical Lead Level)

This candidate demonstrates Lead/Architect-level capabilities across
all 7 technical domains of AI Product Leadership. Quantitative evidence
shows production-grade implementations with strong architectural
decision-making:

Strengths:
• Interface Engineering (94/100): 99.7% function calling success rate
  with self-healing JSON repair
• Production Observability (93/100): Full observability stack with
  regression testing catching breaking changes
• Systematic Prompting (92/100): Deterministic design patterns reducing
  model variance by 45%

Evidence:
• 3 Production repositories with >70% test coverage
• RAGAS 1.0 faithfulness on 50-query medical dataset
• 68% cost reduction through intelligent model routing
• Zero PII leakage in production load testing
• 48-hour hardening survival (red team + load test)

Ready For:
✓ AI/ML Engineer (Lead or Senior)
✓ AI Architect
✓ Technical Lead - AI Product
✓ Founding AI Engineer (Startup)

This verification is based on 7 hands-on labs, 7 production projects,
and 1 comprehensive capstone with architectural defense.
```

---

## UI/UX Specifications

### Color Palette

**Domain Colors** (for radar chart):
- Systematic Prompting: Purple (#8B5CF6)
- Sovereign Governance: Emerald (#10B981)
- Knowledge Architecture: Cyan (#06B6D4)
- Interface Engineering: Orange (#F97316)
- Agentic Orchestration: Indigo (#6366F1)
- Retrieval Optimization: Teal (#14B8A6)
- Production Observability: Amber (#F59E0B)

**Proficiency Level Colors**:
- Junior (0-60): Gray (#6B7280)
- Mid (61-80): Blue (#3B82F6)
- Lead (81-95): Green (#10B981)
- Architect (96-100): Gold (#F59E0B)

### Typography

- Page Title: 2.5rem, bold, primary color
- Subtitle: 1.25rem, medium, muted color
- Domain Names: 1.5rem, semibold
- Scores: 2rem, bold, color-coded by level
- Body Text: 1rem, regular

### Responsive Design

**Desktop (>1024px)**:
- Radar chart: 600px × 600px
- Domain cards: 2-column grid
- Certification card: Full width

**Tablet (768px - 1024px)**:
- Radar chart: 500px × 500px
- Domain cards: Single column
- Certification card: Full width

**Mobile (<768px)**:
- Radar chart: 350px × 350px
- Domain cards: Single column, stacked
- Certification card: Full width, condensed

---

## Interactive Features

### Hover States
- Radar chart axes: Show tooltip with exact score and rank
- Domain cards: Highlight and show "View Details" action
- Certification buttons: Scale animation on hover

### Click Actions
- Radar chart axis: Scroll to corresponding domain card
- "View Details": Expand accordion to show breakdown table
- "Download PDF": Generate and download technical brief
- "Share to LinkedIn": Open LinkedIn share dialog with pre-filled text

### Real-Time Updates
- Scores update immediately when lab/project is completed
- Radar chart animates smoothly when data changes
- Progress bars fill with animation
- Proficiency level badge changes color when threshold crossed

---

## Success Metrics

### Student Experience
- Time to understand strengths/weaknesses: <2 minutes
- Clarity of next steps for improvement: High
- Motivation from seeing progress: High

### Hiring Manager Experience
- Time to assess candidate capability: <5 minutes
- Confidence in quantified metrics: High
- Ability to compare candidates: High

---

**This dashboard transforms course completion into quantified architectural competency proof.**

**Status**: Skill Diagnosis UI Specification
**Version**: 1.0
**Last Updated**: February 2025
