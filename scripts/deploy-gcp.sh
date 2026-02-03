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
echo -e "${GREEN}Step 5: Deploying to Cloud Run...${NC}"

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
