# Deployment Guide: Google Cloud Run

This guide walks through deploying Archcelerate to Google Cloud Run.

> **Note**: This guide is for **serverless Cloud Run deployment**. If you're deploying to a VM or server, see [Option 2: Docker Compose Deployment](#option-2-docker-compose-on-vm) below.

## Why External Services for Cloud Run?

Cloud Run is **stateless and ephemeral**:
- Containers can be stopped/started/replaced at any time
- No persistent storage - all data inside the container is lost on restart
- Scales to zero - entire container stops when there's no traffic
- Auto-scales - multiple instances can't share a containerized database

Therefore, for Cloud Run deployment, you **must** use external managed services:
- **Cloud SQL for PostgreSQL** - Managed PostgreSQL with pgvector support
- **Redis on Compute Engine** - Low-cost Redis instance on a small VM

## Deployment Options Comparison

### Option 1: Cloud Run (This Guide) - Serverless ☁️
**Best for**: Low-traffic apps, cost optimization, automatic scaling

**Pros**:
- ✅ Scales to zero (pay only when used)
- ✅ Automatic scaling (0 to 1000+ instances)
- ✅ Minimal DevOps overhead
- ✅ Free tier covers most small apps

**Cons**:
- ⚠️ Requires external services (Supabase + Upstash)
- ⚠️ Cold starts (first request after idle is slower)
- ⚠️ Vendor lock-in to GCP

**Cost**: ~$20-25/month
- Cloud Run: Free tier (2M requests/month)
- Cloud SQL (db-f1-micro): ~$7-10/month
- Redis on GCE (e2-micro): ~$5/month
- VPC Connector: ~$8/month

### Option 2: Docker Compose on VM - Traditional Server 🖥️
**Best for**: Consistent performance, full control, self-hosting

**Pros**:
- ✅ Use docker-compose.yml as-is (no code changes)
- ✅ All services containerized (PostgreSQL + Redis included)
- ✅ No external dependencies
- ✅ Consistent performance (no cold starts)
- ✅ Platform agnostic (works on any VM)

**Cons**:
- ⚠️ Always running (can't scale to zero)
- ⚠️ Manual scaling (need to provision larger VMs)
- ⚠️ More DevOps work (monitoring, backups, updates)

**Cost**: ~$5-20/month
- DigitalOcean Droplet (2GB RAM): $12/month
- AWS Lightsail (2GB RAM): $10/month
- Hetzner Cloud (2GB RAM): $5/month

**Setup**: See [Docker Compose Deployment Guide](#option-2-docker-compose-on-vm) below

### Option 3: Kubernetes (GKE, EKS) - Enterprise 🚀
**Best for**: High-traffic apps, enterprise requirements, complex deployments

**Pros**:
- ✅ Advanced orchestration and scaling
- ✅ Multi-region deployments
- ✅ Advanced networking and security

**Cons**:
- ⚠️ Complex setup and management
- ⚠️ Higher costs (~$70+/month minimum)

---

## Option 1: Cloud Run Deployment (Serverless)

## Prerequisites

1. **Google Cloud Platform**
   - GCP account with billing enabled
   - `gcloud` CLI installed and authenticated
   - Project created

2. **API Keys**
   - Anthropic API key (Claude)
   - OpenAI API key (GPT)
   - OAuth credentials (Google, Facebook optional)

3. **Local Setup**
   - Docker installed (optional, for local testing)

## Quick Start

### 1. Setup Environment Variables

Set your GCP project ID:

```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"  # Optional, defaults to us-central1
export GCP_ZONE="us-central1-a"  # Optional, defaults to us-central1-a
export SERVICE_NAME="archcelerate"  # Optional, defaults to archcelerate
```

### 2. Provision Cloud SQL and Redis

Run the provisioning script to create Cloud SQL PostgreSQL and Redis on Compute Engine:

```bash
./scripts/provision-gcp-services.sh
```

This will (takes ~10-12 minutes):
1. Enable required GCP APIs
2. Create Cloud SQL PostgreSQL instance (db-f1-micro, ~$7-10/month)
3. Enable pgvector extension
4. Create Redis on Compute Engine (e2-micro, ~$5/month)
5. Create VPC connector for Cloud Run (~$8/month)
6. Generate and store DATABASE_URL and REDIS_URL in Secret Manager

### 3. Configure API Secrets

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

**Note**: DATABASE_URL and REDIS_URL are automatically created by step 2.

### 4. Deploy Application

```bash
./scripts/deploy-gcp.sh
```

This will:
1. Enable required GCP APIs
2. Create Artifact Registry repository
3. Build and push Docker image
4. Deploy to Cloud Run
5. Output service URL

### 5. Run Database Migrations

```bash
./scripts/run-migrations.sh
```

### 6. Seed Database (Optional)

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
   ```bash
   gcloud secrets versions access latest --secret=DATABASE_URL --project=$GCP_PROJECT_ID
   ```
2. Cloud SQL instance is running
   ```bash
   gcloud sql instances describe archcelerate-db --project=$GCP_PROJECT_ID
   ```
3. VPC connector is configured properly
   ```bash
   gcloud compute networks vpc-access connectors describe archcelerate-connector --region=$GCP_REGION --project=$GCP_PROJECT_ID
   ```
4. pgvector extension is enabled:
   ```bash
   gcloud sql connect archcelerate-db --user=postgres --database=archcelerate
   # Then run: SELECT * FROM pg_extension WHERE extname = 'vector';
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

Current configuration targets ~$20-25/month:

- **Cloud Run min instances: 0** - Scale to zero during idle
- **Cloud Run max instances: 10** - Limit concurrent containers
- **Cloud Run memory: 2Gi** - Sufficient for Next.js + Prisma
- **Cloud Run CPU: 2** - Faster response times
- **Cloud SQL: db-f1-micro** - Smallest shared-core instance (~$7-10/month)
- **Redis VM: e2-micro** - Smallest always-free tier VM (~$5/month)
- **VPC Connector: 2-3 instances** - Minimum for high availability (~$8/month)

To reduce costs further:
- Keep Cloud Run min-instances at 0 (no idle cost)
- Stop Redis VM during development (gcloud compute instances stop archcelerate-redis)
- Use Cloud SQL backups wisely (7-day retention is default)
- Implement aggressive caching to reduce database queries
- Monitor slow queries and add indexes

**Alternative Low-Cost Setup**: For development/testing, use external free tiers:
- Supabase free tier (500MB PostgreSQL)
- Upstash free tier (10K Redis commands/day)
- Skip VPC connector (access via public endpoints)
- Total: ~$0/month (Cloud Run free tier covers most small apps)

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
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [VPC Access Connectors](https://cloud.google.com/vpc/docs/configure-serverless-vpc-access)
- [Compute Engine Documentation](https://cloud.google.com/compute/docs)

## Alternative: External Managed Services

If you prefer external managed services over Google Cloud native services:

**Supabase (PostgreSQL):**
- Free tier: 500MB database, 2GB bandwidth
- Create project at https://supabase.com
- Enable pgvector extension
- Use connection pooler for Cloud Run
- No VPC connector needed (public endpoint)

**Upstash (Redis):**
- Free tier: 10K commands/day
- Create database at https://upstash.com
- Select region close to Cloud Run
- Use TLS endpoint (rediss://)
- No VPC connector needed (public endpoint)

**Setup for External Services:**
```bash
# Skip provision-gcp-services.sh
# Instead, manually add DATABASE_URL and REDIS_URL during setup-secrets.sh
./scripts/setup-secrets.sh
# Enter your Supabase and Upstash connection strings when prompted

# Deploy without VPC connector (handled automatically by deploy script)
./scripts/deploy-gcp.sh
```

**Cost**: ~$0/month (free tiers) + Cloud Run usage
