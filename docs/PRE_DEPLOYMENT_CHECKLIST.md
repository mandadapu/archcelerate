# Pre-Deployment Checklist

Complete this checklist before deploying to Google Cloud Run.

## External Services Setup

### Supabase (PostgreSQL)

- [ ] Supabase project created
- [ ] PostgreSQL database provisioned
- [ ] pgvector extension enabled
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- [ ] Connection string copied (from Settings → Database → Connection string → URI)
- [ ] Connection pooler enabled (recommended for Cloud Run)
- [ ] Database connection limit checked (default: 15 connections on free tier)

### Upstash (Redis)

- [ ] Upstash account created
- [ ] Redis database created (select region close to Cloud Run region)
- [ ] TLS enabled (use `rediss://` URL)
- [ ] Connection string copied (from database details page)

## GCP Setup

- [ ] GCP account created with billing enabled
- [ ] `gcloud` CLI installed
  ```bash
  gcloud --version
  ```
- [ ] Authenticated with GCP
  ```bash
  gcloud auth login
  gcloud auth application-default login
  ```
- [ ] Project created or selected
  ```bash
  gcloud projects create PROJECT_ID  # or
  gcloud config set project PROJECT_ID
  ```
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
- [ ] Authorized JavaScript origins: `https://your-domain.run.app`
- [ ] Authorized redirect URIs: `https://your-domain.run.app/api/auth/callback/google`
- [ ] Client ID and Client Secret copied

### Facebook OAuth (Optional)

- [ ] Facebook Developer account created
- [ ] App created in Facebook Developer Console
- [ ] Valid OAuth Redirect URIs configured: `https://your-domain.run.app/api/auth/callback/facebook`
- [ ] App ID and App Secret copied

### Tavily API (Optional)

- [ ] Account created at https://tavily.com
- [ ] API key generated

## NextAuth Configuration

- [ ] NEXTAUTH_SECRET generated (min 32 characters)
  ```bash
  openssl rand -base64 32
  ```

## Environment Variables Collected

Create a secure note or password manager entry with:

```
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
```

## Pre-Deployment Tests

- [ ] Application runs locally
  ```bash
  npm install
  npm run build
  npm start
  ```
- [ ] Database migrations run successfully
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Tests pass
  ```bash
  npm run test:unit
  ```
- [ ] Docker build succeeds
  ```bash
  docker build -t archcelerate-test .
  ```

## Deployment Scripts Ready

- [ ] `scripts/setup-secrets.sh` is executable
- [ ] `scripts/deploy-gcp.sh` is executable
- [ ] `scripts/run-migrations.sh` is executable
- [ ] GCP_PROJECT_ID environment variable set
  ```bash
  export GCP_PROJECT_ID="your-project-id"
  ```

## Ready to Deploy

Once all items are checked:

```bash
# 1. Setup secrets in Google Secret Manager
./scripts/setup-secrets.sh

# 2. Deploy to Cloud Run
./scripts/deploy-gcp.sh

# 3. Run database migrations
./scripts/run-migrations.sh

# 4. Verify deployment
curl https://your-service.run.app/api/health
```

## Post-Deployment

- [ ] Service URL obtained and documented
- [ ] NEXTAUTH_URL updated (if needed)
- [ ] OAuth redirect URIs updated in Google/Facebook consoles
- [ ] Health check passes
- [ ] Login flow tested
- [ ] AI features tested
- [ ] Monitoring/alerts configured (optional)
