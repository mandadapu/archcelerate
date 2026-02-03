# Archcelerate Google Cloud Run Deployment Design

**Date**: February 3, 2025
**Status**: Approved
**Target Platform**: Google Cloud Run
**External Services**: Supabase (PostgreSQL + pgvector), Upstash (Redis)

---

## Overview

Deploy Archcelerate Next.js application to Google Cloud Run as a containerized service with external managed databases. This design prioritizes cost efficiency, auto-scaling, and minimal operational overhead.

## Architecture

### Application Layer
- **Platform**: Google Cloud Run (fully managed)
- **Container**: Docker image with Next.js 14 in standalone mode
- **Scaling**: Auto-scale from 0 to 10 instances based on traffic
- **Resources**: 2GB memory, 2 vCPU, 300s timeout

### Database Layer
- **PostgreSQL**: Supabase (managed PostgreSQL with pgvector extension)
- **Redis**: Upstash (serverless Redis for caching and sessions)
- **Rationale**: External managed services reduce complexity, provide free tiers, and handle backups automatically

### Static Assets & CDN
- **Strategy**: Next.js built-in static optimization + Cloud Run edge network
- **Assets**: Served from `.next/static` with automatic caching headers

### Security & Secrets
- **Secrets Management**: Google Secret Manager for API keys and sensitive config
- **Authentication**: NextAuth.js with OAuth providers (Google, Facebook)
- **Network**: HTTPS only, automatic SSL certificates

---

## Docker Configuration Changes

### 1. Next.js Standalone Output

**File**: `next.config.js`

Add standalone output configuration to reduce Docker image size from ~1GB to ~150MB:

```javascript
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./content/**/*', './prisma/**/*']
    }
  },
  // ... existing config
}
```

**Benefits**:
- Smaller image size = faster deployments
- Only includes necessary dependencies
- Optimized for serverless environments

### 2. Health Check Endpoint

**File**: `app/api/health/route.ts`

Create a lightweight health check endpoint for Cloud Run:

```typescript
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now()
  })
}
```

**Purpose**: Cloud Run uses this to determine container readiness and health.

### 3. Dockerfile Optimization

**Current Dockerfile**: Already well-structured with multi-stage builds

**No changes needed** - The existing Dockerfile is production-ready:
- ✅ Multi-stage build (builder + runner)
- ✅ Alpine Linux for small image size
- ✅ OpenSSL for Prisma compatibility
- ✅ Non-root user (nextjs)
- ✅ Proper layer caching

---

## Deployment Process

### Prerequisites
- GCP project with billing enabled
- `gcloud` CLI installed and authenticated
- Supabase PostgreSQL connection string
- Upstash Redis connection string

### Step 1: Enable GCP Services

```bash
# Set environment variables
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export SERVICE_NAME="archcelerate"

# Enable required APIs
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### Step 2: Create Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create archcelerate-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="Archcelerate Docker images"
```

### Step 3: Store Secrets in Secret Manager

```bash
# Create secrets for sensitive environment variables
echo -n "your-anthropic-api-key" | gcloud secrets create ANTHROPIC_API_KEY --data-file=-
echo -n "your-openai-api-key" | gcloud secrets create OPENAI_API_KEY --data-file=-
echo -n "your-nextauth-secret-32-chars" | gcloud secrets create NEXTAUTH_SECRET --data-file=-
echo -n "your-google-client-id" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
echo -n "your-google-client-secret" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
echo -n "your-facebook-client-id" | gcloud secrets create FACEBOOK_CLIENT_ID --data-file=-
echo -n "your-facebook-client-secret" | gcloud secrets create FACEBOOK_CLIENT_SECRET --data-file=-
echo -n "your-tavily-api-key" | gcloud secrets create TAVILY_API_KEY --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Step 4: Build and Push Docker Image

```bash
# Build using Cloud Build (recommended - faster, no local Docker needed)
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME

# Alternative: Build locally and push
# docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME .
# docker push $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME
```

### Step 5: Deploy to Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3000 \
  --set-env-vars "\
DATABASE_URL=your-supabase-connection-string,\
REDIS_URL=your-upstash-connection-string,\
NODE_ENV=production,\
NEXTAUTH_URL=https://your-service-url.run.app,\
NEXT_PUBLIC_ENABLE_AI_AGENTS=true,\
NEXT_PUBLIC_ENABLE_MULTIMODAL=false" \
  --set-secrets "\
ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,\
OPENAI_API_KEY=OPENAI_API_KEY:latest,\
NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,\
GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,\
GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,\
FACEBOOK_CLIENT_ID=FACEBOOK_CLIENT_ID:latest,\
FACEBOOK_CLIENT_SECRET=FACEBOOK_CLIENT_SECRET:latest,\
TAVILY_API_KEY=TAVILY_API_KEY:latest"
```

**Note**: After deployment, update `NEXTAUTH_URL` with the actual Cloud Run service URL.

### Step 6: Run Database Migrations

```bash
# Option 1: Run locally with production DATABASE_URL
DATABASE_URL="your-supabase-connection-string" npx prisma migrate deploy

# Option 2: Create Cloud Run job (preferred for repeatability)
gcloud run jobs create migrate-db \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME \
  --region $REGION \
  --command "npx" \
  --args "prisma,migrate,deploy" \
  --set-env-vars "DATABASE_URL=your-supabase-connection-string"

# Execute the job
gcloud run jobs execute migrate-db --region $REGION
```

### Step 7: Seed Initial Data (Optional)

```bash
# Run seed script
gcloud run jobs create seed-db \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME \
  --region $REGION \
  --command "npx" \
  --args "prisma,db,seed" \
  --set-env-vars "DATABASE_URL=your-supabase-connection-string"

gcloud run jobs execute seed-db --region $REGION
```

---

## Post-Deployment Configuration

### Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create --service $SERVICE_NAME --domain your-domain.com --region $REGION

# Follow instructions to add DNS records
```

### Update OAuth Redirect URIs

After deployment, update OAuth provider settings:

**Google Cloud Console** → APIs & Services → Credentials:
- Authorized redirect URIs: `https://your-service-url.run.app/api/auth/callback/google`

**Facebook Developers Console**:
- Valid OAuth Redirect URIs: `https://your-service-url.run.app/api/auth/callback/facebook`

### Configure NEXTAUTH_URL

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

# Update environment variable
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --update-env-vars "NEXTAUTH_URL=$SERVICE_URL"
```

---

## Monitoring & Observability

### Built-in Cloud Run Metrics

Access in Google Cloud Console → Cloud Run → [service] → Metrics:
- Request count and rate
- Request latency (p50, p95, p99)
- Container CPU utilization
- Container memory utilization
- Container instance count
- Billable container time

### Logs

```bash
# View recent logs
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50

# Stream logs in real-time
gcloud run services logs tail $SERVICE_NAME --region $REGION

# Filter by severity
gcloud run services logs read $SERVICE_NAME --region $REGION --log-filter="severity>=ERROR"
```

### Alerts (Recommended)

```bash
# Create notification channel (email)
gcloud alpha monitoring channels create \
  --display-name="DevOps Team" \
  --type=email \
  --channel-labels=email_address=devops@yourcompany.com

# Get channel ID
CHANNEL_ID=$(gcloud alpha monitoring channels list --format="value(name)")

# Create alert policy for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=$CHANNEL_ID \
  --display-name="Archcelerate High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"'
```

---

## Cost Estimation

### Monthly Cost Breakdown

| Service | Free Tier | Estimated Cost (Low Traffic) | Estimated Cost (Moderate Traffic) |
|---------|-----------|------------------------------|-----------------------------------|
| Cloud Run | 2M requests, 360K GB-seconds/month | $0 | $10-30 |
| Supabase (PostgreSQL) | 500MB database, 1GB bandwidth | $0 | $25 (Pro plan) |
| Upstash (Redis) | 10K commands/day | $0 | $10 (Pay-as-you-go) |
| Cloud Build | 120 builds/day | $0 | $0 |
| Artifact Registry | 0.5GB storage | ~$0.05/month | ~$0.50/month |
| Secret Manager | 6 secrets, ~10K accesses/month | $0.06/month | $0.06/month |

**Total Estimated Cost**: $0-70/month depending on traffic

**Cost Optimization Tips**:
- Set `--min-instances 0` to scale to zero during idle periods
- Use free tiers of Supabase and Upstash for development/staging
- Implement caching to reduce database queries
- Monitor and set max-instances budget limits

---

## Continuous Deployment (Future Enhancement)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1
  SERVICE_NAME: archcelerate

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Build and Push
        run: |
          gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image $REGION-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/$SERVICE_NAME \
            --region $REGION \
            --platform managed

      - name: Run Migrations
        run: |
          gcloud run jobs execute migrate-db --region $REGION --wait
```

---

## Troubleshooting

### Common Issues

**Issue**: Container fails to start
**Solution**: Check logs for errors, ensure all required environment variables are set

```bash
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100
```

**Issue**: Database connection errors
**Solution**: Verify DATABASE_URL is correct, check Supabase connection limit, ensure pgvector extension is enabled

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

**Issue**: OAuth callback errors
**Solution**: Ensure NEXTAUTH_URL matches the actual Cloud Run service URL and OAuth providers have correct redirect URIs

**Issue**: Cold start latency
**Solution**: Set `--min-instances 1` to keep at least one instance warm (adds ~$10/month cost)

```bash
gcloud run services update $SERVICE_NAME --region $REGION --min-instances 1
```

**Issue**: Out of memory errors
**Solution**: Increase memory allocation or optimize application code

```bash
gcloud run services update $SERVICE_NAME --region $REGION --memory 4Gi
```

---

## Security Considerations

### Applied Security Measures
- ✅ Non-root user in Docker container
- ✅ Secrets stored in Google Secret Manager (not in environment variables)
- ✅ HTTPS enforced automatically by Cloud Run
- ✅ Minimal Docker image (Alpine Linux)
- ✅ No hardcoded credentials in code or config files
- ✅ IAM-based access control for secrets

### Additional Recommendations
- Enable Cloud Armor for DDoS protection if needed
- Implement rate limiting in Next.js middleware
- Set up VPC connector if accessing private GCP resources
- Enable Container Scanning in Artifact Registry
- Use Workload Identity for GitHub Actions (instead of service account keys)

---

## Rollback Strategy

### Quick Rollback

```bash
# List revisions
gcloud run revisions list --service $SERVICE_NAME --region $REGION

# Rollback to previous revision
gcloud run services update-traffic $SERVICE_NAME \
  --region $REGION \
  --to-revisions REVISION-NAME=100
```

### Blue-Green Deployment

```bash
# Deploy new version without traffic
gcloud run deploy $SERVICE_NAME --no-traffic --tag blue

# Test the new version at https://blue---service-name-hash.run.app

# Gradually shift traffic
gcloud run services update-traffic $SERVICE_NAME \
  --to-tags blue=50 \
  --region $REGION

# Full cutover
gcloud run services update-traffic $SERVICE_NAME \
  --to-latest \
  --region $REGION
```

---

## Post-Deployment Checklist

- [ ] Run database migrations (`npx prisma migrate deploy`)
- [ ] Seed initial data if needed (`npx prisma db seed`)
- [ ] Test OAuth login flows (Google, Facebook)
- [ ] Verify AI features work with production API keys
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring alerts for errors and latency
- [ ] Update OAuth provider redirect URIs
- [ ] Test all critical user journeys (signup, login, curriculum access, mentor chat)
- [ ] Verify RAG system works with Supabase pgvector
- [ ] Test Redis caching functionality
- [ ] Set up automated backups (Supabase handles this automatically)
- [ ] Document service URL and share with team

---

## Success Metrics

**Performance Targets:**
- P95 latency < 2 seconds for page loads
- P95 latency < 5 seconds for AI operations
- Uptime > 99.5%
- Cold start < 3 seconds

**Cost Targets:**
- Stay within free tiers for development
- Production cost < $50/month for first 10K users

---

## References

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Google Secret Manager](https://cloud.google.com/secret-manager/docs)

---

**Approved by**: User
**Implementation Status**: Ready to implement
**Next Steps**: Create deployment scripts and execute deployment

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
