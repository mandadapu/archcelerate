# Archcelerate - Quick Reference Card

**Production URL:** https://archcelerate.com
**GCP Project:** archcelerate
**Region:** us-central1

---

## 🚀 Common Commands

### Deploy Updates
```bash
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"
./scripts/deploy-gcp.sh
```

### View Logs
```bash
# Stream logs
gcloud run services logs tail archcelerate --region us-central1 --project archcelerate

# Last 50 lines
gcloud run services logs read archcelerate --region us-central1 --limit 50 --project archcelerate

# Errors only
gcloud run services logs read archcelerate --region us-central1 --log-filter="severity>=ERROR" --project archcelerate
```

### Run Migrations
```bash
./scripts/run-migrations.sh
```

### Health Check
```bash
curl https://archcelerate.com/api/health
```

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| **Production Site** | https://archcelerate.com |
| **Cloud Run Console** | https://console.cloud.google.com/run/detail/us-central1/archcelerate?project=archcelerate |
| **Cloud SQL Console** | https://console.cloud.google.com/sql/instances/archcelerate-db?project=archcelerate |
| **Secret Manager** | https://console.cloud.google.com/security/secret-manager?project=archcelerate |
| **OAuth Credentials** | https://console.cloud.google.com/apis/credentials?project=archcelerate |
| **Domain Mappings** | https://console.cloud.google.com/run/domains?project=archcelerate |

---

## 💰 Infrastructure

| Component | Instance | Cost/Month |
|-----------|----------|------------|
| Cloud Run | archcelerate | ~$0-5 |
| Cloud SQL | archcelerate-db (db-f1-micro) | ~$7-10 |
| Compute Engine | archcelerate-redis (e2-micro) | ~$5 |
| **Total** | | **~$17-23** |

---

## 🔐 Secrets

All secrets stored in Google Secret Manager:

- `ANTHROPIC_API_KEY` - Claude API
- `GOOGLE_CLIENT_ID` - OAuth
- `GOOGLE_CLIENT_SECRET` - OAuth
- `NEXTAUTH_SECRET` - Auth encryption
- `DATABASE_URL` - PostgreSQL
- `REDIS_URL` - Redis cache
- `DB_PASSWORD` - DB password
- `REDIS_PASSWORD` - Redis password

### View Secret
```bash
gcloud secrets versions access latest --secret=SECRET_NAME --project=archcelerate
```

### Update Secret
```bash
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=- --project=archcelerate
```

---

## 🗄️ Database

**Instance:** archcelerate-db
**IP:** 136.112.155.63
**Database:** archcelerate

### Connect to Database
```bash
gcloud sql connect archcelerate-db --user=postgres --database=archcelerate --project=archcelerate
```

### Enable pgvector
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 🔴 Redis

**Instance:** archcelerate-redis
**Internal IP:** 10.128.0.2
**Port:** 6379

### SSH to Redis VM
```bash
gcloud compute ssh archcelerate-redis --zone=us-central1-a --project=archcelerate
```

### Check Redis Status
```bash
# On VM
sudo systemctl status redis-server
sudo systemctl restart redis-server
```

---

## 🌐 Domain & SSL

**Domain:** archcelerate.com
**Registrar:** GoDaddy
**SSL:** Google-managed (auto-renewal)

### DNS Records (GoDaddy)
```
Type: A  | Host: @  | Value: 216.239.32.21
Type: A  | Host: @  | Value: 216.239.34.21
Type: A  | Host: @  | Value: 216.239.36.21
Type: A  | Host: @  | Value: 216.239.38.21
```

### Check DNS
```bash
dig archcelerate.com A +short
```

### Update NEXTAUTH_URL
```bash
gcloud run services update archcelerate \
  --region=us-central1 \
  --project=archcelerate \
  --update-env-vars=NEXTAUTH_URL=https://archcelerate.com
```

---

## 📊 Monitoring

### Service Status
```bash
gcloud run services describe archcelerate --region=us-central1 --project=archcelerate
```

### Recent Deployments
```bash
gcloud run revisions list --service=archcelerate --region=us-central1 --project=archcelerate
```

### Metrics Dashboard
https://console.cloud.google.com/run/detail/us-central1/archcelerate/metrics?project=archcelerate

---

## 🔄 Rollback

### List Revisions
```bash
gcloud run revisions list --service=archcelerate --region=us-central1 --project=archcelerate
```

### Rollback to Revision
```bash
gcloud run services update-traffic archcelerate \
  --region=us-central1 \
  --project=archcelerate \
  --to-revisions REVISION-NAME=100
```

---

## 🆘 Emergency Procedures

### Application Down
1. Check logs: `gcloud run services logs read archcelerate --limit 100`
2. Check status: `gcloud run services describe archcelerate`
3. Restart: Deploy new revision or rollback
4. Check health: `curl https://archcelerate.com/api/health`

### Database Issues
1. Check instance: `gcloud sql instances describe archcelerate-db`
2. View operations: `gcloud sql operations list --instance=archcelerate-db`
3. Connect: `gcloud sql connect archcelerate-db --user=postgres`

### High Costs
1. Check metrics: Cloud Console → Billing
2. Review instances: Ensure min-instances=0 for Cloud Run
3. Stop Redis VM if not needed: `gcloud compute instances stop archcelerate-redis --zone=us-central1-a`

---

## 📞 Support

- **Full Documentation:** `docs/DEPLOYMENT_SUMMARY.md`
- **Deployment Guide:** `docs/DEPLOYMENT.md`
- **Scripts:** `scripts/`
- **GCP Support:** https://console.cloud.google.com/support

---

**Last Updated:** February 3, 2026
