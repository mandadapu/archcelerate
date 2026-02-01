# Platform Week 10: Deployment + DevOps Infrastructure

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build production-grade deployment pipeline with automated CI/CD, infrastructure-as-code, and environment management.

**Architecture:** Vercel for frontend, Railway/Render for backend services, GitHub Actions for CI/CD, Docker for containerization, Terraform for IaC.

**Tech Stack:** Vercel, Railway, Docker, GitHub Actions, Terraform, Doppler (secrets management)

---

## Task 1: Docker Containerization

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Create: `docker/postgres/init.sql`
- Docs: `docs/deployment/docker-setup.md`

**Step 1: Write the Dockerfile for Next.js app**

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .
COPY .env.production .env.production

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: Create docker-compose for local development**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: aicelerate
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: aicelerate_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aicelerate"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://aicelerate:dev_password@postgres:5432/aicelerate_dev
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
```

**Step 3: Create .dockerignore**

Create `.dockerignore`:

```
node_modules
.next
.git
.env.local
.env*.local
dist
coverage
*.log
.DS_Store
.vscode
.idea
README.md
docker-compose.yml
Dockerfile
```

**Step 4: Create postgres initialization script**

Create `docker/postgres/init.sql`:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aicelerate;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aicelerate;
```

**Step 5: Test docker-compose**

Run:
```bash
docker-compose up --build
```

Expected: All services start healthy, app accessible at http://localhost:3000

**Step 6: Document Docker setup**

Create `docs/deployment/docker-setup.md`:

```markdown
# Docker Setup Guide

## Local Development

Start all services:
```bash
docker-compose up
```

Rebuild after changes:
```bash
docker-compose up --build
```

Stop services:
```bash
docker-compose down
```

Clean volumes:
```bash
docker-compose down -v
```

## Production Build

Build production image:
```bash
docker build -t aicelerate:latest .
```

Run production container:
```bash
docker run -p 3000:3000 --env-file .env.production aicelerate:latest
```

## Troubleshooting

Check logs:
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

Access container shell:
```bash
docker-compose exec app sh
docker-compose exec postgres psql -U aicelerate
```
```

**Step 7: Commit Docker setup**

```bash
git add Dockerfile docker-compose.yml .dockerignore docker/ docs/deployment/docker-setup.md
git commit -m "feat: add Docker containerization with postgres and redis"
```

---

## Task 2: GitHub Actions CI/CD Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-production.yml`
- Create: `.github/workflows/deploy-staging.yml`
- Docs: `docs/deployment/ci-cd-pipeline.md`

**Step 1: Write CI workflow for tests and linting**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 3s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
        continue-on-error: true
```

**Step 2: Write production deployment workflow**

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://aicelerate.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.PROD_ANTHROPIC_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://aicelerate.com

      - name: Notify deployment
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Step 3: Write staging deployment workflow**

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.aicelerate.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--env=staging'
```

**Step 4: Test CI workflow locally**

Run:
```bash
# Install act for local GitHub Actions testing
brew install act

# Test CI workflow
act -j test
```

Expected: Workflow runs successfully with all tests passing

**Step 5: Document CI/CD setup**

Create `docs/deployment/ci-cd-pipeline.md`:

```markdown
# CI/CD Pipeline Documentation

## Workflows

### CI (Continuous Integration)
**Trigger:** Push/PR to main or develop
**Steps:**
1. Lint and type-check
2. Unit tests with coverage
3. Integration tests
4. Build verification
5. Lighthouse CI

### Deploy to Staging
**Trigger:** Push to develop
**Steps:**
1. Run tests
2. Build application
3. Deploy to Vercel staging
4. Run smoke tests

### Deploy to Production
**Trigger:** Push to main or manual dispatch
**Steps:**
1. Run full test suite
2. Build with production env
3. Deploy to Vercel production
4. Run smoke tests
5. Notify team

## Required Secrets

Add these to GitHub repository settings:

### Vercel
- `VERCEL_TOKEN`: Personal access token
- `VERCEL_ORG_ID`: Organization ID
- `VERCEL_PROJECT_ID`: Project ID

### Supabase
- `PROD_SUPABASE_URL`: Production URL
- `PROD_SUPABASE_ANON_KEY`: Production anon key
- `STAGING_SUPABASE_URL`: Staging URL
- `STAGING_SUPABASE_ANON_KEY`: Staging anon key

### AI Services
- `PROD_ANTHROPIC_API_KEY`: Claude API key

### Notifications
- `SLACK_WEBHOOK`: Slack webhook for notifications

## Manual Deployment

Trigger manual deployment:
```bash
gh workflow run deploy-production.yml
```

Monitor deployment:
```bash
gh run watch
```
```

**Step 6: Commit CI/CD workflows**

```bash
git add .github/workflows/ docs/deployment/ci-cd-pipeline.md
git commit -m "feat: add GitHub Actions CI/CD pipeline"
```

---

## Task 3: Infrastructure as Code with Terraform

**Files:**
- Create: `infrastructure/terraform/main.tf`
- Create: `infrastructure/terraform/variables.tf`
- Create: `infrastructure/terraform/outputs.tf`
- Create: `infrastructure/terraform/vercel.tf`
- Create: `infrastructure/terraform/supabase.tf`
- Create: `.terraform.lock.hcl` (generated)
- Docs: `docs/deployment/infrastructure.md`

**Step 1: Write main Terraform configuration**

Create `infrastructure/terraform/main.tf`:

```hcl
terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.0"
    }
  }

  backend "s3" {
    bucket         = "aicelerate-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "doppler" {
  doppler_token = var.doppler_token
}
```

**Step 2: Write variables configuration**

Create `infrastructure/terraform/variables.tf`:

```hcl
variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "doppler_token" {
  description = "Doppler service token"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "aicelerate"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "aicelerate.com"
}
```

**Step 3: Write Vercel infrastructure**

Create `infrastructure/terraform/vercel.tf`:

```hcl
resource "vercel_project" "aicelerate" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "yourusername/aicelerate"
  }

  build_command    = "npm run build"
  install_command  = "npm ci"
  output_directory = ".next"

  environment = [
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = doppler_secret.supabase_url.value
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = doppler_secret.supabase_anon_key.value
      target = ["production"]
    },
    {
      key    = "ANTHROPIC_API_KEY"
      value  = doppler_secret.anthropic_api_key.value
      target = ["production"]
    }
  ]
}

resource "vercel_project_domain" "production" {
  project_id = vercel_project.aicelerate.id
  domain     = var.domain_name
}

resource "vercel_project_domain" "www" {
  project_id = vercel_project.aicelerate.id
  domain     = "www.${var.domain_name}"
}
```

**Step 4: Write Doppler secrets integration**

Create `infrastructure/terraform/doppler.tf`:

```hcl
data "doppler_secrets" "production" {
  project = var.project_name
  config  = var.environment
}

resource "doppler_secret" "supabase_url" {
  project = var.project_name
  config  = var.environment
  name    = "NEXT_PUBLIC_SUPABASE_URL"
  value   = data.doppler_secrets.production.map.SUPABASE_URL
}

resource "doppler_secret" "supabase_anon_key" {
  project = var.project_name
  config  = var.environment
  name    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value   = data.doppler_secrets.production.map.SUPABASE_ANON_KEY
}

resource "doppler_secret" "anthropic_api_key" {
  project = var.project_name
  config  = var.environment
  name    = "ANTHROPIC_API_KEY"
  value   = data.doppler_secrets.production.map.ANTHROPIC_API_KEY
}
```

**Step 5: Write outputs configuration**

Create `infrastructure/terraform/outputs.tf`:

```hcl
output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.aicelerate.id
}

output "production_domain" {
  description = "Production domain URL"
  value       = "https://${vercel_project_domain.production.domain}"
}

output "deployment_url" {
  description = "Latest deployment URL"
  value       = vercel_project.aicelerate.deployment_url
}
```

**Step 6: Initialize and test Terraform**

Run:
```bash
cd infrastructure/terraform
terraform init
terraform plan
```

Expected: Plan shows resources to be created with no errors

**Step 7: Document infrastructure setup**

Create `docs/deployment/infrastructure.md`:

```markdown
# Infrastructure Documentation

## Architecture Overview

- **Frontend**: Vercel (Next.js)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Cache**: Upstash Redis
- **Secrets**: Doppler
- **IaC**: Terraform

## Terraform Management

Initialize:
```bash
cd infrastructure/terraform
terraform init
```

Plan changes:
```bash
terraform plan -var-file="production.tfvars"
```

Apply changes:
```bash
terraform apply -var-file="production.tfvars"
```

Destroy (careful!):
```bash
terraform destroy -var-file="production.tfvars"
```

## Environment Variables

Managed via Doppler:

### Production Secrets
- Database credentials
- API keys (Anthropic, OpenAI, Tavily)
- Authentication secrets

### Access Doppler
```bash
doppler login
doppler setup
doppler secrets
```

## Cost Monitoring

### Vercel
- Monitor: https://vercel.com/dashboard/usage
- Limits: Pro plan ($20/month)

### Supabase
- Monitor: https://supabase.com/dashboard/project/_/settings/billing
- Limits: Pro plan ($25/month)

### API Usage
- Anthropic: Track via dashboard
- OpenAI: Track via dashboard
```

**Step 8: Commit infrastructure code**

```bash
git add infrastructure/ docs/deployment/infrastructure.md
git commit -m "feat: add Terraform infrastructure as code"
```

---

## Task 4: Environment Management & Secrets

**Files:**
- Create: `.env.example`
- Create: `.env.local.example`
- Create: `.env.test`
- Modify: `next.config.js` (add runtime env validation)
- Create: `src/lib/env.ts`
- Docs: `docs/deployment/environment-setup.md`

**Step 1: Create environment example files**

Create `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aicelerate
DATABASE_URL_UNPOOLED=postgresql://user:password@localhost:5432/aicelerate

# Redis
REDIS_URL=redis://localhost:6379

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-sentry-token

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_MULTIMODAL=false
```

Create `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=test-secret-key
ANTHROPIC_API_KEY=test-key
```

**Step 2: Create environment validation**

Create `src/lib/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI Services
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  TAVILY_API_KEY: z.string().startsWith('tvly-').optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Monitoring (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_AGENTS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_MULTIMODAL: z.string().transform(val => val === 'true').default('false'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

// Validate on import
export const env = validateEnv()

// Type-safe environment access
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return env[key]
}
```

**Step 3: Update Next.js config for env validation**

Modify `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Validate environment variables at build time
  experimental: {
    instrumentationHook: true,
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENABLE_AI_AGENTS: process.env.NEXT_PUBLIC_ENABLE_AI_AGENTS,
    NEXT_PUBLIC_ENABLE_MULTIMODAL: process.env.NEXT_PUBLIC_ENABLE_MULTIMODAL,
  },

  // Standalone output for Docker
  output: 'standalone',
}

module.exports = nextConfig
```

**Step 4: Create instrumentation for validation**

Create `src/instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment on server startup
    await import('./lib/env')
    console.log('✅ Environment variables validated')
  }
}
```

**Step 5: Test environment validation**

Run:
```bash
# This should fail with missing env vars
npm run build

# Copy example and fill required values
cp .env.example .env.local
# Edit .env.local with real values

# This should succeed
npm run build
```

Expected: Build fails without proper env, succeeds with valid env

**Step 6: Document environment setup**

Create `docs/deployment/environment-setup.md`:

```markdown
# Environment Setup Guide

## Local Development

1. Copy environment template:
```bash
cp .env.example .env.local
```

2. Fill in required values:
- Get Supabase credentials from project dashboard
- Get Anthropic API key from console.anthropic.com
- Generate NEXTAUTH_SECRET: `openssl rand -base64 32`

3. Start development server:
```bash
npm run dev
```

## Environment Tiers

### Development (.env.local)
- Local database and Redis via Docker
- Test API keys (rate-limited)
- Debug logging enabled

### Staging (.env.staging)
- Staging Supabase project
- Shared test API keys
- Info-level logging

### Production (.env.production)
- Production Supabase project
- Production API keys
- Warn-level logging
- Monitoring enabled

## Required Variables

### Always Required
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin key (server-only)
- `ANTHROPIC_API_KEY`: Claude API key
- `NEXTAUTH_SECRET`: 32+ character secret
- `NEXTAUTH_URL`: Application URL

### Optional
- `OPENAI_API_KEY`: For embeddings (can use Supabase)
- `TAVILY_API_KEY`: For web search agent
- `NEXT_PUBLIC_SENTRY_DSN`: Error tracking
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`: Analytics

## Secrets Management

Use Doppler for production secrets:

```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Login and setup
doppler login
doppler setup --project aicelerate --config production

# Fetch secrets
doppler secrets download --format env > .env.production
```

## Validation

Environment variables are validated on startup using Zod schema.

Invalid configuration will fail with error:
```
❌ Invalid environment variables:
{
  "ANTHROPIC_API_KEY": {
    "_errors": ["Required"]
  }
}
```

## Security Notes

- Never commit `.env.local` or `.env.production`
- Rotate secrets every 90 days
- Use service role key only server-side
- Monitor API usage for anomalies
```

**Step 7: Commit environment management**

```bash
git add .env.example .env.test src/lib/env.ts src/instrumentation.ts next.config.js docs/deployment/environment-setup.md
git commit -m "feat: add environment management and validation"
```

---

## Verification Checklist

After completing Platform Week 10:

- [ ] Docker containerization working locally
- [ ] docker-compose starts all services
- [ ] CI workflow passes on GitHub
- [ ] Deployment workflows configured
- [ ] Terraform plan executes successfully
- [ ] Environment validation catches missing vars
- [ ] Documentation covers all deployment steps

## Next Steps

- **Platform Week 11**: Content creation system and module builder
- **Platform Week 12**: Final polish, documentation, and launch preparation
