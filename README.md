# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** (Docker)
- **Prisma** ORM
- **NextAuth.js** (OAuth2: Google)
- **Claude API** (AI Mentor)
- **Monaco Editor** (Code Labs)
- **E2B** (Code Execution Sandbox)
- **GitHub API** (Code Review)

## Getting Started

### Prerequisites

- Node.js 19+ (recommended: upgrade to Node 20+ for better compatibility)
- Docker Desktop (for PostgreSQL database)
- OAuth credentials from Google, Facebook, and LinkedIn

### Installation

1. **Clone the repository**
   ```bash
   cd aicelerate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   The project uses `.env.local` for Next.js and `.env` for Prisma.

   Update `.env.local` with your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # AI Services
   ANTHROPIC_API_KEY="your-claude-api-key"

   # Code Execution (Optional - for Labs feature)
   E2B_API_KEY="your-e2b-api-key"

   # GitHub Integration (Optional - for Code Review)
   GITHUB_TOKEN="your-github-personal-access-token"
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## API Setup Instructions

### Google OAuth (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### Claude API (Required for AI Mentor)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Copy the API key to `.env.local` as `ANTHROPIC_API_KEY`

### E2B API (Optional - for Code Labs)

1. Go to [E2B](https://e2b.dev/)
2. Create an account
3. Generate an API key
4. Copy the API key to `.env.local` as `E2B_API_KEY`
5. Note: Labs will show a configuration message if E2B is not set up

### GitHub Token (Optional - for Code Review)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token (classic)
3. Select scopes: `repo` (for accessing repositories)
4. Copy the token to `.env.local` as `GITHUB_TOKEN`

## Database Management

- **View database**: `npx prisma studio`
- **Create migration**: `npx prisma migrate dev --name migration_name`
- **Reset database**: `npx prisma migrate reset`

## Project Structure

```
aicelerate/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page with OAuth
│   ├── (dashboard)/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── diagnosis/          # Skill assessment quiz
│   │   ├── learn/              # Learning platform
│   │   │   └── [sprintId]/
│   │   │       ├── [slug]/     # Concept pages (MDX)
│   │   │       └── lab/        # Interactive coding labs
│   │   ├── mentor/             # AI Mentor chat
│   │   ├── code-review/        # GitHub code review
│   │   └── portfolio/          # Project showcase
│   ├── api/
│   │   ├── auth/               # NextAuth.js routes
│   │   ├── diagnosis/          # Quiz analysis
│   │   ├── chat/               # AI Mentor streaming
│   │   ├── code-review/        # GitHub integration
│   │   ├── labs/               # Code execution
│   │   └── learning/           # Progress tracking
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── diagnosis/              # Quiz components
│   ├── learning/               # Concept components
│   ├── labs/                   # Code editor components
│   ├── mentor/                 # Chat components
│   └── portfolio/              # Project cards
├── content/
│   └── sprints/                # MDX learning content
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Prisma client
│   ├── claude.ts               # Claude API client
│   ├── content-loader.ts       # MDX content loader
│   └── sandbox/                # E2B code execution
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── docs/
│   ├── plans/                  # Implementation plans
│   └── TESTING-CHECKLIST.md    # MVP testing guide
└── docker-compose.yml          # PostgreSQL setup
```

## Features Implemented

### Authentication & User Management
- ✅ Google OAuth authentication
- ✅ Protected routes with NextAuth.js
- ✅ Session management and middleware
- ✅ User profile storage with Prisma

### Skill Diagnosis (Sprint 0)
- ✅ 20-question adaptive quiz
- ✅ Multi-dimensional skill assessment
- ✅ AI-powered analysis with Claude
- ✅ Personalized learning path assignment
- ✅ Skill radar visualization

### Learning Platform
- ✅ 7 learning sprints with structured content
- ✅ MDX-based concept pages
- ✅ Progress tracking per sprint/concept
- ✅ Concept completion system
- ✅ Interactive navigation
- ✅ Progress visualization

### AI Mentor
- ✅ Streaming chat interface with Claude
- ✅ Context-aware assistance (current sprint/concept)
- ✅ Conversation history
- ✅ Quick help suggestions
- ✅ Contextual learning support

### Code Review
- ✅ GitHub repository integration
- ✅ Automated code analysis with Claude
- ✅ Categorized feedback (errors/warnings/suggestions/praise)
- ✅ Code quality scoring
- ✅ Revision submission support
- ✅ Daily submission limits

### Interactive Labs
- ✅ Monaco code editor integration
- ✅ E2B sandbox for code execution
- ✅ Test case validation
- ✅ Real-time code execution
- ✅ Lab completion tracking
- ✅ JavaScript and Python support

### Portfolio
- ✅ Project showcase page
- ✅ GitHub and deployment links
- ✅ Project scoring and completion status
- ✅ Progress statistics
- ✅ Tech stack display

### Infrastructure
- ✅ PostgreSQL database with Prisma ORM
- ✅ Responsive UI with Tailwind CSS
- ✅ shadcn/ui component library
- ✅ Docker PostgreSQL setup
- ✅ Performance optimization (caching, compression)
- ✅ Comprehensive error handling

## Testing

A comprehensive testing checklist is available in `docs/TESTING-CHECKLIST.md`.

Key areas to test:
- Authentication flow (sign up, login, logout, session persistence)
- Skill diagnosis quiz (20 questions, results, path assignment)
- Learning platform (sprint navigation, concept completion, progress tracking)
- AI Mentor (conversations, streaming, context awareness)
- Code Review (GitHub integration, feedback, scoring)
- Labs (code editor, execution, test validation)
- Portfolio (project display, stats, completion tracking)

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database GUI
- `npx prisma migrate dev` - Create and apply migration
- `docker-compose up -d` - Start PostgreSQL
- `docker-compose down` - Stop PostgreSQL

## Current Status

**MVP Complete (Weeks 1-8)**

All core features implemented and functional. See `docs/TESTING-CHECKLIST.md` for comprehensive testing guide.

## Known Limitations & TODOs

- **E2B Sandbox**: Currently stub implementation (returns placeholder). Requires proper E2B template configuration and API setup for full code execution.
- **Lab Content**: Example labs included. Full lab content library needs expansion (Sprints 2-7).
- **Sprint Content**: Sprints 2-7 need additional concept pages and exercises.
- **Email Verification**: Optional - not implemented yet.
- **Password Reset**: Optional - not implemented yet.

## Deployment

The application is ready for deployment to Vercel or similar platforms:

1. Set up PostgreSQL database (Neon, Supabase, Railway, etc.)
2. Configure all environment variables in deployment platform
3. Run database migrations: `npx prisma migrate deploy`
4. Deploy Next.js application
5. Update OAuth redirect URLs to production domain

See Vercel deployment docs: https://nextjs.org/docs/deployment

## Troubleshooting

**Port 5432 already in use:**
- PostgreSQL is running on port 5433 instead. The docker-compose.yml is configured for this.

**NextAuth session errors:**
- Make sure NEXTAUTH_SECRET is set in `.env.local`
- Ensure OAuth redirect URLs match exactly in provider dashboards

**Prisma connection errors:**
- Check that Docker PostgreSQL container is running: `docker ps`
- Verify DATABASE_URL in both `.env` and `.env.local`

**Node version warnings:**
- Current setup works with Node 19.8.1
- Recommended: Upgrade to Node 20+ for better compatibility with latest tools

## License

MIT
