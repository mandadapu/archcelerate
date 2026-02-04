# Deployment Scripts

Automated deployment scripts for Archcelerate application to Google Cloud Platform.

## Scripts Overview

### 1. `deploy-with-seed.sh` - Complete Automated Deployment

Comprehensive deployment script that handles:
- Building and deploying Docker image to Cloud Run
- Running database migrations
- Seeding all 12 curriculum weeks
- Verifying deployment health
- Generating detailed execution report

**Usage:**
```bash
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"
./scripts/deploy-with-seed.sh
```

**Features:**
- Status tracking for each execution step
- Duration timing for all operations
- Comprehensive report generation
- Report saved to file: `deployment-report-YYYYMMDD-HHMMSS.txt`
- Health check verification
- Database content verification

**Report includes:**
- Execution status for each step (SUCCESS/FAILED/SKIPPED)
- Duration for each operation
- Health check results
- Database verification (12 weeks count)
- Production URLs
- Next steps

### 2. `deploy-gcp.sh` - Basic Cloud Run Deployment

Deploys application to Cloud Run without database operations.

**Usage:**
```bash
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"
./scripts/deploy-gcp.sh
```

### 3. `provision-gcp-services.sh` - Infrastructure Provisioning

Creates GCP infrastructure (Cloud SQL, Redis, VPC).

**Usage:**
```bash
export GCP_PROJECT_ID="archcelerate"
export GCP_REGION="us-central1"
./scripts/provision-gcp-services.sh
```

### 4. `run-migrations.sh` - Database Migrations Only

Runs Prisma database migrations.

**Usage:**
```bash
./scripts/run-migrations.sh
```

## GitHub Actions Workflow

### `deploy-production-with-seed.yml`

Automated CI/CD workflow that runs on:
- Push to `main` branch (auto-deploy)
- Manual workflow dispatch (with options)

**Manual Trigger Options:**
- `skip_build`: Skip Docker build (use existing image)
- `skip_migrations`: Skip database migrations
- `skip_seeding`: Skip database seeding

**Features:**
- Complete deployment automation
- Step-by-step status tracking
- Deployment report generation
- Report uploaded as artifact (30-day retention)
- Health check verification

**Manual Trigger:**
```bash
gh workflow run deploy-production-with-seed.yml
```

**With options:**
```bash
gh workflow run deploy-production-with-seed.yml \
  -f skip_build=true \
  -f skip_migrations=true \
  -f skip_seeding=false
```

## Environment Variables

Required for all scripts:
- `GCP_PROJECT_ID`: Google Cloud project ID (e.g., "archcelerate")
- `GCP_REGION`: GCP region (e.g., "us-central1")

Optional:
- `DATABASE_URL`: PostgreSQL connection string (auto-retrieved if not set)
- `DB_PASSWORD`: Database password (auto-retrieved from Secret Manager)

## Deployment Report Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     🎉 DEPLOYMENT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPLOYMENT INFORMATION
  Started:          2026-02-03 16:30:00
  Completed:        2026-02-03 16:36:45
  Total Duration:   405s (6m 45s)
  Project:          archcelerate
  Region:           us-central1

EXECUTION STATUS
  ┌────────────────────────────────────────┬──────────┬───────────┐
  │ Step                                   │ Status   │ Duration  │
  ├────────────────────────────────────────┼──────────┼───────────┤
  │ 1. Cloud Run Deployment                │ SUCCESS  │    320s   │
  │ 2. Database Migrations                 │ SUCCESS  │     25s   │
  │ 3. Seed Week 1                         │ SUCCESS  │     12s   │
  │ 4. Seed Week 2                         │ SUCCESS  │      8s   │
  │ 5. Seed Week 5                         │ SUCCESS  │      7s   │
  │ 6. Seed Week 6                         │ SUCCESS  │      6s   │
  │ 7. Seed Remaining Weeks (3,4,7-12)     │ SUCCESS  │     18s   │
  │ 8. Deployment Verification             │ SUCCESS  │      9s   │
  └────────────────────────────────────────┴──────────┴───────────┘

VERIFICATION RESULTS
  Health Check:     SUCCESS
  Database Content: SUCCESS (12 weeks found)

DEPLOYED SERVICES
  Production URL:   https://archcelerate.com
  Service URL:      https://archcelerate-h5rlhvwxaa-uc.a.run.app
  Cloud Run:        archcelerate (revision: archcelerate-00007-ckn)
  Cloud SQL:        archcelerate-db (PostgreSQL 15 + pgvector)
  Redis:            archcelerate-redis (e2-micro)

NEXT STEPS
  1. Test OAuth login:  https://archcelerate.com
  2. View curriculum:   https://archcelerate.com/curriculum/week-1
  3. Check logs:        gcloud run services logs tail archcelerate...
  4. View metrics:      https://console.cloud.google.com/run/detail/...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### Deployment Fails
1. Check the deployment report file for detailed status
2. Review logs: `gcloud run services logs read archcelerate --limit 100`
3. Verify secrets: `gcloud secrets list --project=archcelerate`

### Database Migration Fails
1. Check database connectivity
2. Verify DATABASE_URL secret
3. Run migrations manually: `npx prisma migrate deploy`

### Seeding Fails
1. Check if data already exists (seeding is idempotent)
2. Verify database connection
3. Check individual week seed scripts

## Best Practices

1. **Always run `deploy-with-seed.sh` for complete deployments**
   - Ensures database is up-to-date
   - Verifies all content is seeded
   - Provides comprehensive report

2. **Use GitHub Actions for production deployments**
   - Automated on merge to main
   - Tracked execution history
   - Artifact retention for reports

3. **Review deployment reports**
   - Check execution status for each step
   - Verify health checks passed
   - Confirm database content is complete

4. **Monitor after deployment**
   - Check Cloud Run metrics
   - Review application logs
   - Test critical user flows

## Support

For issues or questions:
- Check `docs/DEPLOYMENT_SUMMARY.md` for infrastructure details
- Review `docs/CI_CD_SETUP.md` for CI/CD configuration
- See `QUICK_REFERENCE.md` for common commands
