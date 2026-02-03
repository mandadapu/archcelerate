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
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/run-migrations.sh"
  exit 1
fi

echo -e "${GREEN}🗄️  Running database migrations${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo ""

# Create or update migration job
echo -e "${GREEN}Creating Cloud Run job for migrations...${NC}"
if gcloud run jobs describe migrate-db --region=$REGION --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}Updating existing job...${NC}"
  gcloud run jobs update migrate-db \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
    --region $REGION \
    --project=$PROJECT_ID \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest"
else
  echo -e "${GREEN}Creating new job...${NC}"
  gcloud run jobs create migrate-db \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/${SERVICE_NAME}-repo/$SERVICE_NAME \
    --region $REGION \
    --project=$PROJECT_ID \
    --command "npx" \
    --args "prisma,migrate,deploy" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
    --max-retries 0 \
    --task-timeout 10m
fi

# Execute migration job
echo -e "${GREEN}Executing migrations...${NC}"
gcloud run jobs execute migrate-db \
  --region $REGION \
  --project=$PROJECT_ID \
  --wait

echo ""
echo -e "${GREEN}✅ Migrations complete!${NC}"
