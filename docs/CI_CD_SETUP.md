# CI/CD Setup Guide - Google Cloud Platform

**Project:** Archcelerate
**Target:** Google Cloud Run
**Platforms:** GitHub Actions (Recommended) & Cloud Build

---

## 🎯 Overview

This guide sets up automated deployments to Google Cloud Run whenever you push code to GitHub.

**What gets automated:**
1. ✅ Build Docker container
2. ✅ Push to Artifact Registry
3. ✅ Deploy to Cloud Run
4. ✅ Run database migrations (optional)
5. ✅ Health check verification

**Deployment Triggers:**
- Push to `main` branch → Production deployment
- Push to `staging` branch → Staging deployment (optional)
- Pull requests → Build only (no deployment)

---

## 📋 Prerequisites

Before setting up CI/CD:

- [x] GitHub repository with your code
- [x] Google Cloud project (archcelerate)
- [x] Cloud Run service deployed (archcelerate)
- [ ] Service account for CI/CD
- [ ] GitHub secrets configured

---

## 🚀 Option 1: GitHub Actions (Recommended)

**Pros:**
- Free for public repos, 2000 minutes/month for private
- Easy to configure and maintain
- Great integration with GitHub
- Supports matrix builds, parallel jobs
- Extensive marketplace of actions

### Step 1: Create Service Account

```bash
# Set variables
export GCP_PROJECT_ID="archcelerate"
export SERVICE_ACCOUNT_NAME="github-actions-deploy"

# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="GitHub Actions Deployment" \
  --project=$GCP_PROJECT_ID

# Grant necessary roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo "✅ Service account created and key saved to ~/gcp-key.json"
echo "⚠️  IMPORTANT: Keep this key secure and never commit to Git!"
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `archcelerate` | Your GCP project ID |
| `GCP_SA_KEY` | Contents of `~/gcp-key.json` | Service account key (entire JSON) |
| `GCP_REGION` | `us-central1` | Deployment region |
| `GCP_SERVICE` | `archcelerate` | Cloud Run service name |

**To get the JSON key content:**
```bash
cat ~/gcp-key.json
# Copy the entire output and paste as GCP_SA_KEY secret
```

### Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch: # Allow manual triggers

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: ${{ secrets.GCP_REGION }}
  SERVICE_NAME: ${{ secrets.GCP_SERVICE }}
  REGISTRY: us-central1-docker.pkg.dev

jobs:
  deploy:
    name: Build and Deploy to Cloud Run
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker for Artifact Registry
        run: |
          gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:${{ github.sha }} .
          docker tag ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:${{ github.sha }} \
                     ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:latest

      - name: Push to Artifact Registry
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:${{ github.sha }}
          docker push ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:${{ github.sha }} \
            --region=${{ env.GCP_REGION }} \
            --platform=managed \
            --project=${{ env.GCP_PROJECT_ID }}

      - name: Get Service URL
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region=${{ env.GCP_REGION }} \
            --project=${{ env.GCP_PROJECT_ID }} \
            --format='value(status.url)')
          echo "Service deployed to: $SERVICE_URL"
          echo "SERVICE_URL=$SERVICE_URL" >> $GITHUB_ENV

      - name: Health Check
        run: |
          sleep 10
          curl -f ${{ env.SERVICE_URL }}/api/health || exit 1
          echo "✅ Health check passed!"

      - name: Deployment Summary
        run: |
          echo "### 🚀 Deployment Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Service:** ${{ env.SERVICE_NAME }}" >> $GITHUB_STEP_SUMMARY
          echo "**Region:** ${{ env.GCP_REGION }}" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** archcelerate:${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**URL:** ${{ env.SERVICE_URL }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Health check: ✅ Passed" >> $GITHUB_STEP_SUMMARY
```

### Step 4: Create Pull Request Workflow

Create `.github/workflows/build-pr.yml`:

```yaml
name: Build PR

on:
  pull_request:
    branches:
      - main

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGISTRY: us-central1-docker.pkg.dev

jobs:
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: |
          gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build Docker image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/archcelerate-repo/archcelerate:pr-${{ github.event.pull_request.number }} .

      - name: Run tests (if any)
        run: |
          # Add your test commands here
          echo "Running tests..."
          # npm run test

      - name: Build Summary
        run: |
          echo "### ✅ Build Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Docker image built successfully for PR #${{ github.event.pull_request.number }}" >> $GITHUB_STEP_SUMMARY
```

### Step 5: Add Database Migrations (Optional)

Create `.github/workflows/run-migrations.yml`:

```yaml
name: Run Database Migrations

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to run migrations'
        required: true
        type: choice
        options:
          - production
          - staging

env:
  GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  GCP_REGION: ${{ secrets.GCP_REGION }}

jobs:
  migrate:
    name: Run Prisma Migrations
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Run Migrations
        run: |
          gcloud run jobs execute migrate-db \
            --region=${{ env.GCP_REGION }} \
            --project=${{ env.GCP_PROJECT_ID }} \
            --wait

      - name: Migration Summary
        run: |
          echo "### ✅ Migrations Complete!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Environment:** ${{ inputs.environment }}" >> $GITHUB_STEP_SUMMARY
          echo "**Project:** ${{ env.GCP_PROJECT_ID }}" >> $GITHUB_STEP_SUMMARY
```

### Step 6: Test the CI/CD Pipeline

```bash
# Create workflow files
mkdir -p .github/workflows

# Commit and push
git add .github/workflows/
git commit -m "ci: add GitHub Actions deployment workflows"
git push origin main

# Watch the deployment in GitHub
# Go to: https://github.com/YOUR_USERNAME/archcelerate/actions
```

---

## 🏗️ Option 2: Cloud Build

**Pros:**
- Native GCP integration
- No external dependencies
- Powerful build triggers
- Free tier: 120 build-minutes/day

### Step 1: Enable Cloud Build API

```bash
gcloud services enable cloudbuild.googleapis.com --project=archcelerate
```

### Step 2: Grant Cloud Build Permissions

```bash
# Get Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe archcelerate --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding archcelerate \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding archcelerate \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding archcelerate \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.admin"
```

### Step 3: Create Cloud Build Configuration

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:$COMMIT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:latest'
      - '.'

  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:$COMMIT_SHA'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:latest'

  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'archcelerate'
      - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'

  # Health check
  - name: 'gcr.io/cloud-builders/curl'
    args:
      - '-f'
      - 'https://archcelerate.com/api/health'

images:
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:$COMMIT_SHA'
  - 'us-central1-docker.pkg.dev/$PROJECT_ID/archcelerate-repo/archcelerate:latest'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'N1_HIGHCPU_8'

timeout: '1200s'
```

### Step 4: Connect GitHub Repository

```bash
# Connect your GitHub repo to Cloud Build
# This creates a trigger automatically
gcloud alpha builds triggers create github \
  --name="deploy-production" \
  --repo-name="archcelerate" \
  --repo-owner="mandadapu" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --project=archcelerate
```

**Or configure via Console:**
1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=archcelerate
2. Click **"CREATE TRIGGER"**
3. Select **"GitHub"** as source
4. Connect your repository
5. Configure:
   - **Name:** deploy-production
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file
   - **Location:** `cloudbuild.yaml`
6. Click **"CREATE"**

### Step 5: Test Cloud Build

```bash
# Commit cloudbuild.yaml
git add cloudbuild.yaml
git commit -m "ci: add Cloud Build configuration"
git push origin main

# View build progress
gcloud builds list --project=archcelerate --limit=5

# View build logs
BUILD_ID=$(gcloud builds list --project=archcelerate --limit=1 --format='value(id)')
gcloud builds log $BUILD_ID --project=archcelerate
```

---

## 🔄 Advanced CI/CD Features

### Multi-Environment Deployments

Create separate workflows for staging:

`.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - staging

env:
  GCP_PROJECT_ID: archcelerate
  GCP_REGION: us-central1
  SERVICE_NAME: archcelerate-staging

# ... (same steps as production but with different service name)
```

### Automated Rollback

Create `.github/workflows/rollback.yml`:

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      revision:
        description: 'Revision to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Rollback to revision
        run: |
          gcloud run services update-traffic archcelerate \
            --region=us-central1 \
            --project=archcelerate \
            --to-revisions=${{ inputs.revision }}=100
```

### Scheduled Database Backups

Create `.github/workflows/backup-database.yml`:

```yaml
name: Backup Database

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Create backup
        run: |
          gcloud sql backups create \
            --instance=archcelerate-db \
            --project=archcelerate
```

---

## 🎯 Best Practices

### 1. Environment Variables

**Never commit secrets to Git!**

Use GitHub secrets for:
- API keys
- Database credentials
- Service account keys

### 2. Branch Protection

Configure branch protection rules:
1. Go to: **Settings → Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### 3. Deployment Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4. Testing Before Deploy

Add test step:

```yaml
- name: Run Tests
  run: |
    npm install
    npm run test
    npm run test:e2e
```

### 5. Blue-Green Deployments

```yaml
- name: Deploy with traffic split
  run: |
    gcloud run deploy archcelerate \
      --image=$IMAGE \
      --region=us-central1 \
      --no-traffic \
      --tag=candidate

    # Test candidate revision
    # If tests pass, route traffic
    gcloud run services update-traffic archcelerate \
      --to-tags=candidate=100
```

---

## 📊 Monitoring CI/CD

### GitHub Actions

View build status:
- **Actions Tab:** https://github.com/YOUR_USERNAME/archcelerate/actions
- **Status Badge:** Add to README.md

```markdown
![Deploy Status](https://github.com/YOUR_USERNAME/archcelerate/workflows/Deploy%20to%20Production/badge.svg)
```

### Cloud Build

View builds:
```bash
# List recent builds
gcloud builds list --project=archcelerate --limit=10

# View specific build
gcloud builds describe BUILD_ID --project=archcelerate

# Stream logs
gcloud builds log BUILD_ID --stream --project=archcelerate
```

**Cloud Build Console:**
https://console.cloud.google.com/cloud-build/builds?project=archcelerate

---

## 🆘 Troubleshooting

### GitHub Actions Fails

**Check logs:**
1. Go to Actions tab
2. Click on failed workflow
3. Expand failed step
4. Check error message

**Common issues:**
- Invalid service account key → Regenerate and update secret
- Missing permissions → Grant required roles to service account
- Docker build fails → Check Dockerfile and dependencies
- Deployment timeout → Increase timeout in workflow

### Cloud Build Fails

**Check logs:**
```bash
BUILD_ID=$(gcloud builds list --limit=1 --format='value(id)')
gcloud builds log $BUILD_ID
```

**Common issues:**
- Permissions → Grant roles to Cloud Build service account
- Timeout → Increase timeout in cloudbuild.yaml
- Memory → Use larger machine type

---

## ✅ Setup Checklist

### GitHub Actions
- [ ] Create service account
- [ ] Grant IAM roles
- [ ] Download service account key
- [ ] Add GitHub secrets
- [ ] Create workflow files
- [ ] Push to GitHub
- [ ] Verify first deployment
- [ ] Set up branch protection
- [ ] Add status badges

### Cloud Build
- [ ] Enable Cloud Build API
- [ ] Grant Cloud Build permissions
- [ ] Create cloudbuild.yaml
- [ ] Connect GitHub repository
- [ ] Create build trigger
- [ ] Test build
- [ ] Set up notifications

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run CI/CD Guide](https://cloud.google.com/run/docs/continuous-deployment)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)

---

**Last Updated:** February 3, 2026
