#!/bin/bash
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
ZONE="${GCP_ZONE:-us-central1-a}"
DB_INSTANCE_NAME="${DB_INSTANCE_NAME:-archcelerate-db}"
REDIS_INSTANCE_NAME="${REDIS_INSTANCE_NAME:-archcelerate-redis}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
  echo "Usage: GCP_PROJECT_ID=your-project-id ./scripts/provision-gcp-services.sh"
  exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Provisioning Google Cloud Services for Archcelerate        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo -e "${YELLOW}Zone: $ZONE${NC}"
echo ""

# Step 1: Enable required APIs
echo -e "${GREEN}Step 1: Enabling required GCP APIs...${NC}"
gcloud services enable \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com \
  --project=$PROJECT_ID

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Step 2: Provision Cloud SQL for PostgreSQL
echo -e "${GREEN}Step 2: Provisioning Cloud SQL for PostgreSQL...${NC}"

if gcloud sql instances describe $DB_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}✓ Cloud SQL instance already exists${NC}"
else
  echo -e "${YELLOW}Creating Cloud SQL instance (this takes ~10 minutes)...${NC}"

  # Generate random password
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

  gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --network=default \
    --no-assign-ip \
    --database-flags=cloudsql.iam_authentication=on \
    --project=$PROJECT_ID

  # Create database
  gcloud sql databases create archcelerate \
    --instance=$DB_INSTANCE_NAME \
    --project=$PROJECT_ID

  # Set root password
  gcloud sql users set-password postgres \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD \
    --project=$PROJECT_ID

  # Store password in Secret Manager
  echo -n "$DB_PASSWORD" | gcloud secrets create DB_PASSWORD \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$DB_PASSWORD" | gcloud secrets versions add DB_PASSWORD \
    --data-file=- \
    --project=$PROJECT_ID

  echo -e "${GREEN}✓ Cloud SQL instance created${NC}"
  echo -e "${YELLOW}Database password stored in Secret Manager as 'DB_PASSWORD'${NC}"
fi

# Get Cloud SQL connection name
SQL_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format='value(connectionName)')

# Get private IP
SQL_PRIVATE_IP=$(gcloud sql instances describe $DB_INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format='value(ipAddresses[0].ipAddress)')

echo -e "${BLUE}Cloud SQL Info:${NC}"
echo -e "  Connection Name: ${YELLOW}$SQL_CONNECTION_NAME${NC}"
echo -e "  Private IP: ${YELLOW}$SQL_PRIVATE_IP${NC}"
echo ""

# Step 3: Enable pgvector extension
echo -e "${GREEN}Step 3: Enabling pgvector extension...${NC}"

# Check if extension is already enabled
EXTENSION_CHECK=$(gcloud sql connect $DB_INSTANCE_NAME \
  --user=postgres \
  --database=archcelerate \
  --quiet \
  --project=$PROJECT_ID <<EOF 2>/dev/null || echo "not_enabled"
SELECT 1 FROM pg_extension WHERE extname = 'vector';
\q
EOF
)

if [[ "$EXTENSION_CHECK" == *"1"* ]]; then
  echo -e "${YELLOW}✓ pgvector extension already enabled${NC}"
else
  echo -e "${YELLOW}Enabling pgvector extension...${NC}"
  gcloud sql connect $DB_INSTANCE_NAME \
    --user=postgres \
    --database=archcelerate \
    --quiet \
    --project=$PROJECT_ID <<EOF
CREATE EXTENSION IF NOT EXISTS vector;
\q
EOF
  echo -e "${GREEN}✓ pgvector extension enabled${NC}"
fi
echo ""

# Step 4: Provision Redis on Compute Engine
echo -e "${GREEN}Step 4: Provisioning Redis on Compute Engine...${NC}"

if gcloud compute instances describe $REDIS_INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}✓ Redis instance already exists${NC}"
else
  echo -e "${YELLOW}Creating Redis VM (e2-micro, ~$5/month)...${NC}"

  # Create startup script for Redis
  cat > /tmp/redis-startup.sh <<'REDIS_SCRIPT'
#!/bin/bash
# Install Redis
apt-get update
apt-get install -y redis-server

# Configure Redis
cat > /etc/redis/redis.conf <<EOF
bind 0.0.0.0
protected-mode yes
port 6379
requirepass REDIS_PASSWORD_PLACEHOLDER
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

# Restart Redis
systemctl restart redis-server
systemctl enable redis-server
REDIS_SCRIPT

  # Generate Redis password
  REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

  # Replace placeholder in startup script
  sed -i "s/REDIS_PASSWORD_PLACEHOLDER/$REDIS_PASSWORD/" /tmp/redis-startup.sh

  # Create VM instance
  gcloud compute instances create $REDIS_INSTANCE_NAME \
    --zone=$ZONE \
    --machine-type=e2-micro \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --metadata-from-file startup-script=/tmp/redis-startup.sh \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --tags=redis-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=$REDIS_INSTANCE_NAME,image=projects/debian-cloud/global/images/debian-11-bullseye-v20240213,mode=rw,size=10,type=projects/$PROJECT_ID/zones/$ZONE/diskTypes/pd-standard \
    --project=$PROJECT_ID

  # Create firewall rule for Redis (internal only)
  gcloud compute firewall-rules create allow-redis-internal \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:6379 \
    --source-ranges=10.0.0.0/8 \
    --target-tags=redis-server \
    --project=$PROJECT_ID 2>/dev/null || echo "Firewall rule already exists"

  # Store Redis password in Secret Manager
  echo -n "$REDIS_PASSWORD" | gcloud secrets create REDIS_PASSWORD \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$REDIS_PASSWORD" | gcloud secrets versions add REDIS_PASSWORD \
    --data-file=- \
    --project=$PROJECT_ID

  echo -e "${GREEN}✓ Redis instance created${NC}"
  echo -e "${YELLOW}Redis password stored in Secret Manager as 'REDIS_PASSWORD'${NC}"
  echo -e "${YELLOW}Waiting 30 seconds for Redis to start...${NC}"
  sleep 30
fi

# Get Redis internal IP
REDIS_INTERNAL_IP=$(gcloud compute instances describe $REDIS_INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --format='value(networkInterfaces[0].networkIP)')

echo -e "${BLUE}Redis Info:${NC}"
echo -e "  Internal IP: ${YELLOW}$REDIS_INTERNAL_IP${NC}"
echo ""

# Step 5: Create VPC Connector for Cloud Run
echo -e "${GREEN}Step 5: Creating VPC connector for Cloud Run...${NC}"

VPC_CONNECTOR_NAME="archcelerate-connector"

if gcloud compute networks vpc-access connectors describe $VPC_CONNECTOR_NAME \
  --region=$REGION \
  --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}✓ VPC connector already exists${NC}"
else
  echo -e "${YELLOW}Creating VPC connector (this takes ~2 minutes)...${NC}"
  gcloud compute networks vpc-access connectors create $VPC_CONNECTOR_NAME \
    --region=$REGION \
    --network=default \
    --range=10.8.0.0/28 \
    --min-instances=2 \
    --max-instances=3 \
    --machine-type=e2-micro \
    --project=$PROJECT_ID

  echo -e "${GREEN}✓ VPC connector created${NC}"
fi
echo ""

# Step 6: Generate connection strings and update secrets
echo -e "${GREEN}Step 6: Generating connection strings...${NC}"

# Get passwords from Secret Manager
DB_PASSWORD=$(gcloud secrets versions access latest --secret=DB_PASSWORD --project=$PROJECT_ID 2>/dev/null || echo "")
REDIS_PASSWORD=$(gcloud secrets versions access latest --secret=REDIS_PASSWORD --project=$PROJECT_ID 2>/dev/null || echo "")

# Generate DATABASE_URL
if [ ! -z "$DB_PASSWORD" ]; then
  DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${SQL_PRIVATE_IP}:5432/archcelerate?schema=public"
  echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL \
    --data-file=- \
    --project=$PROJECT_ID
  echo -e "${GREEN}✓ DATABASE_URL stored in Secret Manager${NC}"
fi

# Generate REDIS_URL
if [ ! -z "$REDIS_PASSWORD" ]; then
  REDIS_URL="redis://:${REDIS_PASSWORD}@${REDIS_INTERNAL_IP}:6379"
  echo -n "$REDIS_URL" | gcloud secrets create REDIS_URL \
    --data-file=- \
    --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$REDIS_URL" | gcloud secrets versions add REDIS_URL \
    --data-file=- \
    --project=$PROJECT_ID
  echo -e "${GREEN}✓ REDIS_URL stored in Secret Manager${NC}"
fi

# Step 7: Grant Cloud Run access to secrets
echo -e "${GREEN}Step 7: Granting Cloud Run access to secrets...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor \
  --condition=None &>/dev/null

echo -e "${GREEN}✓ Permissions granted${NC}"
echo ""

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Provisioning Complete!                                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services Created:${NC}"
echo -e "  1. Cloud SQL PostgreSQL (${DB_INSTANCE_NAME})"
echo -e "     - Private IP: ${YELLOW}$SQL_PRIVATE_IP${NC}"
echo -e "     - Database: archcelerate"
echo -e "     - pgvector: enabled"
echo -e "     - Cost: ~$7-10/month"
echo ""
echo -e "  2. Redis on Compute Engine (${REDIS_INSTANCE_NAME})"
echo -e "     - Internal IP: ${YELLOW}$REDIS_INTERNAL_IP${NC}"
echo -e "     - Memory: 256MB"
echo -e "     - Cost: ~$5/month"
echo ""
echo -e "  3. VPC Connector (${VPC_CONNECTOR_NAME})"
echo -e "     - Region: ${REGION}"
echo -e "     - Cost: ~$8/month (always-on)"
echo ""
echo -e "${YELLOW}Total estimated cost: ~$20-23/month${NC}"
echo ""
echo -e "${GREEN}Secrets stored in Secret Manager:${NC}"
echo -e "  - DATABASE_URL"
echo -e "  - REDIS_URL"
echo -e "  - DB_PASSWORD"
echo -e "  - REDIS_PASSWORD"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Run ${BLUE}./scripts/setup-secrets.sh${NC} to configure API keys"
echo -e "  2. Run ${BLUE}./scripts/deploy-gcp.sh${NC} to deploy the application"
echo -e "  3. Run ${BLUE}./scripts/run-migrations.sh${NC} to initialize the database"
echo ""
echo -e "${GREEN}To view connection details:${NC}"
echo -e "  Database: ${BLUE}gcloud secrets versions access latest --secret=DATABASE_URL${NC}"
echo -e "  Redis: ${BLUE}gcloud secrets versions access latest --secret=REDIS_URL${NC}"
echo ""
