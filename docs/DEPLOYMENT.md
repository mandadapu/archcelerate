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

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"  # Optional, defaults to us-central1
export SERVICE_NAME="archcelerate"  # Optional, defaults to archcelerate
```

### 2. Configure Secrets

Run the secrets setup script:

```bash
./scripts/setup-secrets.sh
```

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

```bash
./scripts/deploy-gcp.sh
```

This will:
1. Enable required GCP APIs
2. Create Artifact Registry repository
3. Build and push Docker image
4. Deploy to Cloud Run
5. Output service URL

### 4. Run Database Migrations

```bash
./scripts/run-migrations.sh
```

### 5. Seed Database (Optional)

If you need initial data:

```bash
# Create seed job
gcloud run jobs create seed-db \
  --image $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate \
  --region $GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --command "npx" \
  --args "prisma,db,seed" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --max-retries 0 \
  --task-timeout 10m

# Execute seed
gcloud run jobs execute seed-db --region $GCP_REGION --project=$GCP_PROJECT_ID --wait
```

## Post-Deployment Configuration

### Update OAuth Redirect URIs

After deployment, update your OAuth provider settings:

**Google Cloud Console** → APIs & Services → Credentials:
- Authorized redirect URIs: `https://your-service-url.run.app/api/auth/callback/google`

**Facebook Developers Console**:
- Valid OAuth Redirect URIs: `https://your-service-url.run.app/api/auth/callback/facebook`

### Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe archcelerate \
  --region $GCP_REGION \
  --project=$GCP_PROJECT_ID \
  --format 'value(status.url)')

# Test health endpoint
curl $SERVICE_URL/api/health

# Expected: {"status":"ok","timestamp":...,"service":"archcelerate"}
```

## Updating the Deployment

To deploy updates:

```bash
# Option 1: Use deploy script (rebuilds everything)
./scripts/deploy-gcp.sh

# Option 2: Manual rebuild and deploy
gcloud builds submit --tag $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate
gcloud run deploy archcelerate --image $GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/archcelerate-repo/archcelerate --region $GCP_REGION
```

After code changes that affect database schema:

```bash
./scripts/run-migrations.sh
```

## Monitoring

### View Logs

```bash
# Recent logs
gcloud run services logs read archcelerate --region $GCP_REGION --limit 50

# Stream logs
gcloud run services logs tail archcelerate --region $GCP_REGION

# Filter errors
gcloud run services logs read archcelerate --region $GCP_REGION --log-filter="severity>=ERROR"
```

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
```bash
gcloud run services logs read archcelerate --region $GCP_REGION --limit 100
```

Common issues:
- Missing environment variables
- Incorrect DATABASE_URL or REDIS_URL
- Secrets not accessible

### Database connection errors

Verify:
1. DATABASE_URL secret is correct
2. Supabase connection limit not exceeded
3. pgvector extension is enabled:

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### High latency / cold starts

Reduce cold starts by setting minimum instances:

```bash
gcloud run services update archcelerate \
  --region $GCP_REGION \
  --min-instances 1
```

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

```bash
# List revisions
gcloud run revisions list --service archcelerate --region $GCP_REGION

# Route traffic to specific revision
gcloud run services update-traffic archcelerate \
  --region $GCP_REGION \
  --to-revisions REVISION-NAME=100
```

## Further Reading

- [Design Document](./plans/2025-02-03-google-cloud-run-deployment-design.md)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
