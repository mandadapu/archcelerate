# CI/CD Pipeline Documentation

## Overview

The AI Architect Accelerator platform uses GitHub Actions for continuous integration and deployment, building Docker images and publishing to GitHub Container Registry (GHCR).

## Workflows

### CI (Continuous Integration)

**File:** `.github/workflows/ci.yml`

**Trigger:** Push or Pull Request to `main` or `develop` branches

**Jobs:**

1. **Test Job**
   - Sets up PostgreSQL 16 and Redis 7 services
   - Installs dependencies with `--legacy-peer-deps`
   - Generates Prisma Client
   - Runs database migrations
   - Executes linter (`npm run lint`)
   - Runs type checking (`npm run type-check`)
   - Runs unit tests (`npm run test:unit`)
   - Runs integration tests (`npm run test:integration`)

2. **Build Job** (runs after test job passes)
   - Installs dependencies
   - Generates Prisma Client
   - Builds Next.js application
   - Uploads build artifacts for verification

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key (min 32 chars)
- `NEXTAUTH_URL`: Application URL

### Deploy to Production

**File:** `.github/workflows/deploy-production.yml`

**Trigger:** Push to `main` branch or manual workflow dispatch

**Environment:** `production`

**Steps:**
1. Checkout code
2. Install dependencies and generate Prisma Client
3. Run full test suite
4. Log in to GitHub Container Registry
5. Build Docker image
6. Push image with tags:
   - `main-<sha>`: Commit-specific tag
   - `latest`: Latest production build
7. Notify deployment success

**Required Secrets:**
- `PROD_DATABASE_URL`: Production PostgreSQL URL
- `PROD_REDIS_URL`: Production Redis URL
- `PROD_NEXTAUTH_SECRET`: Production NextAuth secret
- `PROD_NEXTAUTH_URL`: Production application URL
- `GITHUB_TOKEN`: Automatically provided by GitHub

**Output:** Docker image pushed to `ghcr.io/<owner>/archcelerate:latest`

### Deploy to Staging

**File:** `.github/workflows/deploy-staging.yml`

**Trigger:** Push to `develop` branch or manual workflow dispatch

**Environment:** `staging`

**Steps:**
1. Checkout code
2. Install dependencies and generate Prisma Client
3. Run full test suite
4. Log in to GitHub Container Registry
5. Build Docker image
6. Push image with tags:
   - `develop-<sha>`: Commit-specific tag
   - `staging`: Latest staging build
7. Notify deployment success

**Required Secrets:**
- `STAGING_DATABASE_URL`: Staging PostgreSQL URL
- `STAGING_REDIS_URL`: Staging Redis URL
- `STAGING_NEXTAUTH_SECRET`: Staging NextAuth secret
- `STAGING_NEXTAUTH_URL`: Staging application URL
- `GITHUB_TOKEN`: Automatically provided by GitHub

**Output:** Docker image pushed to `ghcr.io/<owner>/archcelerate:staging`

## Setting Up Secrets

### In GitHub Repository Settings

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

**Production Secrets:**
```
PROD_DATABASE_URL=postgresql://user:password@host:5432/archcelerate_prod
PROD_REDIS_URL=redis://host:6379
PROD_NEXTAUTH_SECRET=<generate-secure-32+-char-string>
PROD_NEXTAUTH_URL=https://archcelerate.com
PROD_GOOGLE_CLIENT_ID=<your-google-client-id>
PROD_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Staging Secrets:**
```
STAGING_DATABASE_URL=postgresql://user:password@host:5432/archcelerate_staging
STAGING_REDIS_URL=redis://host:6379
STAGING_NEXTAUTH_SECRET=<generate-secure-32+-char-string>
STAGING_NEXTAUTH_URL=https://staging.archcelerate.com
STAGING_GOOGLE_CLIENT_ID=<your-google-client-id>
STAGING_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

## Deploying Docker Images

After the workflow pushes images to GHCR, deploy them to your infrastructure:

### Pull the Image

```bash
# Production
docker pull ghcr.io/<owner>/archcelerate:latest

# Staging
docker pull ghcr.io/<owner>/archcelerate:staging
```

### Run the Container

```bash
docker run -d \
  --name archcelerate-production \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@db-host:5432/archcelerate_prod" \
  -e REDIS_URL="redis://redis-host:6379" \
  -e NEXTAUTH_SECRET="your-secret-min-32-chars" \
  -e NEXTAUTH_URL="https://archcelerate.com" \
  -e GOOGLE_CLIENT_ID="your-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-client-secret" \
  ghcr.io/<owner>/archcelerate:latest
```

## Branch Strategy

- **`main`**: Production-ready code. Pushes trigger production deployment.
- **`develop`**: Integration branch for features. Pushes trigger staging deployment.
- **Feature branches**: Create PR to `develop` for review. CI runs on PR.

## Workflow Diagram

```
┌─────────────┐
│  Push/PR    │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│  CI Workflow        │
│  - Lint             │
│  - Type Check       │
│  - Unit Tests       │
│  - Integration Tests│
│  - Build            │
└──────┬──────────────┘
       │
       v
┌──────────────┐      ┌─────────────────┐
│ Push to main │─────>│  Deploy Prod    │
└──────────────┘      │  - Test         │
                      │  - Build Image  │
┌──────────────┐      │  - Push to GHCR │
│Push to develop─────>└─────────────────┘
└──────────────┘      │                 │
       │              └─────────────────┘
       v                       │
┌─────────────────┐            v
│  Deploy Staging │     ┌─────────────┐
│  - Test         │     │   Manual    │
│  - Build Image  │     │   Deploy    │
│  - Push to GHCR │     │   to Server │
└─────────────────┘     └─────────────┘
```

## Troubleshooting

### Tests Failing in CI

Check the test logs in the Actions tab. Common issues:
- Database connection errors: Verify service health checks
- Missing environment variables: Check secrets configuration
- Flaky tests: Re-run the workflow

### Docker Build Failing

- Check for syntax errors in Dockerfile
- Ensure `.dockerignore` is properly configured
- Verify dependencies install correctly with `--legacy-peer-deps`

### Deployment Not Triggering

- Ensure you're pushing to the correct branch (`main` for prod, `develop` for staging)
- Check workflow file syntax with `act` locally
- Verify branch protection rules aren't blocking the workflow

## Local Testing

Test GitHub Actions workflows locally with `act`:

```bash
# Install act
brew install act

# Test CI workflow
act -j test

# Test build job
act -j build
```

## Monitoring

- **Action runs**: Check GitHub **Actions** tab for workflow status
- **Container registry**: View published images at `https://github.com/<owner>/archcelerate/pkgs/container/archcelerate`
- **Build artifacts**: Download from workflow run summary

## Next Steps

1. Set up production and staging environments
2. Configure database and Redis instances
3. Add secrets to GitHub repository settings
4. Push to `develop` or `main` to trigger deployments
5. Monitor first deployment and verify application health
