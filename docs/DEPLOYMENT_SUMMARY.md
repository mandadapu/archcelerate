# Archcelerate - Google Cloud Deployment Summary

**Deployment Date:** February 3, 2026
**Status:** ✅ Complete
**Production URL:** https://archcelerate.com

---

## 🎯 Overview

Successfully deployed the Archcelerate AI Architect Accelerator platform to Google Cloud Platform using:
- Google Cloud Run (containerized Next.js application)
- Cloud SQL for PostgreSQL (managed database with pgvector)
- Redis on Compute Engine (low-cost caching layer)
- Custom domain with SSL (archcelerate.com)

---

## 🏗️ Infrastructure Created

### 1. Cloud Run Service
**Service Name:** archcelerate
**Region:** us-central1
**Configuration:**
- Memory: 2 GiB
- CPU: 2 vCPU
- Auto-scaling: 0-10 instances
- Port: 3000
- Public URL: https://archcelerate-h5rlhvwxaa-uc.a.run.app
- Custom Domain: https://archcelerate.com

**Container Image:**
`us-central1-docker.pkg.dev/archcelerate/archcelerate-repo/archcelerate:latest`

### 2. Cloud SQL for PostgreSQL
**Instance Name:** archcelerate-db
**Configuration:**
- Version: PostgreSQL 15
- Tier: db-f1-micro (shared-core)
- Region: us-central1
- Public IP: 136.112.155.63
- Database: archcelerate
- Extensions: pgvector (to be enabled manually)

**Connection:**
- Type: Public IP
- Authentication: Password-based
- Password stored in: Secret Manager (`DB_PASSWORD`)

### 3. Redis on Compute Engine
**Instance Name:** archcelerate-redis
**Configuration:**
- Machine Type: e2-micro
- Zone: us-central1-a
- OS: Debian 11
- Memory Limit: 256 MB
- Internal IP: 10.128.0.2
- Port: 6379
- Password-protected: Yes

### 4. Artifact Registry
**Repository:** archcelerate-repo
**Location:** us-central1
**Format:** Docker
**Purpose:** Stores container images for Cloud Run

### 5. Secret Manager
**Secrets Configured:**
- `ANTHROPIC_API_KEY` - Claude API authentication
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_SECRET` - NextAuth.js session encryption
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `DB_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password

### 6. Custom Domain & SSL
**Domain:** archcelerate.com
**Registrar:** GoDaddy
**DNS Configuration:**
```
Type: A     | Host: @  | Value: 216.239.32.21
Type: A     | Host: @  | Value: 216.239.34.21
Type: A     | Host: @  | Value: 216.239.36.21
Type: A     | Host: @  | Value: 216.239.38.21
```

**SSL Certificate:**
- Provider: Google-managed SSL
- Status: Active
- Auto-renewal: Yes

---

## 💰 Cost Breakdown

### Monthly Estimates

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **Cloud Run** | Pay-per-use, free tier | ~$0-5 |
| **Cloud SQL (db-f1-micro)** | Shared-core PostgreSQL | ~$7-10 |
| **Compute Engine (e2-micro)** | Redis VM | ~$5 |
| **Artifact Registry** | Docker image storage | ~$0-1 |
| **Secret Manager** | 8 secrets | ~$0 |
| **Networking** | Egress/ingress | ~$0-2 |
| **SSL Certificate** | Google-managed | Free |
| **DNS** | Via GoDaddy | External |

**Total Estimated Cost:** ~$17-23/month

**Cost Optimization Tips:**
- Cloud Run scales to zero when idle (no cost)
- db-f1-micro is the smallest SQL instance
- e2-micro Redis is cost-effective
- Can stop Redis VM during development to save costs

---

## 🔐 Authentication & OAuth

### Google OAuth Configuration
**Client ID:** 393474029172-i4tf5mtaoelvee67c1g6vu604ubmdbhs.apps.googleusercontent.com
**Client Name:** archcelerate web

**Authorized JavaScript Origins:**
- `https://archcelerate.com`
- `https://www.archcelerate.com`

**Authorized Redirect URIs:**
- `https://archcelerate.com/api/auth/callback/google`
- `https://www.archcelerate.com/api/auth/callback/google`

**Console URL:**
https://console.cloud.google.com/apis/credentials?project=archcelerate

---

## 🔗 Important URLs

### Production
- **Website:** https://archcelerate.com
- **Health Check:** https://archcelerate.com/api/health
- **Fallback URL:** https://archcelerate-h5rlhvwxaa-uc.a.run.app

### Google Cloud Console
- **Project:** https://console.cloud.google.com/home/dashboard?project=archcelerate
- **Cloud Run:** https://console.cloud.google.com/run?project=archcelerate
- **Cloud SQL:** https://console.cloud.google.com/sql/instances?project=archcelerate
- **Compute Engine:** https://console.cloud.google.com/compute/instances?project=archcelerate
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=archcelerate
- **Domain Mappings:** https://console.cloud.google.com/run/domains?project=archcelerate

### Monitoring & Logs
- **Cloud Run Logs:** https://console.cloud.google.com/run/detail/us-central1/archcelerate/logs?project=archcelerate
- **Cloud Run Metrics:** https://console.cloud.google.com/run/detail/us-central1/archcelerate/metrics?project=archcelerate

---

## 📋 Environment Variables

### Production Environment (Cloud Run)

**Required:**
```bash
NODE_ENV=production
NEXTAUTH_URL=https://archcelerate.com
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_MULTIMODAL=false
```

**Secrets (from Secret Manager):**
- `ANTHROPIC_API_KEY`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `REDIS_URL`

**Optional (not configured):**
- `OPENAI_API_KEY` - For GPT features
- `FACEBOOK_CLIENT_ID` - For Facebook OAuth
- `FACEBOOK_CLIENT_SECRET` - For Facebook OAuth
- `TAVILY_API_KEY` - For web search features

---

## 🚀 Deployment Process

### Initial Deployment (Completed)

1. **Provisioned Infrastructure** (~12 minutes)
   ```bash
   ./scripts/provision-gcp-services.sh
   ```
   - Created Cloud SQL PostgreSQL
   - Created Redis on Compute Engine
   - Generated connection strings
   - Stored secrets in Secret Manager

2. **Configured API Secrets** (~2 minutes)
   - Anthropic API key
   - Google OAuth credentials
   - Generated NextAuth secret

3. **Built and Deployed Application** (~6 minutes)
   ```bash
   ./scripts/deploy-gcp.sh
   ```
   - Built Docker container
   - Pushed to Artifact Registry
   - Deployed to Cloud Run
   - Configured environment variables

4. **Configured Custom Domain** (~5 minutes + SSL provisioning)
   - Mapped archcelerate.com to Cloud Run
   - Updated DNS records in GoDaddy
   - Updated OAuth redirect URIs
   - Waiting for SSL certificate provisioning

### Future Deployments

**To deploy updates:**
```bash
# Set environment
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"

# Deploy new version
./scripts/deploy-gcp.sh
```

**To run database migrations:**
```bash
./scripts/run-migrations.sh
```

---

## 🛠️ Manual Setup Required

### 1. Enable pgvector Extension
**Status:** ✅ Complete (v0.8.1)
**Required for:** RAG and vector search features

```bash
# Connect to database
gcloud sql connect archcelerate-db --user=postgres --database=archcelerate --project=archcelerate

# Enable extension
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### 2. Run Database Migrations
**Status:** ✅ Complete (23 tables created)
**Required for:** Database schema creation

**Option A - Via Cloud Console:**
1. Go to Cloud SQL → archcelerate-db → Connect
2. Use Cloud Shell or local connection
3. Run: `npx prisma migrate deploy`

**Option B - Manually fix migration job:**
```bash
# Delete old job
gcloud run jobs delete migrate-db --region=us-central1 --project=archcelerate --quiet

# Create new job with correct Prisma version
gcloud run jobs create migrate-db \
  --image us-central1-docker.pkg.dev/archcelerate/archcelerate-repo/archcelerate \
  --region us-central1 \
  --project archcelerate \
  --memory 1Gi \
  --cpu 1 \
  --command "node_modules/.bin/prisma" \
  --args "migrate,deploy" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --max-retries 0 \
  --task-timeout 10m

# Execute
gcloud run jobs execute migrate-db --region us-central1 --project archcelerate --wait
```

### 3. Seed Database
**Status:** ✅ Complete (All 12 weeks)
**Required for:** Curriculum content and demo data

```bash
# Create seed job
gcloud run jobs create seed-db \
  --image us-central1-docker.pkg.dev/archcelerate/archcelerate-repo/archcelerate \
  --region us-central1 \
  --project archcelerate \
  --memory 1Gi \
  --cpu 1 \
  --command "npx" \
  --args "prisma,db,seed" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --max-retries 0 \
  --task-timeout 10m

# Execute
gcloud run jobs execute seed-db --region us-central1 --project archcelerate --wait
```

---

## 🔍 Monitoring & Maintenance

### Health Checks

**Application Health:**
```bash
curl https://archcelerate.com/api/health
# Expected: {"status":"ok","timestamp":...,"service":"archcelerate"}
```

**Database Connection:**
```bash
gcloud sql instances describe archcelerate-db --project=archcelerate
```

**Redis Status:**
```bash
gcloud compute instances describe archcelerate-redis --zone=us-central1-a --project=archcelerate
```

### View Logs

**Application Logs:**
```bash
# Recent logs
gcloud run services logs read archcelerate --region us-central1 --project archcelerate --limit 50

# Stream logs
gcloud run services logs tail archcelerate --region us-central1 --project archcelerate

# Filter errors
gcloud run services logs read archcelerate --region us-central1 --project archcelerate --log-filter="severity>=ERROR"
```

**Database Logs:**
```bash
gcloud sql operations list --instance=archcelerate-db --project=archcelerate
```

### Metrics & Performance

View in Cloud Console:
- **Cloud Run Metrics:** Request count, latency, CPU/memory usage
- **Cloud SQL Metrics:** Connections, queries, storage
- **Cost Analysis:** Billing reports

### Backup & Recovery

**Database Backups:**
- Automatic daily backups enabled by Cloud SQL
- 7-day retention period
- Point-in-time recovery available

**Container Images:**
- Stored in Artifact Registry
- Tag each deployment for rollback capability

**Rollback Procedure:**
```bash
# List revisions
gcloud run revisions list --service archcelerate --region us-central1 --project archcelerate

# Route traffic to specific revision
gcloud run services update-traffic archcelerate \
  --region us-central1 \
  --project archcelerate \
  --to-revisions REVISION-NAME=100
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Application won't start**
```bash
# Check logs
gcloud run services logs read archcelerate --region us-central1 --project archcelerate --limit 100

# Verify secrets
gcloud secrets list --project=archcelerate

# Check environment variables
gcloud run services describe archcelerate --region us-central1 --project archcelerate --format="value(spec.template.spec.containers[0].env)"
```

**2. Database connection errors**
```bash
# Verify DATABASE_URL
gcloud secrets versions access latest --secret=DATABASE_URL --project=archcelerate

# Check Cloud SQL status
gcloud sql instances describe archcelerate-db --project=archcelerate

# Test connection
gcloud sql connect archcelerate-db --user=postgres --database=archcelerate --project=archcelerate
```

**3. Redis connection issues**
```bash
# Check Redis VM status
gcloud compute instances describe archcelerate-redis --zone=us-central1-a --project=archcelerate

# SSH into Redis VM
gcloud compute ssh archcelerate-redis --zone=us-central1-a --project=archcelerate

# Check Redis service
sudo systemctl status redis-server
```

**4. SSL/Domain issues**
```bash
# Check domain mapping status
gcloud run domain-mappings describe --domain=archcelerate.com --region=us-central1 --project=archcelerate

# Verify DNS
dig archcelerate.com A +short

# Test SSL
curl -I https://archcelerate.com
```

---

## 📝 Next Steps

### Immediate (After SSL Provisioning)
- [ ] Verify https://archcelerate.com is accessible
- [ ] Test Google OAuth login flow
- [ ] Enable pgvector extension in database
- [ ] Run database migrations
- [ ] Test all major features

### Short-term (This Week)
- [ ] Seed database with initial content
- [ ] Set up monitoring alerts
- [ ] Configure backup retention policies
- [ ] Test mobile responsiveness
- [ ] Performance testing

### Medium-term (This Month)
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Implement error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Create runbook for common tasks

### Optional Enhancements
- [ ] Add www subdomain (CNAME to ghs.googlehosted.com)
- [ ] Configure CDN for static assets
- [ ] Set up VPC connector for private networking
- [ ] Implement Cloud Armor for DDoS protection
- [ ] Add OpenAI API for GPT features
- [ ] Configure Facebook OAuth

---

## 📞 Support & Resources

### Documentation
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs/postgres)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Cloud Deployment](https://www.prisma.io/docs/guides/deployment)

### Project Files
- Deployment scripts: `scripts/`
- Deployment documentation: `docs/DEPLOYMENT.md`
- Pre-deployment checklist: `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- Implementation plan: `docs/plans/2025-02-03-google-cloud-run-deployment.md`

### Quick Commands Reference
```bash
# Set project
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"

# Deploy updates
./scripts/deploy-gcp.sh

# Run migrations
./scripts/run-migrations.sh

# View logs
gcloud run services logs tail archcelerate --region us-central1 --project archcelerate

# Check status
curl https://archcelerate.com/api/health
```

---

## ✅ Deployment Checklist

- [x] Cloud SQL PostgreSQL provisioned
- [x] Redis on Compute Engine created
- [x] Secrets configured in Secret Manager
- [x] Docker container built and pushed
- [x] Cloud Run service deployed
- [x] Custom domain mapped
- [x] DNS records configured
- [x] OAuth redirect URIs updated
- [x] SSL certificate provisioning
- [x] NEXTAUTH_URL updated to https://archcelerate.com
- [x] pgvector extension enabled
- [x] Database migrations executed (23 tables created)
- [x] Cloud SQL connection configured for Cloud Run
- [x] Database seeded (all 12 weeks with curriculum data)

---

## 🎉 Success Metrics

**Deployment Duration:** ~30 minutes (excluding SSL provisioning)
**Services Created:** 6 (Cloud Run, Cloud SQL, Compute Engine, Artifact Registry, Secret Manager, Domain Mapping)
**Estimated Monthly Cost:** $17-23
**Availability Target:** 99.9% (Cloud Run SLA)
**Auto-scaling:** 0-10 instances
**Backup Frequency:** Daily (Cloud SQL)

---

**Document Version:** 1.0
**Last Updated:** February 3, 2026
**Maintained By:** Development Team
