#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ID="archcelerate"
SA_NAME="github-actions-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo -e "${GREEN}Setting up GitHub Actions service account...${NC}"

# 1. Create service account
echo -e "${YELLOW}Creating service account...${NC}"
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deploy" \
  --project=$PROJECT_ID

# 2. Grant necessary roles
echo -e "${YELLOW}Granting IAM roles...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 3. Create JSON key
echo -e "${YELLOW}Creating service account key...${NC}"
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo -e "${GREEN}✅ Service account created successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the contents of github-actions-key.json"
echo "2. Go to GitHub: https://github.com/mandadapu/archcelerate/settings/secrets/actions"
echo "3. Click 'New repository secret'"
echo "4. Name: GCP_SA_KEY"
echo "5. Value: Paste the entire contents of github-actions-key.json"
echo "6. Click 'Add secret'"
echo ""
echo "Key file: $(pwd)/github-actions-key.json"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Delete the key file after adding to GitHub:${NC}"
echo "rm github-actions-key.json"
