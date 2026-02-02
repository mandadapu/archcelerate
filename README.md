# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks through hands-on project-based learning.

## 🎓 Curriculum Status: ✅ Complete

**All 12 weeks of production-ready curriculum are now available!**

- **38 MDX content files** covering fundamentals to enterprise production
- **60+ code examples** with complete TypeScript implementations
- **Real cost/performance metrics** throughout all lessons
- **4 enhanced weeks** with comprehensive technical depth
- **Hands-on exercises** with runnable code

Start learning today at [http://localhost:3000](http://localhost:3000)

## 12-Week Curriculum

### 📚 Foundation Phase (Weeks 1-4)

**Week 1: LLM Fundamentals** ⭐ Enhanced
- Understanding tokens, context windows, and pricing
- Working with Claude and GPT APIs
- Cost calculation and model selection
- **3 Hands-on Exercises**: Token counting, cost estimation, model comparison

**Week 2: Advanced Chat Applications**
- Production chat architecture
- Conversation management and state
- System prompts and few-shot learning

**Week 3: RAG Systems**
- Vector embeddings and similarity search
- Document chunking strategies
- RAG pipeline implementation
- Memory systems (episodic, semantic, procedural)

**Week 4: Code Review AI**
- LLM-powered code analysis
- Multi-file context management
- Automated review workflows
- CI/CD integration

### 🚀 Advanced Systems Phase (Weeks 5-8)

**Week 5: AI Agents**
- ReAct architecture and reasoning loops
- Tool use and function calling
- Agent debugging and observability
- Building custom tools

**Week 6: Production Monitoring**
- Observability for AI systems
- Performance optimization
- Cost tracking and alerts
- Production deployment strategies

**Week 7: Architecture Design** ⭐ Enhanced
- AI application patterns (chatbot, RAG, agents)
- Component architecture with real metrics
- Scaling strategies (caching, load balancing, auto-scaling)
- **600+ lines** of production architecture patterns

**Week 8: Product Launch**
- Portfolio building and presentation
- Product Hunt and launch strategies
- Marketing fundamentals
- Getting first 100 users

### 🎯 Specialization Phase (Weeks 9-10)

**Week 9: Advanced RAG**
- Hybrid search (dense + sparse)
- Query optimization and rewriting
- Reranking strategies
- Cross-encoder models

**Week 10: Fine-tuning**
- When to fine-tune vs prompt engineering
- Dataset preparation and curation
- Model evaluation frameworks
- Cost/benefit analysis

### 🏢 Enterprise Phase (Weeks 11-12)

**Week 11: Multi-Agent Systems** ⭐ Enhanced
- Agent coordination patterns (sequential, parallel, hierarchical)
- Task delegation and orchestration
- Conflict resolution strategies
- **1,800+ lines** of production multi-agent code

**Week 12: Enterprise Production** ⭐ Enhanced
- Multi-tenant architecture patterns
- GDPR/SOC 2 compliance implementation
- Disaster recovery and high availability
- **2,100+ lines** of enterprise patterns

**Total Content**: 38 MDX files · 60+ code examples · 4,000+ lines of enhanced content

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **React 18** with Server Components
- **Tailwind CSS** + **shadcn/ui** component library
- **Radix UI** primitives for accessibility
- **Storybook** for component documentation
- **React Testing Library** for component tests

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **pgvector** for vector similarity search
- **Prisma** ORM (optional, Supabase client preferred)
- **Redis** (Upstash) for caching and rate limiting
- **Next.js API Routes** for backend logic

### AI & ML
- **Claude API** (Anthropic) - Primary LLM
- **OpenAI API** - Embeddings (text-embedding-ada-002)
- **Vercel AI SDK** - Streaming chat interfaces
- **Tavily Search API** - Web search for agents
- **ReAct Architecture** - Agent reasoning loop

### Testing & Quality
- **Jest** - Unit testing framework
- **Playwright** - E2E testing
- **MSW** (Mock Service Worker) - API mocking
- **Lighthouse CI** - Performance budgets
- **Codecov** - Coverage reporting

### Monitoring & Observability
- **Vercel Analytics** - Web Vitals and performance
- **Sentry** - Error tracking and session replay
- **Pino** - Structured logging
- **Custom Metrics** - Performance tracking with Redis

### Deployment
- **Vercel** - Hosting and serverless functions
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Local PostgreSQL development

## Getting Started

### Prerequisites

- **Node.js 20+** (required for latest Next.js features)
- **Docker Desktop** (for local PostgreSQL)
- **Supabase Account** (free tier available)
- **Anthropic API Key** (Claude)
- **OpenAI API Key** (embeddings)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aicelerate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase locally (optional)**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase
   supabase start
   ```

4. **Configure environment variables**

   Copy `.env.example` to `.env.local` and update:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Services
   ANTHROPIC_API_KEY=your_claude_api_key
   OPENAI_API_KEY=your_openai_api_key

   # Redis (Upstash)
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token

   # Optional: Agent Tools
   TAVILY_API_KEY=your_tavily_api_key
   GITHUB_TOKEN=your_github_token

   # Monitoring (Production)
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
   ```

5. **Run database migrations**
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually apply migrations from supabase/migrations/
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Playwright UI mode

# Database
supabase start           # Start local Supabase
supabase stop            # Stop local Supabase
supabase db push         # Apply migrations
supabase db reset        # Reset database

# Storybook
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build static Storybook

# Bundle Analysis
ANALYZE=true npm run build  # Analyze bundle size
```

## Project Structure

```
aicelerate/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── dashboard/                # Main dashboard
│   │   ├── agents/               # AI Agents interface
│   │   ├── documents/            # Document management
│   │   ├── conversations/        # Chat conversations
│   │   └── playground/           # Component playground
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # Chat API
│   │   ├── documents/            # Document upload/processing
│   │   ├── agents/               # Agent execution
│   │   ├── analytics/            # Analytics endpoints
│   │   └── logs/                 # Logging endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── data-table.tsx
│   │   └── ...
│   ├── dashboard/                # Dashboard components
│   │   ├── agent-execution-trace.tsx
│   │   └── agent-metrics.tsx
│   ├── monitoring/               # Monitoring components
│   │   └── web-vitals-reporter.tsx
│   ├── lazy/                     # Lazy-loaded components
│   └── error-boundary.tsx        # Error boundary
│
├── lib/                          # Core libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── rag/                      # RAG system
│   │   ├── chunking.ts           # Document chunking strategies
│   │   ├── embeddings.ts         # Embedding generation
│   │   ├── search.ts             # Vector search
│   │   ├── citations.ts          # Citation tracking
│   │   └── synthesis.ts          # Multi-document synthesis
│   ├── memory/                   # Memory architecture
│   │   ├── memory-manager.ts     # Memory manager
│   │   └── types.ts
│   ├── agents/                   # AI Agents framework
│   │   ├── agent-executor.ts     # ReAct loop executor
│   │   ├── tools.ts              # Tool registry
│   │   ├── agent-memory.ts       # Agent memory
│   │   └── patterns/             # Agent patterns
│   │       ├── research-agent.ts
│   │       ├── code-review-agent.ts
│   │       ├── data-pipeline-agent.ts
│   │       └── meeting-assistant-agent.ts
│   ├── cache/                    # Caching layer
│   │   ├── redis-cache.ts
│   │   └── query-cache.ts
│   ├── monitoring/               # Monitoring & analytics
│   │   ├── web-vitals.ts
│   │   ├── analytics.ts
│   │   └── performance-metrics.ts
│   ├── logging/                  # Logging infrastructure
│   │   ├── logger.ts             # Pino logger
│   │   ├── error-handler.ts
│   │   └── client-logger.ts
│   ├── design-system/            # Design tokens
│   │   ├── tokens.ts
│   │   └── theme-provider.tsx
│   └── utils.ts                  # Utility functions
│
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
│       ├── 20260202_week1_foundation.sql
│       ├── 20260202_week2_documents.sql
│       ├── 20260202_week3_rag_memory.sql
│       ├── 20260202_week4_advanced_rag.sql
│       ├── 20260204_week5_agents.sql
│       ├── 20260205_week6_agent_memory.sql
│       └── 20260206_week9_indexes.sql
│
├── docs/                         # Documentation
│   ├── plans/                    # Implementation plans
│   │   ├── week1-platform-implementation.md
│   │   ├── week2-platform-implementation.md
│   │   └── ...
│   ├── SPRINT-*-GUIDE.md         # Sprint guides
│   └── TESTING-CHECKLIST.md
│
├── e2e/                          # E2E tests
│   ├── auth.spec.ts
│   ├── document-qa.spec.ts
│   └── agent-execution.spec.ts
│
├── mocks/                        # MSW mocks
│   ├── handlers.ts
│   └── server.ts
│
├── .storybook/                   # Storybook config
├── .github/workflows/            # CI/CD workflows
│   ├── test.yml
│   ├── lighthouse.yml
│   └── bundle-analysis.yml
│
├── tailwind.config.ts            # Tailwind configuration
├── jest.config.js                # Jest configuration
├── playwright.config.ts          # Playwright configuration
└── lighthouserc.json             # Lighthouse CI config
```

## Curriculum Content Status

### ✅ Enhanced Weeks (Production-Grade Detail)

**Week 1: LLM Fundamentals**
- 3 guided practical exercises with runnable code
- Token counting with multiple text types
- Cost calculation for real scenarios
- Model comparison across 4 models
- **400+ lines** of enhanced content

**Week 7: Architecture Design**
- Complete architecture patterns with metrics
- 3 patterns: Simple Chatbot, RAG, Agent System
- 4 scaling strategies with cost analysis
- Real performance numbers (latency, cost, cache hit rates)
- **600+ lines** of production patterns

**Week 11: Multi-Agent Systems**
- 3 orchestration patterns (sequential, parallel, hierarchical)
- Intelligent routing and task decomposition
- 4 conflict resolution strategies
- **1,800+ lines** of multi-agent implementations

**Week 12: Enterprise Production**
- Multi-tenant isolation strategies
- GDPR/SOC 2 compliance with code
- Load balancing, auto-scaling, disaster recovery
- **2,100+ lines** of enterprise patterns

### ✅ Complete Weeks (Good Quality, Ready to Use)

**Weeks 2-6, 8-10**: All have 3-4 concept MDX files with:
- Clear explanations and code examples
- Production-ready TypeScript implementations
- Best practices and common pitfalls
- Resource links for deeper learning

**Total Statistics**:
- 38 MDX content files
- 60+ complete code examples
- 4,000+ lines of enhanced content
- All 12 weeks production-ready

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth)
users (id, email, created_at, metadata)

-- Documents
documents (id, user_id, title, content, file_path, created_at, processing_status)
document_chunks (id, document_id, chunk_index, content, embedding, token_count)

-- Conversations
conversations (id, user_id, title, created_at, updated_at)
messages (id, conversation_id, role, content, created_at)

-- Memory Systems
memory_episodic (id, user_id, conversation_id, summary, embedding, importance_score)
memory_semantic (id, user_id, fact, categories, embedding, access_count)
memory_procedural (id, user_id, key, value, created_at)

-- RAG & Citations
rag_queries (id, user_id, query, embedding, created_at)
rag_citations (id, query_id, chunk_id, page_number, relevance_score)

-- AI Agents
agent_definitions (id, name, slug, description, system_prompt, tools, max_iterations)
agent_executions (id, user_id, agent_definition_id, input, output, status, iterations, cost)
agent_steps (id, execution_id, step_number, thought, action, action_input, observation)

-- Agent Memory
agent_short_term_memory (id, execution_id, key, value)
agent_long_term_memory (id, user_id, agent_id, summary, embedding, importance_score)
```

## Curriculum Overview

| Week | Topic | Content Files | Enhancement | Key Features |
|------|-------|---------------|-------------|--------------|
| 1 | LLM Fundamentals | 4 files | ⭐ Enhanced | 3 hands-on exercises, runnable code |
| 2 | Advanced Chat | 3 files | ✅ Complete | Chat architecture, state management |
| 3 | RAG Systems | 3 files | ✅ Complete | Vector search, chunking, memory |
| 4 | Code Review AI | 3 files | ✅ Complete | Automated reviews, CI/CD |
| 5 | AI Agents | 3 files | ✅ Complete | ReAct architecture, tool use |
| 6 | Production Monitoring | 4 files | ✅ Complete | Observability, optimization |
| 7 | Architecture Design | 3 files | ⭐ Enhanced | 600+ lines of production patterns |
| 8 | Product Launch | 3 files | ✅ Complete | Portfolio, marketing, launch |
| 9 | Advanced RAG | 3 files | ✅ Complete | Hybrid search, reranking |
| 10 | Fine-tuning | 3 files | ✅ Complete | Dataset prep, evaluation |
| 11 | Multi-Agent Systems | 3 files | ⭐ Enhanced | 1,800+ lines of coordination code |
| 12 | Enterprise Production | 3 files | ⭐ Enhanced | 2,100+ lines of enterprise patterns |

**Total**: 38 MDX files · 4 enhanced weeks · 4,000+ lines of detailed content

## Testing

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests in UI mode (debug)
npm run test:e2e:ui

# Run specific test file
npm test path/to/test.test.ts
```

### Test Coverage Goals

- **Utilities**: 80%+ coverage
- **Services**: 75%+ coverage
- **Components**: 70%+ coverage
- **API Routes**: 70%+ coverage
- **Overall**: 70%+ coverage

## Performance Budgets

### Lighthouse Scores (Minimum)

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Bundle Sizes

- Client-side bundle: < 200 KB
- Initial CSS: < 50 KB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

## Deployment

### Vercel Deployment

1. **Connect GitHub Repository**
   - Import project in Vercel dashboard
   - Select the repository

2. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set production URLs and API keys

3. **Set Up Database**
   - Use Supabase production project
   - Run migrations: `supabase db push`

4. **Deploy**
   - Vercel auto-deploys on push to main
   - Preview deployments for PRs

### Environment-Specific Configuration

```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Staging
NEXT_PUBLIC_APP_URL=https://staging.yourapp.com

# Production
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Monitoring & Observability

### Web Vitals

- Automatic tracking via Vercel Analytics
- Custom endpoint: `/api/analytics/web-vitals`
- Metrics stored in Redis for aggregation

### Error Tracking

- Sentry integration for production errors
- Session replay on errors
- Error boundaries for graceful degradation

### Logging

- Structured logs with Pino
- Request ID tracing
- Client-side and server-side logging
- Log levels: trace, debug, info, warn, error

### Performance Metrics

- Custom metrics tracked in Redis
- Statistical aggregation (avg, p50, p95, p99)
- Query performance monitoring
- Agent execution tracking

## API Documentation

### Authentication

```typescript
// Client-side
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

// Server-side
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Document Upload

```typescript
POST /api/documents/upload
Content-Type: multipart/form-data

Body: { file: File }

Response: {
  documentId: string
  title: string
  status: 'processing' | 'completed'
}
```

### Chat API

```typescript
POST /api/chat
Content-Type: application/json

Body: {
  conversationId: string
  message: string
  documentIds?: string[]
}

Response: Streaming JSON
```

### Agent Execution

```typescript
POST /api/agents/execute
Content-Type: application/json

Body: {
  agentId: string
  input: string
}

Response: {
  executionId: string
  status: 'running' | 'completed' | 'failed'
  output?: string
  steps: Step[]
}
```

## Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow airbnb-typescript config
- **Prettier**: Auto-format on save
- **Commits**: Conventional commits format

### Pull Request Process

1. Create feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation
5. Submit PR with clear description
6. Address review feedback

## Troubleshooting

### Common Issues

**Supabase Connection Errors**
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop && supabase start
```

**Node Version Issues**
```bash
# Use correct Node version
nvm use 20

# Or install correct version
nvm install 20
```

**Database Migration Errors**
```bash
# Reset local database
supabase db reset

# Or manually apply migration
supabase db push
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules && npm install
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Playwright Testing](https://playwright.dev/)
- [Vercel Deployment](https://vercel.com/docs)

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/yourusername/aicelerate/issues)
- Documentation: [Wiki](https://github.com/yourusername/aicelerate/wiki)
