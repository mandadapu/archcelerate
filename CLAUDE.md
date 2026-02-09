# AI Architect Accelerator

> **Status**: Phase 1 Complete ✅ | Phase 2 In Progress 🚧
> **Last Updated**: February 2026

## Mission

Transform software engineers into AI product builders through a 12-week accelerator combining theory, hands-on practice, and real-world projects.

---

## ✅ Alignment Verification

### Vision ↔ Implementation

| Vision (VISION.md) | Implementation | Status |
|-------------------|----------------|--------|
| 12-week curriculum | `app/(dashboard)/curriculum/week-{1-12}/` | ✅ 100% |
| 51 MDX content files | `content/week{1-12}/*.mdx` | ✅ 100% |
| 60+ code examples | TypeScript examples throughout | ✅ 100% |
| 4 enhanced weeks | Weeks 1, 2, 3, 8 (4,000+ lines) | ✅ 100% |
| Interview prep | Week 8 (1,500+ lines) | ✅ 100% |
| Progress tracking | Prisma schema + API routes | ✅ Complete |
| AI mentor | `app/(dashboard)/mentor/` | ✅ Complete |
| RAG system | `app/(dashboard)/rag/` + pgvector | ✅ Complete |
| AI agents | `app/(dashboard)/agents/` | ✅ Complete |
| Code review AI | `app/api/code-review/` | ✅ Complete |
| Portfolio builder | `app/(dashboard)/portfolio/` | ✅ Complete |

### Implementation ↔ Testing

| Feature | Unit Tests | E2E Tests | Coverage |
|---------|-----------|-----------|----------|
| Authentication | 📅 Phase 2 | ✅ Complete | Partial |
| Chat/Mentor | ✅ Complete | 📅 Phase 2 | Partial |
| RAG System | 📅 Phase 2 | ✅ Complete | Partial |
| AI Agents | 📅 Phase 2 | ✅ Complete | Partial |

**Target**: >70% coverage by end of Phase 2

### Testing ↔ Documentation

- ✅ `README.md` - Project overview
- ✅ `VISION.md` - Product vision and roadmap
- ✅ `CLAUDE.md` - This file (project guide for AI assistants)
- ✅ `README-DEV.md` - Developer setup guide
- ✅ `QUICK_REFERENCE.md` - Quick commands reference
- ✅ `docs/vision-comparison.md` - Evolution history
- ✅ 51 MDX files - Student curriculum content
- ✅ E2E tests documented with inline comments
- ✅ API routes with JSDoc comments

---

## 🏗️ Tech Stack

**Frontend**:
- Next.js 14.2 (App Router) with TypeScript
- React 18 (Server Components + Server Actions)
- Tailwind CSS 3 + shadcn/ui
- Radix UI primitives

**Backend & Database**:
- Next.js API Routes
- NextAuth.js (GitHub, Google OAuth)
- Prisma ORM + PostgreSQL
- pgvector extension (vector similarity search)
- Redis (caching, rate limiting)

**AI & ML**:
- Anthropic Claude API (Sonnet 4, Haiku 4)
- OpenAI API (text-embedding-3-small)
- Tavily Search API (agent web search)

**Development & Deployment**:
- Docker + Docker Compose (local development)
- Jest (unit tests)
- Playwright (E2E tests)
- ESLint + Prettier
- GitHub Actions (CI/CD)
- Google Cloud Run (production deployment)

---

## 📊 Phase Roadmap

### Phase 1: Core Curriculum ✅ COMPLETE

- ✅ 12-week curriculum structure
- ✅ 51 MDX content files
- ✅ 60+ production-ready code examples
- ✅ 4 enhanced weeks with deep technical content
- ✅ Core features (auth, progress, mentor, RAG, agents)
- ✅ Database schema and seed scripts
- ✅ Docker-based development environment
- ✅ MDX syntax validation

### Phase 2: Interactive Platform 🚧 IN PROGRESS

- [ ] Code playgrounds for hands-on exercises
- [ ] Enhanced analytics dashboard
- [ ] Quiz and assessment system
- [ ] Unit test coverage >70%
- [ ] Complete seed data for all weeks
- [ ] Interactive code editors

### Phase 3-4: Community & Scale 📅 PLANNED

- Community features (forums, showcase)
- Live cohorts and mentorship
- Certification program
- Company partnerships

---

## 🚀 Quick Start

### Docker (Recommended)

```bash
# 1. Clone and install
git clone <repository-url>
cd archcelerate
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Start Docker containers (PostgreSQL + Redis + App)
./dev.sh up

# 4. Run migrations and seed
./dev.sh migrate
./dev.sh seed

# 5. Open application
open http://localhost:3000
```

### Manual Setup

```bash
# Install dependencies
npm install

# Setup database (requires PostgreSQL 15+ and Redis 7+)
npx prisma migrate dev
npx prisma db seed

# Run development server
npm run dev

# Run tests
npm run test:all
```

### Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/archcelerate"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# AI Services
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."

# Optional
TAVILY_API_KEY="tvly-..."  # For agent web search
```

### Docker Commands

```bash
./dev.sh up        # Start all containers
./dev.sh down      # Stop containers
./dev.sh restart   # Restart app container
./dev.sh quick     # Quick rebuild (cached)
./dev.sh rebuild   # Full rebuild (no cache)
./dev.sh migrate   # Run database migrations
./dev.sh seed      # Seed database
./dev.sh logs      # View logs
./dev.sh clean     # Clean up volumes
```

---

## 📁 Structure

```
archcelerate/
├── app/
│   ├── (dashboard)/
│   │   ├── curriculum/week-{1-12}/    # ✅ All 12 weeks
│   │   ├── mentor/                     # AI mentor chat
│   │   ├── agents/                     # AI agents interface
│   │   ├── rag/                        # RAG system demo
│   │   └── portfolio/                  # Portfolio builder
│   └── api/                            # API routes
│       ├── auth/[...nextauth]/         # NextAuth
│       ├── chat/                       # Chat endpoints
│       ├── agents/                     # Agent execution
│       └── rag/                        # RAG queries
├── content/week{1-12}/                 # ✅ 51 MDX files
├── components/                         # React components
├── lib/                                # Core libraries
│   ├── auth.ts                         # NextAuth config
│   ├── db.ts                           # Prisma client
│   ├── rag/                            # RAG system
│   └── agents/                         # AI agents
├── prisma/
│   ├── schema.prisma                   # ✅ Full schema
│   ├── migrations/                     # Database migrations
│   └── seed.ts                         # Seed script
├── e2e/*.spec.ts                       # ✅ E2E tests
├── __tests__/                          # Unit tests
├── scripts/                            # Utility scripts
├── docker-compose.yml                  # Docker services
├── Dockerfile                          # App container
├── README.md                           # ✅ Main documentation
├── VISION.md                           # ✅ Product vision
├── CLAUDE.md                           # ✅ This file
└── QUICK_REFERENCE.md                  # ✅ Quick reference
```

---

## 🎯 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Curriculum completion | 12 weeks | ✅ 12/12 (100%) |
| Content files | 51 files | ✅ 51/51 (100%) |
| Code examples | 50+ | ✅ 60+ (120%) |
| Test coverage | >70% | 🚧 ~40% (Phase 2) |
| Platform features | >70% | ✅ ~85% |

---

## ✅ Core Principles Verified

1. **Learning by Building** ✅ - 60+ runnable TypeScript examples
2. **Production-First** ✅ - Real cost/latency metrics throughout
3. **Progressive Complexity** ✅ - Week 1 fundamentals → Week 12 enterprise
4. **Technical Depth** ✅ - All 7 quality standards met
5. **Practical Over Theoretical** ✅ - Deployment guides, not papers

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Run tests (`npm run test:all`)
4. Submit PR

### Git Workflow

**Current workflow**: Feature branches → `main` via Pull Requests

**Branch Strategy:**
- `main` - Production-ready code (active development)
- `feature/*` or `fix/*` - Feature/fix branches
- `docs/*` - Documentation updates

**Workflow Steps:**

1. **Start from main**: Ensure you're on up-to-date `main` branch
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**: Branch from `main` with descriptive name
   ```bash
   git checkout -b feature/description
   # or
   git checkout -b fix/bug-name
   # or
   git checkout -b docs/update-docs
   ```

3. **Make changes**: Work on the feature branch only
   - Edit files as needed
   - Never commit directly to `main`

4. **Commit changes**: Commit to the feature branch
   ```bash
   git add <files>
   git commit -m "type: descriptive message"
   ```

   **Commit types**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`

5. **Push feature branch**: Push to remote
   ```bash
   git push -u origin feature/description
   ```

6. **Create PR**: Feature branch → `main`
   ```bash
   gh pr create --title "type: description" --body "PR details"
   ```

7. **Merge PR**: After review/approval
   ```bash
   gh pr merge <PR-number> --squash --delete-branch
   ```

8. **Update local main**: Pull merged changes
   ```bash
   git checkout main
   git pull origin main
   ```

**Never:**
- ❌ Commit directly to `main`
- ❌ Merge without a PR
- ❌ Push directly to `main` branch
- ❌ Commit changes without first running and passing `npm run lint`

**Support**: [GitHub Issues](https://github.com/mandadapu/archcelerate/issues)

---

## ✅ Final Check

```
VISION.md → Implementation → Testing → Documentation
    ✅         ✅               🚧           ✅
```

**Status**: **FULLY ALIGNED** - Vision matches implementation, testing in progress, documentation complete.

**Next Review**: End of Phase 2 (Q2 2026)

---

*MIT License | Made with Claude Code*
