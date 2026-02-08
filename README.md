# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks through hands-on project-based learning.

## 🎓 Curriculum Status: ✅ Complete

**All 12 weeks of production-ready curriculum are now available!**

- **51 MDX content files** covering fundamentals to enterprise production
- **60+ code examples** with complete TypeScript implementations
- **Real cost/performance metrics** throughout all lessons
- **4 enhanced weeks** with comprehensive technical depth (4,000+ lines)
- **Hands-on exercises** with runnable code

Start learning today at [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 14.2** (App Router) with TypeScript
- **React 18** with Server Components and Server Actions
- **Tailwind CSS 3** + **shadcn/ui** component library
- **Radix UI** primitives for accessibility
- **next-mdx-remote** for MDX content rendering

### Backend & Database
- **PostgreSQL** with **Prisma ORM**
- **pgvector** extension for vector similarity search
- **NextAuth.js** for authentication (GitHub, Google OAuth)
- **Redis** for caching and rate limiting
- **Next.js API Routes** for backend logic

### AI & ML
- **Claude API** (Anthropic) - Primary LLM (Sonnet 4, Haiku 4)
- **OpenAI API** - Embeddings (text-embedding-3-small)
- **Tavily Search API** - Web search for agents

### Development & Deployment
- **Docker** - Local PostgreSQL and Redis development
- **Docker Compose** - Multi-container orchestration
- **Jest** - Unit testing framework
- **Playwright** - E2E testing
- **ESLint** + **Prettier** - Code quality
- **GitHub Actions** - CI/CD pipeline

## 📚 12-Week Curriculum

### Foundation Phase (Weeks 1-4)

**Week 1: LLM Fundamentals** ⭐ Enhanced
- Understanding tokens, context windows, and pricing
- Working with Claude and GPT APIs
- Architectural ROI and model selection
- Production readiness checklist
- **6 concepts** · **400+ lines** of enhanced content

**Week 2: AI Safety & Governance** ⭐ Enhanced
- Responsible AI frameworks
- Domain-specific compliance (HIPAA, GDPR, SOC 2)
- Architecture certification exam
- Governance foundations
- **5 concepts** · **1,500+ lines** of Director-tier content

**Week 3: RAG & Memory Fundamentals** ⭐ Enhanced
- Vector embeddings and similarity search
- Hybrid search with BM25 + vector
- Production RAG architecture
- Memory systems (episodic, semantic, procedural)
- **5 concepts** · **1,200+ lines** of production patterns

**Week 4: Structured Intelligence**
- Function calling and tool use
- Structured output with Zod
- Schema design best practices
- **3 concepts**

### Advanced Systems Phase (Weeks 5-8)

**Week 5: Agentic Frameworks**
- ReAct architecture and reasoning loops
- Framework selection (LangChain, LlamaIndex, Autogen)
- Reliability patterns and error handling
- **5 concepts**

**Week 6: Advanced RAG**
- Query rewriting and expansion
- Reranking strategies
- Multi-document synthesis
- **8 concepts**

**Week 7: Observability & Production**
- Monitoring and metrics
- Cost optimization
- Production deployment
- **3 concepts**

**Week 8: Portfolio + Launch**
- Interview preparation
- Portfolio building
- Product launch strategies
- **4 concepts** · **1,500+ lines** of career guidance

### Specialization Phase (Weeks 9-10)

**Week 9: Advanced RAG Techniques**
- GraphRAG fundamentals
- Knowledge graph construction
- Context fusion strategies
- **3 concepts**

**Week 10: Fine-tuning + Custom Models**
- Dataset curation pipeline
- LoRA and PEFT techniques
- Model evaluation frameworks
- **3 concepts**

### Enterprise Phase (Weeks 11-12)

**Week 11: Multi-Agent Systems** ⭐ Enhanced
- Agent coordination patterns
- Task delegation and orchestration
- Conflict resolution strategies
- **3 concepts** · **1,800+ lines** of multi-agent code

**Week 12: Enterprise AI Systems** ⭐ Enhanced
- Enterprise RAG with compliance
- Multi-tenant architecture
- Security and compliance implementation
- **3 concepts** · **2,100+ lines** of enterprise patterns

**Total**: **51 MDX files** · **60+ code examples** · **4,000+ lines** of enhanced content

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (required for latest Next.js features)
- **Docker Desktop** (for local PostgreSQL and Redis)
- **Anthropic API Key** (Claude)
- **OpenAI API Key** (embeddings)

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone <repository-url>
cd archcelerate

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start Docker containers (PostgreSQL + Redis + App)
./dev.sh up

# 5. Run database migrations
./dev.sh migrate

# 6. Seed the database
./dev.sh seed

# 7. Open the application
open http://localhost:3000
```

### Manual Setup (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Set up PostgreSQL and Redis locally
# (Install PostgreSQL 15+ and Redis 7+)

# 3. Configure environment variables
cp .env.example .env.local

# Edit .env.local:
DATABASE_URL="postgresql://user:password@localhost:5432/archcelerate"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GITHUB_ID="your-github-oauth-id"
GITHUB_SECRET="your-github-oauth-secret"
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# 4. Run migrations
npx prisma migrate dev

# 5. Seed database
npx prisma db seed

# 6. Start development server
npm run dev
```

### Environment Variables

Required variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/archcelerate"

# Redis (optional for local dev)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI Services
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."

# Optional: Agent Tools
TAVILY_API_KEY="tvly-..."
```

---

## 🐳 Docker Commands

The `dev.sh` script provides convenient Docker commands:

```bash
# Start all containers
./dev.sh up

# Stop all containers
./dev.sh down

# Restart app container
./dev.sh restart

# Quick rebuild (cached)
./dev.sh quick

# Full rebuild (no cache)
./dev.sh rebuild

# Run database migrations
./dev.sh migrate

# Seed database
./dev.sh seed

# View logs
./dev.sh logs

# Clean up (remove volumes)
./dev.sh clean
```

---

## 📁 Project Structure

```
archcelerate/
├── app/                              # Next.js App Router
│   ├── (dashboard)/                  # Dashboard routes
│   │   ├── curriculum/               # 12-week curriculum
│   │   │   └── week-{1-12}/          # Week-specific pages
│   │   │       ├── concepts/[slug]/  # Concept pages
│   │   │       ├── lab/[slug]/       # Lab exercises
│   │   │       └── project/[slug]/   # Week projects
│   │   ├── mentor/                   # AI mentor chat
│   │   ├── agents/                   # AI agents interface
│   │   ├── rag/                      # RAG system demo
│   │   ├── portfolio/                # Portfolio builder
│   │   └── dashboard/                # Main dashboard
│   ├── api/                          # API routes
│   │   ├── auth/[...nextauth]/       # NextAuth.js endpoints
│   │   ├── chat/                     # Chat API
│   │   ├── agents/                   # Agent execution
│   │   ├── rag/                      # RAG queries
│   │   └── progress/                 # Progress tracking
│   └── page.tsx                      # Landing page
│
├── content/                          # MDX curriculum content
│   └── week{1-12}/                   # 51 MDX files
│       ├── *.mdx                     # Concept files
│       └── lab-*.mdx                 # Lab exercises
│
├── components/                       # React components
│   ├── ui/                           # shadcn/ui components
│   ├── dashboard/                    # Dashboard components
│   └── mdx/                          # MDX components
│
├── lib/                              # Core libraries
│   ├── auth.ts                       # NextAuth config
│   ├── db.ts                         # Prisma client
│   ├── mdx.ts                        # MDX loader
│   ├── redis.ts                      # Redis client
│   ├── rag/                          # RAG system
│   ├── agents/                       # AI agents
│   └── utils.ts                      # Utilities
│
├── prisma/                           # Database
│   ├── schema.prisma                 # Schema definition
│   ├── migrations/                   # Migrations
│   └── seed.ts                       # Seed script
│
├── e2e/                              # E2E tests (Playwright)
├── __tests__/                        # Unit tests (Jest)
│
├── docker-compose.yml                # Docker services
├── Dockerfile                        # App container
└── dev.sh                            # Docker convenience script
```

---

## 🗄️ Database Schema

Key tables:

```sql
-- Authentication (NextAuth.js)
User, Account, Session, VerificationToken

-- Curriculum
CurriculumWeek, Concept, Lab, WeekProject

-- User Progress
UserWeekProgress, WeekProjectSubmission

-- AI Features
Conversation, Message
Document, DocumentChunk (with vector embeddings)
AgentExecution, AgentStep
```

See `prisma/schema.prisma` for full schema.

---

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking

# Database
npx prisma studio        # Open Prisma Studio GUI
npx prisma migrate dev   # Create and apply migration
npx prisma db seed       # Seed database
npx prisma generate      # Generate Prisma Client

# Testing
npm test                 # Run unit tests (Jest)
npm run test:watch       # Watch mode
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Playwright UI mode

# Docker
./dev.sh up              # Start all containers
./dev.sh seed            # Seed database in Docker
./dev.sh logs            # View logs
```

---

## 📦 Deployment

### Google Cloud Run (Production)

Deployed via GitHub Actions CI/CD pipeline. See `.github/workflows/deploy-production.yml`.

Secrets are managed via Google Secret Manager.

**Database**: Cloud SQL PostgreSQL
**Redis**: Managed Redis instance

### Docker Production

```bash
# Build image
docker build -t archcelerate .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e NEXTAUTH_SECRET="..." \
  archcelerate
```

---

## 🎯 Features

### For Students

- ✅ **12-week structured curriculum** with 51 MDX lessons
- ✅ **Interactive exercises** with runnable code
- ✅ **Progress tracking** across weeks and projects
- ✅ **AI Mentor** for personalized guidance
- ✅ **RAG-powered Q&A** with curriculum content
- ✅ **Portfolio builder** for showcasing projects
- ✅ **Interview prep** materials and system design frameworks

### For Instructors

- ✅ **MDX-based content** - easy to update and version
- ✅ **Automated seeding** - quick database setup
- ✅ **Progress analytics** - track student engagement
- ✅ **Extensible architecture** - add new weeks/concepts easily

---

## 📊 Content Statistics

- **Weeks**: 12 complete curriculum weeks
- **Concepts**: 51 MDX concept files
- **Labs**: 12 hands-on lab exercises
- **Projects**: 12 week-end projects
- **Code Examples**: 60+ production-ready TypeScript examples
- **Enhanced Content**: 4,000+ lines across 4 enhanced weeks
- **Total Lines**: ~50,000 lines of curriculum content

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/mandadapu/archcelerate/issues)
- **Documentation**: Check `CLAUDE.md` and `VISION.md` for detailed docs
- **Quick Reference**: See `QUICK_REFERENCE.md` for common commands

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

**Built with ❤️ using Next.js, Prisma, and Claude AI**

*Last Updated: February 2026*
