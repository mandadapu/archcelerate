# Google Cloud Run Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy Archcelerate Next.js application to Google Cloud Run with Supabase and Upstash

**Architecture:** Containerized Next.js app on Cloud Run, external PostgreSQL (Supabase with pgvector), external Redis (Upstash), secrets in Google Secret Manager

**Tech Stack:** Google Cloud Run, Docker, Artifact Registry, Secret Manager, Supabase, Upstash

---

## Prerequisites

Before starting, ensure you have:
- [ ] GCP project created and `gcloud` CLI authenticated
- [ ] Supabase PostgreSQL connection string (with pgvector enabled)
- [ ] Upstash Redis connection string
- [ ] All API keys ready (Anthropic, OpenAI, OAuth credentials)

---

## Task 1: Create Health Check API Route

**Files:**
- Create: `app/api/health/route.ts`

**Step 1: Create health check endpoint**

Create `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'archcelerate',
  })
}
```

**Step 2: Test the health check locally**

Run: `npm run dev`

Open browser to: `http://localhost:3000/api/health`

Expected: JSON response with `{ "status": "ok", "timestamp": ..., "service": "archcelerate" }`

**Step 3: Commit health check**

```bash
git add app/api/health/route.ts
git commit -m "feat: add health check endpoint for Cloud Run"
```

---

## Task 2: Create Deployment Scripts

**Files:**
- Create: `scripts/deploy-gcp.sh`
- Create: `scripts/setup-secrets.sh`
- Create: `.env.production.example`

**Step 1: Create deployment script**

Create `scripts/deploy-gcp.sh`:

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-archcelerate}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/deploy-gcp.sh"
  exit 1
fi

echo -e "${GREEN}🚀 Deploying Archcelerate to Google Cloud Run${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo -e "${YELLOW}Service: $SERVICE_NAME${NC}"
echo ""

# Step 1: Enable required APIs
echo -e "${GREEN}Step 1: Enabling required GCP APIs...${NC}"
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  --project=$PROJECT_ID

# Step 2: Create Artifact Registry repository (if not exists)
echo -e "${GREEN}Step 2: Creating Artifact Registry repository...${NC}"
if ! gcloud artifacts repositories describe ${SERVICE_NAME}-repo --location=$REGION --project=$PROJECT_ID &>/dev/null; then
  gcloud artifacts repositories create ${SERVICE_NAME}-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Archcelerate Docker images" \
    --project=$PROJECT_ID
  echo -e "${GREEN}✓ Repository created${NC}"
else
  echo -e "${YELLOW}✓ Repository already exists${NC}"
fi

# Step 3: Build and push Docker image
echo -e "${GREEN}Step 3: Building and pushing Docker image...${NC}"
gcloud builds submit \
  --tag $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
  --project=$PROJECT_ID \
  --timeout=20m

# Step 4: Get service URL (if exists)
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project=$PROJECT_ID \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
  NEXTAUTH_URL="https://${SERVICE_NAME}-${PROJECT_ID}.run.app"
else
  NEXTAUTH_URL=$SERVICE_URL
fi

# Step 5: Deploy to Cloud Run
echo -e "${GREEN}Step 4: Deploying to Cloud Run...${NC}"

# Check if all required secrets exist
REQUIRED_SECRETS=(
  "ANTHROPIC_API_KEY"
  "OPENAI_API_KEY"
  "NEXTAUTH_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "DATABASE_URL"
  "REDIS_URL"
)

echo -e "${YELLOW}Checking secrets...${NC}"
MISSING_SECRETS=()
for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! gcloud secrets describe $secret --project=$PROJECT_ID &>/dev/null; then
    MISSING_SECRETS+=($secret)
  fi
done

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
  echo -e "${RED}Error: Missing secrets:${NC}"
  for secret in "${MISSING_SECRETS[@]}"; do
    echo -e "${RED}  - $secret${NC}"
  done
  echo ""
  echo -e "${YELLOW}Run ./scripts/setup-secrets.sh first to create secrets${NC}"
  exit 1
fi

# Deploy service
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3000 \
  --project=$PROJECT_ID \
  --set-env-vars "NODE_ENV=production,NEXTAUTH_URL=$NEXTAUTH_URL,NEXT_PUBLIC_ENABLE_AI_AGENTS=true,NEXT_PUBLIC_ENABLE_MULTIMODAL=false" \
  --set-secrets "ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,DATABASE_URL=DATABASE_URL:latest,REDIS_URL=REDIS_URL:latest"

# Get final service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --project=$PROJECT_ID \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Service URL: $SERVICE_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update NEXTAUTH_URL if needed: gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars NEXTAUTH_URL=$SERVICE_URL"
echo -e "2. Update OAuth redirect URIs in Google/Facebook Console"
echo -e "3. Run database migrations (see docs/plans/2025-02-03-google-cloud-run-deployment-design.md)"
echo -e "4. Test the deployment: curl $SERVICE_URL/api/health"
```

**Step 2: Create secrets setup script**

Create `scripts/setup-secrets.sh`:

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/setup-secrets.sh"
  exit 1
fi

echo -e "${GREEN}🔐 Setting up secrets in Google Secret Manager${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo ""

# Function to create or update secret
create_or_update_secret() {
  local secret_name=$1
  local secret_value=$2

  if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}Updating existing secret: $secret_name${NC}"
    echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- --project=$PROJECT_ID
  else
    echo -e "${GREEN}Creating new secret: $secret_name${NC}"
    echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID
  fi
}

# Prompt for secrets
echo -e "${YELLOW}Enter your secrets (press Enter to skip existing):${NC}"
echo ""

read -p "ANTHROPIC_API_KEY: " -s ANTHROPIC_API_KEY
echo ""
if [ ! -z "$ANTHROPIC_API_KEY" ]; then
  create_or_update_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
fi

read -p "OPENAI_API_KEY: " -s OPENAI_API_KEY
echo ""
if [ ! -z "$OPENAI_API_KEY" ]; then
  create_or_update_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
fi

read -p "NEXTAUTH_SECRET (min 32 chars): " -s NEXTAUTH_SECRET
echo ""
if [ ! -z "$NEXTAUTH_SECRET" ]; then
  create_or_update_secret "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET"
fi

read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
  create_or_update_secret "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
fi

read -p "GOOGLE_CLIENT_SECRET: " -s GOOGLE_CLIENT_SECRET
echo ""
if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
  create_or_update_secret "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
fi

read -p "FACEBOOK_CLIENT_ID (optional): " FACEBOOK_CLIENT_ID
if [ ! -z "$FACEBOOK_CLIENT_ID" ]; then
  create_or_update_secret "FACEBOOK_CLIENT_ID" "$FACEBOOK_CLIENT_ID"
fi

read -p "FACEBOOK_CLIENT_SECRET (optional): " -s FACEBOOK_CLIENT_SECRET
echo ""
if [ ! -z "$FACEBOOK_CLIENT_SECRET" ]; then
  create_or_update_secret "FACEBOOK_CLIENT_SECRET" "$FACEBOOK_CLIENT_SECRET"
fi

read -p "TAVILY_API_KEY (optional): " -s TAVILY_API_KEY
echo ""
if [ ! -z "$TAVILY_API_KEY" ]; then
  create_or_update_secret "TAVILY_API_KEY" "$TAVILY_API_KEY"
fi

read -p "DATABASE_URL (Supabase connection string): " DATABASE_URL
if [ ! -z "$DATABASE_URL" ]; then
  create_or_update_secret "DATABASE_URL" "$DATABASE_URL"
fi

read -p "REDIS_URL (Upstash connection string): " REDIS_URL
if [ ! -z "$REDIS_URL" ]; then
  create_or_update_secret "REDIS_URL" "$REDIS_URL"
fi

echo ""
echo -e "${GREEN}Granting Cloud Run access to secrets...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor \
  --condition=None

echo ""
echo -e "${GREEN}✅ Secrets setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next step: Run ./scripts/deploy-gcp.sh to deploy the application${NC}"
```

**Step 3: Create production environment example**

Create `.env.production.example`:

```bash
# Production Environment Variables Example
# Copy this to your Secret Manager (use scripts/setup-secrets.sh)

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1

# Redis (Upstash)
REDIS_URL=rediss://default:password@host:6379

# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...

# Authentication
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=https://your-service.run.app

# Google OAuth
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID=your-app-id
FACEBOOK_CLIENT_SECRET=your-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_MULTIMODAL=false

# Node Environment
NODE_ENV=production
```

**Step 4: Make scripts executable**

Run:
```bash
chmod +x scripts/deploy-gcp.sh scripts/setup-secrets.sh
```

**Step 5: Update .gitignore for production env**

Verify `.env.production` is ignored (should already be covered by `.env*.local` pattern).

Expected: `.env.production` in gitignore patterns

**Step 6: Commit deployment scripts**

```bash
git add scripts/deploy-gcp.sh scripts/setup-secrets.sh .env.production.example
git commit -m "feat: add Google Cloud Run deployment scripts"
```

---

## Task 3: Create Database Migration Job Script

**Files:**
- Create: `scripts/run-migrations.sh`

**Step 1: Create migration script**

Create `scripts/run-migrations.sh`:

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-archcelerate}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/run-migrations.sh"
  exit 1
fi

echo -e "${GREEN}🗄️  Running database migrations${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo ""

# Create or update migration job
echo -e "${GREEN}Creating Cloud Run job for migrations...${NC}"
if gcloud run jobs describe migrate-db --region=$REGION --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}Updating existing job...${NC}"
  gcloud run jobs update migrate-db \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
    --region $REGION \
    --project=$PROJECT_ID \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest"
else
  echo -e "${GREEN}Creating new job...${NC}"
  gcloud run jobs create migrate-db \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
    --region $REGION \
    --project=$PROJECT_ID \
    --command "npx" \
    --args "prisma,migrate,deploy" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
    --max-retries 0 \
    --task-timeout 10m
fi

# Execute migration job
echo -e "${GREEN}Executing migrations...${NC}"
gcloud run jobs execute migrate-db \
  --region $REGION \
  --project=$PROJECT_ID \
  --wait

echo ""
echo -e "${GREEN}✅ Migrations complete!${NC}"
```

**Step 2: Make script executable**

Run: `chmod +x scripts/run-migrations.sh`

**Step 3: Commit migration script**

```bash
git add scripts/run-migrations.sh
git commit -m "feat: add database migration script for Cloud Run"
```

---

## Task 4: Create README for Deployment

**Files:**
- Create: `docs/DEPLOYMENT.md`

**Step 1: Create deployment documentation**

Create `docs/DEPLOYMENT.md`:

```markdown
# Deployment Guide: Google Cloud Run

This guide walks through deploying Archcelerate to Google Cloud Run.

## Prerequisites

1. **Google Cloud Platform**
   - GCP account with billing enabled
   - `gcloud` CLI installed and authenticated
   - Project created

2. **External Services**
   - Supabase PostgreSQL database (with pgvector extension)
   - Upstash Redis instance
   - API keys (Anthropic, OpenAI, OAuth credentials)

3. **Local Setup**
   - Docker installed (optional, for local testing)
   - All environment variables documented

## Quick Start

### 1. Setup Environment Variables

Set your GCP project ID:

\`\`\`bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"  # Optional, defaults to us-central1
export SERVICE_NAME="archcelerate"  # Optional, defaults to archcelerate
\`\`\`

### 2. Configure Secrets

Run the secrets setup script:

\`\`\`bash
./scripts/setup-secrets.sh
\`\`\`

This will prompt you for:
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- NEXTAUTH_SECRET (min 32 characters)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
- FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET (optional)
- TAVILY_API_KEY (optional)
- DATABASE_URL (Supabase)
- REDIS_URL (Upstash)

### 3. Deploy Application

\`\`\`bash
./scripts/deploy-gcp.sh
\`\`\`

This will:
1. Enable required GCP APIs
2. Create Artifact Registry repository
3. Build and push Docker image
4. Deploy to Cloud Run
5. Output service URL

### 4. Run Database Migrations

\`\`\`bash
./scripts/run-migrations.sh
\`\`\`

### 5. Seed Database (Optional)

If you need initial data:

\`\`\`bash
# Create seed job
gcloud run jobs create seed-db \\
  --image $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate \\
  --region $GCP_REGION \\
  --project=$GCP_PROJECT_ID \\
  --command "npx" \\
  --args "prisma,db,seed" \\
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \\
  --max-retries 0 \\
  --task-timeout 10m

# Execute seed
gcloud run jobs execute seed-db --region $GCP_REGION --project=$GCP_PROJECT_ID --wait
\`\`\`

## Post-Deployment Configuration

### Update OAuth Redirect URIs

After deployment, update your OAuth provider settings:

**Google Cloud Console** → APIs & Services → Credentials:
- Authorized redirect URIs: \`https://your-service-url.run.app/api/auth/callback/google\`

**Facebook Developers Console**:
- Valid OAuth Redirect URIs: \`https://your-service-url.run.app/api/auth/callback/facebook\`

### Verify Deployment

\`\`\`bash
# Get service URL
SERVICE_URL=$(gcloud run services describe archcelerate \\
  --region $GCP_REGION \\
  --project=$GCP_PROJECT_ID \\
  --format 'value(status.url)')

# Test health endpoint
curl $SERVICE_URL/api/health

# Expected: {"status":"ok","timestamp":...,"service":"archcelerate"}
\`\`\`

## Updating the Deployment

To deploy updates:

\`\`\`bash
# Option 1: Use deploy script (rebuilds everything)
./scripts/deploy-gcp.sh

# Option 2: Manual rebuild and deploy
gcloud builds submit --tag $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate
gcloud run deploy archcelerate --image $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate --region $GCP_REGION
\`\`\`

After code changes that affect database schema:

\`\`\`bash
./scripts/run-migrations.sh
\`\`\`

## Monitoring

### View Logs

\`\`\`bash
# Recent logs
gcloud run services logs read archcelerate --region $GCP_REGION --limit 50

# Stream logs
gcloud run services logs tail archcelerate --region $GCP_REGION

# Filter errors
gcloud run services logs read archcelerate --region $GCP_REGION --log-filter="severity>=ERROR"
\`\`\`

### Metrics

View in Google Cloud Console:
- Cloud Run → archcelerate → Metrics

Key metrics:
- Request count and latency
- Container CPU/memory utilization
- Error rates
- Cold start frequency

## Troubleshooting

### Container fails to start

Check logs:
\`\`\`bash
gcloud run services logs read archcelerate --region $GCP_REGION --limit 100
\`\`\`

Common issues:
- Missing environment variables
- Incorrect DATABASE_URL or REDIS_URL
- Secrets not accessible

### Database connection errors

Verify:
1. DATABASE_URL secret is correct
2. Supabase connection limit not exceeded
3. pgvector extension is enabled:

\`\`\`sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

### High latency / cold starts

Reduce cold starts by setting minimum instances:

\`\`\`bash
gcloud run services update archcelerate \\
  --region $GCP_REGION \\
  --min-instances 1
\`\`\`

Note: This adds ~$10/month cost but keeps one instance warm.

## Cost Optimization

Current configuration targets ~$0-50/month:

- **Min instances: 0** - Scale to zero during idle
- **Max instances: 10** - Limit concurrent containers
- **Memory: 2Gi** - Sufficient for Next.js + Prisma
- **CPU: 2** - Faster response times

To reduce costs:
- Keep min-instances at 0
- Use Supabase/Upstash free tiers for dev/staging
- Implement aggressive caching
- Monitor and optimize slow queries

## Rollback

To rollback to a previous version:

\`\`\`bash
# List revisions
gcloud run revisions list --service archcelerate --region $GCP_REGION

# Route traffic to specific revision
gcloud run services update-traffic archcelerate \\
  --region $GCP_REGION \\
  --to-revisions REVISION-NAME=100
\`\`\`

## Further Reading

- [Design Document](./plans/2025-02-03-google-cloud-run-deployment-design.md)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
\`\`\`

**Step 2: Commit deployment documentation**

```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: add Google Cloud Run deployment guide"
```

---

## Task 5: Update Main README

**Files:**
- Modify: `README.md`

**Step 1: Add deployment section to README**

Add the following section after the "Quick Start" section in `README.md`:

```markdown
## Deployment

### Google Cloud Run

Deploy to Google Cloud Run with managed PostgreSQL (Supabase) and Redis (Upstash):

\`\`\`bash
# 1. Setup secrets
export GCP_PROJECT_ID="your-project-id"
./scripts/setup-secrets.sh

# 2. Deploy
./scripts/deploy-gcp.sh

# 3. Run migrations
./scripts/run-migrations.sh
\`\`\`

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Local Docker

Test the production build locally:

\`\`\`bash
# Build image
docker build -t archcelerate .

# Run container
docker run -p 3000:3000 \\
  -e DATABASE_URL="postgresql://..." \\
  -e REDIS_URL="redis://..." \\
  -e NEXTAUTH_SECRET="your-secret" \\
  -e NEXTAUTH_URL="http://localhost:3000" \\
  archcelerate
\`\`\`
```

**Step 2: Verify README format**

Run: `cat README.md | head -100`

Expected: Proper markdown formatting with deployment section

**Step 3: Commit README updates**

```bash
git add README.md
git commit -m "docs: add deployment instructions to README"
```

---

## Task 6: Test Local Docker Build (Optional but Recommended)

**Files:**
- No file changes

**Step 1: Build Docker image locally**

Run: `docker build -t archcelerate-test .`

Expected: Build completes successfully (takes 5-10 minutes)

**Step 2: Verify standalone output**

Run: `docker run --rm archcelerate-test ls -la .next/`

Expected: Should see `.next/standalone/` directory structure

**Step 3: Test container startup (dry run)**

Run:
```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://dummy" \
  -e REDIS_URL="redis://dummy" \
  -e NEXTAUTH_SECRET="test-secret-at-least-32-characters-long" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  archcelerate-test &
```

Give it 10 seconds to start, then:
```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","timestamp":...,"service":"archcelerate"}`

Stop container: `docker stop $(docker ps -q --filter ancestor=archcelerate-test)`

**Step 4: Clean up test image**

Run: `docker rmi archcelerate-test`

---

## Task 7: Create Pre-Deployment Checklist

**Files:**
- Create: `docs/PRE_DEPLOYMENT_CHECKLIST.md`

**Step 1: Create checklist document**

Create `docs/PRE_DEPLOYMENT_CHECKLIST.md`:

```markdown
# Pre-Deployment Checklist

Complete this checklist before deploying to Google Cloud Run.

## External Services Setup

### Supabase (PostgreSQL)

- [ ] Supabase project created
- [ ] PostgreSQL database provisioned
- [ ] pgvector extension enabled
  \`\`\`sql
  CREATE EXTENSION IF NOT EXISTS vector;
  \`\`\`
- [ ] Connection string copied (from Settings → Database → Connection string → URI)
- [ ] Connection pooler enabled (recommended for Cloud Run)
- [ ] Database connection limit checked (default: 15 connections on free tier)

### Upstash (Redis)

- [ ] Upstash account created
- [ ] Redis database created (select region close to Cloud Run region)
- [ ] TLS enabled (use \`rediss://\` URL)
- [ ] Connection string copied (from database details page)

## GCP Setup

- [ ] GCP account created with billing enabled
- [ ] \`gcloud\` CLI installed
  \`\`\`bash
  gcloud --version
  \`\`\`
- [ ] Authenticated with GCP
  \`\`\`bash
  gcloud auth login
  gcloud auth application-default login
  \`\`\`
- [ ] Project created or selected
  \`\`\`bash
  gcloud projects create PROJECT_ID  # or
  gcloud config set project PROJECT_ID
  \`\`\`
- [ ] Billing enabled for project

## API Keys & Credentials

### Anthropic (Claude API)

- [ ] Account created at https://console.anthropic.com
- [ ] API key generated (Settings → API Keys)
- [ ] Credits/billing configured

### OpenAI (GPT API)

- [ ] Account created at https://platform.openai.com
- [ ] API key generated (API Keys section)
- [ ] Billing set up

### Google OAuth

- [ ] Google Cloud project OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created (Type: Web application)
- [ ] Authorized JavaScript origins: \`https://your-domain.run.app\`
- [ ] Authorized redirect URIs: \`https://your-domain.run.app/api/auth/callback/google\`
- [ ] Client ID and Client Secret copied

### Facebook OAuth (Optional)

- [ ] Facebook Developer account created
- [ ] App created in Facebook Developer Console
- [ ] Valid OAuth Redirect URIs configured: \`https://your-domain.run.app/api/auth/callback/facebook\`
- [ ] App ID and App Secret copied

### Tavily API (Optional)

- [ ] Account created at https://tavily.com
- [ ] API key generated

## NextAuth Configuration

- [ ] NEXTAUTH_SECRET generated (min 32 characters)
  \`\`\`bash
  openssl rand -base64 32
  \`\`\`

## Environment Variables Collected

Create a secure note or password manager entry with:

\`\`\`
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=... (optional)
FACEBOOK_CLIENT_SECRET=... (optional)
TAVILY_API_KEY=... (optional)
\`\`\`

## Pre-Deployment Tests

- [ ] Application runs locally
  \`\`\`bash
  npm install
  npm run build
  npm start
  \`\`\`
- [ ] Database migrations run successfully
  \`\`\`bash
  npx prisma migrate deploy
  \`\`\`
- [ ] Tests pass
  \`\`\`bash
  npm run test:unit
  \`\`\`
- [ ] Docker build succeeds
  \`\`\`bash
  docker build -t archcelerate-test .
  \`\`\`

## Deployment Scripts Ready

- [ ] \`scripts/setup-secrets.sh\` is executable
- [ ] \`scripts/deploy-gcp.sh\` is executable
- [ ] \`scripts/run-migrations.sh\` is executable
- [ ] GCP_PROJECT_ID environment variable set
  \`\`\`bash
  export GCP_PROJECT_ID="your-project-id"
  \`\`\`

## Ready to Deploy

Once all items are checked:

\`\`\`bash
# 1. Setup secrets in Google Secret Manager
./scripts/setup-secrets.sh

# 2. Deploy to Cloud Run
./scripts/deploy-gcp.sh

# 3. Run database migrations
./scripts/run-migrations.sh

# 4. Verify deployment
curl https://your-service.run.app/api/health
\`\`\`

## Post-Deployment

- [ ] Service URL obtained and documented
- [ ] NEXTAUTH_URL updated (if needed)
- [ ] OAuth redirect URIs updated in Google/Facebook consoles
- [ ] Health check passes
- [ ] Login flow tested
- [ ] AI features tested
- [ ] Monitoring/alerts configured (optional)
\`\`\`

**Step 2: Commit checklist**

```bash
git add docs/PRE_DEPLOYMENT_CHECKLIST.md
git commit -m "docs: add pre-deployment checklist"
```

---

## Task 8: Final Verification & Documentation

**Files:**
- Modify: `docs/plans/2025-02-03-google-cloud-run-deployment-design.md`

**Step 1: Add implementation status to design doc**

Add to the end of `docs/plans/2025-02-03-google-cloud-run-deployment-design.md`:

```markdown
---

## Implementation Status

**Date Implemented**: 2025-02-03

**Artifacts Created**:
- ✅ Health check endpoint: `app/api/health/route.ts`
- ✅ Deployment script: `scripts/deploy-gcp.sh`
- ✅ Secrets setup script: `scripts/setup-secrets.sh`
- ✅ Migration script: `scripts/run-migrations.sh`
- ✅ Production env example: `.env.production.example`
- ✅ Deployment guide: `docs/DEPLOYMENT.md`
- ✅ Pre-deployment checklist: `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- ✅ README updated with deployment instructions

**Verified**:
- ✅ `next.config.js` already has `output: 'standalone'`
- ✅ Dockerfile is production-ready with multi-stage build
- ✅ Scripts are executable and have proper error handling

**Ready for Production**: Yes
```

**Step 2: Commit documentation update**

```bash
git add docs/plans/2025-02-03-google-cloud-run-deployment-design.md
git commit -m "docs: mark deployment implementation as complete"
```

**Step 3: Create summary of all changes**

Run:
```bash
git log --oneline -8
```

Expected: Should see 8 commits related to deployment setup

**Step 4: Verify all deployment files exist**

Run:
```bash
ls -la scripts/*.sh app/api/health/ docs/DEPLOYMENT.md docs/PRE_DEPLOYMENT_CHECKLIST.md .env.production.example
```

Expected: All files exist and scripts are executable

---

## Execution Complete

All deployment artifacts have been created. The application is ready to deploy to Google Cloud Run.

**Summary of Changes**:
1. ✅ Health check API endpoint
2. ✅ Automated deployment scripts
3. ✅ Secrets management setup
4. ✅ Database migration automation
5. ✅ Comprehensive documentation
6. ✅ Pre-deployment checklist

**Next Steps**:
1. Follow `docs/PRE_DEPLOYMENT_CHECKLIST.md` to gather all prerequisites
2. Run `./scripts/setup-secrets.sh` to configure secrets
3. Run `./scripts/deploy-gcp.sh` to deploy
4. Run `./scripts/run-migrations.sh` to initialize database
5. Test and verify deployment

**Cost Estimate**: $0-50/month depending on traffic (can run entirely on free tiers initially)

**Deployment Time**: ~15-20 minutes for first deployment
