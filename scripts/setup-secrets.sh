#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Validation
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/setup-secrets.sh"
  exit 1
fi

echo -e "${GREEN}🔐 Setting up secrets in Google Secret Manager${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo ""

# Function to create or update secret
create_or_update_secret() {
  local secret_name=$1
  local secret_value=$2

  if gcloud secrets describe $secret_name --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}Updating existing secret: $secret_name${NC}"
    echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- --project=$PROJECT_ID
  else
    echo -e "${GREEN}Creating new secret: $secret_name${NC}"
    echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID
  fi
}

# Check if DATABASE_URL and REDIS_URL already exist
DB_EXISTS=$(gcloud secrets describe DATABASE_URL --project=$PROJECT_ID &>/dev/null && echo "yes" || echo "no")
REDIS_EXISTS=$(gcloud secrets describe REDIS_URL --project=$PROJECT_ID &>/dev/null && echo "yes" || echo "no")

if [ "$DB_EXISTS" == "yes" ] && [ "$REDIS_EXISTS" == "yes" ]; then
  echo -e "${GREEN}✓ DATABASE_URL and REDIS_URL already configured${NC}"
  echo -e "${YELLOW}(Automatically created by provision-gcp-services.sh)${NC}"
  echo ""
fi

# Prompt for secrets
echo -e "${YELLOW}Enter your secrets (press Enter to skip existing):${NC}"
echo ""

read -p "ANTHROPIC_API_KEY: " -s ANTHROPIC_API_KEY
echo ""
if [ ! -z "$ANTHROPIC_API_KEY" ]; then
  create_or_update_secret "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
fi

read -p "OPENAI_API_KEY: " -s OPENAI_API_KEY
echo ""
if [ ! -z "$OPENAI_API_KEY" ]; then
  create_or_update_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
fi

read -p "NEXTAUTH_SECRET (min 32 chars): " -s NEXTAUTH_SECRET
echo ""
if [ ! -z "$NEXTAUTH_SECRET" ]; then
  if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    echo -e "${RED}Error: NEXTAUTH_SECRET must be at least 32 characters${NC}"
    exit 1
  fi
  create_or_update_secret "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET"
fi

read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
  create_or_update_secret "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
fi

read -p "GOOGLE_CLIENT_SECRET: " -s GOOGLE_CLIENT_SECRET
echo ""
if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
  create_or_update_secret "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
fi

read -p "FACEBOOK_CLIENT_ID (optional): " FACEBOOK_CLIENT_ID
if [ ! -z "$FACEBOOK_CLIENT_ID" ]; then
  create_or_update_secret "FACEBOOK_CLIENT_ID" "$FACEBOOK_CLIENT_ID"
fi

read -p "FACEBOOK_CLIENT_SECRET (optional): " -s FACEBOOK_CLIENT_SECRET
echo ""
if [ ! -z "$FACEBOOK_CLIENT_SECRET" ]; then
  create_or_update_secret "FACEBOOK_CLIENT_SECRET" "$FACEBOOK_CLIENT_SECRET"
fi

read -p "TAVILY_API_KEY (optional): " -s TAVILY_API_KEY
echo ""
if [ ! -z "$TAVILY_API_KEY" ]; then
  create_or_update_secret "TAVILY_API_KEY" "$TAVILY_API_KEY"
fi

if [ "$DB_EXISTS" == "no" ]; then
  echo ""
  echo -e "${YELLOW}DATABASE_URL not found. Enter connection string:${NC}"
  echo -e "${YELLOW}(Skip if you ran provision-gcp-services.sh or using external provider)${NC}"
  read -p "DATABASE_URL: " DATABASE_URL
  if [ ! -z "$DATABASE_URL" ]; then
    create_or_update_secret "DATABASE_URL" "$DATABASE_URL"
  fi
fi

if [ "$REDIS_EXISTS" == "no" ]; then
  echo ""
  echo -e "${YELLOW}REDIS_URL not found. Enter connection string:${NC}"
  echo -e "${YELLOW}(Skip if you ran provision-gcp-services.sh or using external provider)${NC}"
  read -p "REDIS_URL: " REDIS_URL
  if [ ! -z "$REDIS_URL" ]; then
    create_or_update_secret "REDIS_URL" "$REDIS_URL"
  fi
fi

echo ""
echo -e "${GREEN}Granting Cloud Run access to secrets...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor \
  --condition=None

echo ""
echo -e "${GREEN}✅ Secrets setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next step: Run ./scripts/deploy-gcp.sh to deploy the application${NC}"
