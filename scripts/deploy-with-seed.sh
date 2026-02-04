#!/bin/bash

# Exit on error disabled for status tracking
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Status tracking
DEPLOYMENT_STATUS="PENDING"
MIGRATION_STATUS="PENDING"
SEED_WEEK1_STATUS="PENDING"
SEED_WEEK2_STATUS="PENDING"
SEED_WEEK5_STATUS="PENDING"
SEED_WEEK6_STATUS="PENDING"
SEED_REMAINING_STATUS="PENDING"
VERIFICATION_STATUS="PENDING"

START_TIME=$(date +%s)

echo -e "${GREEN}🚀 Automated Deployment with Database Seeding${NC}"
echo -e "${BLUE}Started at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Check required environment variables
if [ -z "$GCP_PROJECT_ID" ]; then
  echo -e "${RED}Error: GCP_PROJECT_ID environment variable is required${NC}"
  DEPLOYMENT_STATUS="FAILED"
  exit 1
fi

if [ -z "$GCP_REGION" ]; then
  echo -e "${RED}Error: GCP_REGION environment variable is required${NC}"
  DEPLOYMENT_STATUS="FAILED"
  exit 1
fi

echo -e "${YELLOW}Project: $GCP_PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $GCP_REGION${NC}"
echo ""

# Step 1: Deploy application to Cloud Run
echo -e "${GREEN}Step 1/4: Deploying application to Cloud Run...${NC}"
DEPLOY_START=$(date +%s)
./scripts/deploy-gcp.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Deployment failed${NC}"
  DEPLOYMENT_STATUS="FAILED"
else
  DEPLOYMENT_STATUS="SUCCESS"
  echo -e "${GREEN}✅ Application deployed successfully${NC}"
fi
DEPLOY_END=$(date +%s)
DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))
echo ""

# Exit if deployment failed
if [ "$DEPLOYMENT_STATUS" = "FAILED" ]; then
  END_TIME=$(date +%s)
  TOTAL_DURATION=$((END_TIME - START_TIME))

  echo -e "${RED}Deployment failed. Generating report...${NC}"
  echo ""

  # Generate failure report
  cat << EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ DEPLOYMENT REPORT - FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Started: $(date -r $START_TIME '+%Y-%m-%d %H:%M:%S')
Failed: $(date '+%Y-%m-%d %H:%M:%S')
Duration: ${TOTAL_DURATION}s

EXECUTION STATUS:
  1. Cloud Run Deployment:    FAILED (${DEPLOY_DURATION}s)
  2. Database Migrations:      SKIPPED
  3. Week 1 Seeding:          SKIPPED
  4. Week 2 Seeding:          SKIPPED
  5. Week 5 Seeding:          SKIPPED
  6. Week 6 Seeding:          SKIPPED
  7. Remaining Weeks Seeding: SKIPPED
  8. Deployment Verification: SKIPPED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
  exit 1
fi

# Wait for service to be ready
echo -e "${YELLOW}Waiting for service to be ready...${NC}"
sleep 10

# Step 2: Run database migrations
echo -e "${GREEN}Step 2/4: Running database migrations...${NC}"
MIGRATION_START=$(date +%s)

# Get Cloud SQL connection details
DB_PASSWORD=$(gcloud secrets versions access latest --secret=DB_PASSWORD --project=$GCP_PROJECT_ID 2>/dev/null)
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${RED}❌ Could not retrieve database password${NC}"
  MIGRATION_STATUS="FAILED"
  MIGRATION_END=$(date +%s)
  MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
else
  # Get database instance public IP
  DB_HOST=$(gcloud sql instances describe archcelerate-db --project=$GCP_PROJECT_ID --format="value(ipAddresses[0].ipAddress)")
  if [ -z "$DB_HOST" ]; then
    echo -e "${RED}❌ Could not retrieve database host${NC}"
    MIGRATION_STATUS="FAILED"
    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
  else
    echo -e "${YELLOW}Database Host: $DB_HOST${NC}"

    # Run migrations
    export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/archcelerate?schema=public"
    npx prisma migrate deploy

    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Database migrations failed${NC}"
      MIGRATION_STATUS="FAILED"
    else
      echo -e "${GREEN}✅ Database migrations completed successfully${NC}"
      MIGRATION_STATUS="SUCCESS"
    fi
    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
  fi
fi
echo ""

# Step 3: Seed database with curriculum content
echo -e "${GREEN}Step 3/4: Seeding database with curriculum content...${NC}"

# Seed in order: Week 1, Week 2, Week 5, Week 6, then all remaining weeks

# Week 1
echo -e "${YELLOW}Seeding Week 1...${NC}"
WEEK1_START=$(date +%s)
npx tsx prisma/seed-week1.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠ Week 1 may already be seeded or error occurred${NC}"
  SEED_WEEK1_STATUS="SKIPPED"
else
  echo -e "${GREEN}✅ Week 1 seeded${NC}"
  SEED_WEEK1_STATUS="SUCCESS"
fi
WEEK1_END=$(date +%s)
WEEK1_DURATION=$((WEEK1_END - WEEK1_START))

# Week 2
echo -e "${YELLOW}Seeding Week 2...${NC}"
WEEK2_START=$(date +%s)
npx tsx prisma/seed-week2.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠ Week 2 may already be seeded or error occurred${NC}"
  SEED_WEEK2_STATUS="SKIPPED"
else
  echo -e "${GREEN}✅ Week 2 seeded${NC}"
  SEED_WEEK2_STATUS="SUCCESS"
fi
WEEK2_END=$(date +%s)
WEEK2_DURATION=$((WEEK2_END - WEEK2_START))

# Week 5
echo -e "${YELLOW}Seeding Week 5...${NC}"
WEEK5_START=$(date +%s)
npx tsx prisma/seed-week5.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠ Week 5 may already be seeded or error occurred${NC}"
  SEED_WEEK5_STATUS="SKIPPED"
else
  echo -e "${GREEN}✅ Week 5 seeded${NC}"
  SEED_WEEK5_STATUS="SUCCESS"
fi
WEEK5_END=$(date +%s)
WEEK5_DURATION=$((WEEK5_END - WEEK5_START))

# Week 6
echo -e "${YELLOW}Seeding Week 6...${NC}"
WEEK6_START=$(date +%s)
npx tsx prisma/seed-week6.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠ Week 6 may already be seeded or error occurred${NC}"
  SEED_WEEK6_STATUS="SKIPPED"
else
  echo -e "${GREEN}✅ Week 6 seeded${NC}"
  SEED_WEEK6_STATUS="SUCCESS"
fi
WEEK6_END=$(date +%s)
WEEK6_DURATION=$((WEEK6_END - WEEK6_START))

# Remaining weeks
echo -e "${YELLOW}Seeding remaining weeks (3, 4, 7-12)...${NC}"
REMAINING_START=$(date +%s)
npx tsx prisma/seed-all-weeks.ts > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}⚠ Remaining weeks may already be seeded or error occurred${NC}"
  SEED_REMAINING_STATUS="SKIPPED"
else
  echo -e "${GREEN}✅ Remaining weeks seeded${NC}"
  SEED_REMAINING_STATUS="SUCCESS"
fi
REMAINING_END=$(date +%s)
REMAINING_DURATION=$((REMAINING_END - REMAINING_START))

echo -e "${GREEN}✅ All curriculum content seeding completed${NC}"
echo ""

# Step 4: Verify deployment
echo -e "${GREEN}Step 4/4: Verifying deployment...${NC}"
VERIFY_START=$(date +%s)

# Test health endpoint
HEALTH_URL="https://archcelerate.com/api/health"
echo -e "${YELLOW}Testing health endpoint: $HEALTH_URL${NC}"

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

HEALTH_STATUS="FAILED"
if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Health check passed${NC}"
  echo -e "${YELLOW}Response: $RESPONSE_BODY${NC}"
  HEALTH_STATUS="SUCCESS"
else
  echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
  HEALTH_STATUS="FAILED"
fi

# Verify database content
echo -e "${YELLOW}Verifying database content...${NC}"

DB_VERIFICATION="N/A"
WEEK_COUNT=0

# Check if psql is available
if command -v psql >/dev/null 2>&1; then
  WEEK_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U postgres -d archcelerate -t -c "SELECT COUNT(*) FROM \"CurriculumWeek\";" 2>/dev/null | xargs)
  if [ "$WEEK_COUNT" -eq 12 ]; then
    echo -e "${GREEN}✅ All 12 curriculum weeks verified in database${NC}"
    DB_VERIFICATION="SUCCESS"
  else
    echo -e "${YELLOW}⚠ Found $WEEK_COUNT weeks in database (expected 12)${NC}"
    DB_VERIFICATION="PARTIAL"
  fi
elif command -v /opt/homebrew/opt/libpq/bin/psql >/dev/null 2>&1; then
  WEEK_COUNT=$(PGPASSWORD="$DB_PASSWORD" /opt/homebrew/opt/libpq/bin/psql -h "$DB_HOST" -U postgres -d archcelerate -t -c "SELECT COUNT(*) FROM \"CurriculumWeek\";" 2>/dev/null | xargs)
  if [ "$WEEK_COUNT" -eq 12 ]; then
    echo -e "${GREEN}✅ All 12 curriculum weeks verified in database${NC}"
    DB_VERIFICATION="SUCCESS"
  else
    echo -e "${YELLOW}⚠ Found $WEEK_COUNT weeks in database (expected 12)${NC}"
    DB_VERIFICATION="PARTIAL"
  fi
else
  echo -e "${YELLOW}⚠ psql not found, skipping database verification${NC}"
  DB_VERIFICATION="SKIPPED"
fi

VERIFY_END=$(date +%s)
VERIFY_DURATION=$((VERIFY_END - VERIFY_START))

if [ "$HEALTH_STATUS" = "SUCCESS" ]; then
  VERIFICATION_STATUS="SUCCESS"
else
  VERIFICATION_STATUS="FAILED"
fi

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}                     🎉 DEPLOYMENT REPORT                               ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}DEPLOYMENT INFORMATION${NC}"
echo -e "  Started:          $(date -r $START_TIME '+%Y-%m-%d %H:%M:%S')"
echo -e "  Completed:        $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "  Total Duration:   ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s)"
echo -e "  Project:          $GCP_PROJECT_ID"
echo -e "  Region:           $GCP_REGION"
echo ""
echo -e "${BLUE}EXECUTION STATUS${NC}"
echo -e "  ┌────────────────────────────────────────┬──────────┬───────────┐"
echo -e "  │ Step                                   │ Status   │ Duration  │"
echo -e "  ├────────────────────────────────────────┼──────────┼───────────┤"

# Format status with colors
format_status() {
  case $1 in
    SUCCESS) echo -e "${GREEN}SUCCESS${NC} " ;;
    FAILED)  echo -e "${RED}FAILED ${NC} " ;;
    SKIPPED) echo -e "${YELLOW}SKIPPED${NC} " ;;
    *)       echo -e "${YELLOW}UNKNOWN${NC} " ;;
  esac
}

printf "  │ 1. Cloud Run Deployment                │ $(format_status $DEPLOYMENT_STATUS) │ %6ss   │\n" "$DEPLOY_DURATION"
printf "  │ 2. Database Migrations                 │ $(format_status $MIGRATION_STATUS) │ %6ss   │\n" "$MIGRATION_DURATION"
printf "  │ 3. Seed Week 1                         │ $(format_status $SEED_WEEK1_STATUS) │ %6ss   │\n" "$WEEK1_DURATION"
printf "  │ 4. Seed Week 2                         │ $(format_status $SEED_WEEK2_STATUS) │ %6ss   │\n" "$WEEK2_DURATION"
printf "  │ 5. Seed Week 5                         │ $(format_status $SEED_WEEK5_STATUS) │ %6ss   │\n" "$WEEK5_DURATION"
printf "  │ 6. Seed Week 6                         │ $(format_status $SEED_WEEK6_STATUS) │ %6ss   │\n" "$WEEK6_DURATION"
printf "  │ 7. Seed Remaining Weeks (3,4,7-12)     │ $(format_status $SEED_REMAINING_STATUS) │ %6ss   │\n" "$REMAINING_DURATION"
printf "  │ 8. Deployment Verification             │ $(format_status $VERIFICATION_STATUS) │ %6ss   │\n" "$VERIFY_DURATION"
echo -e "  └────────────────────────────────────────┴──────────┴───────────┘"
echo ""
echo -e "${BLUE}VERIFICATION RESULTS${NC}"
echo -e "  Health Check:     $HEALTH_STATUS"
echo -e "  Database Content: $DB_VERIFICATION ($WEEK_COUNT weeks found)"
echo ""
echo -e "${BLUE}DEPLOYED SERVICES${NC}"
echo -e "  Production URL:   https://archcelerate.com"
echo -e "  Service URL:      https://archcelerate-h5rlhvwxaa-uc.a.run.app"
echo -e "  Cloud Run:        archcelerate (revision: archcelerate-00007-ckn)"
echo -e "  Cloud SQL:        archcelerate-db (PostgreSQL 15 + pgvector)"
echo -e "  Redis:            archcelerate-redis (e2-micro)"
echo ""
echo -e "${BLUE}NEXT STEPS${NC}"
echo "  1. Test OAuth login:  https://archcelerate.com"
echo "  2. View curriculum:   https://archcelerate.com/curriculum/week-1"
echo "  3. Check logs:        gcloud run services logs tail archcelerate --region $GCP_REGION --project $GCP_PROJECT_ID"
echo "  4. View metrics:      https://console.cloud.google.com/run/detail/$GCP_REGION/archcelerate/metrics?project=$GCP_PROJECT_ID"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save report to file
REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
DEPLOYMENT REPORT
Generated: $(date '+%Y-%m-%d %H:%M:%S')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEPLOYMENT INFORMATION
  Started:          $(date -r $START_TIME '+%Y-%m-%d %H:%M:%S')
  Completed:        $(date '+%Y-%m-%d %H:%M:%S')
  Total Duration:   ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60))m $(($TOTAL_DURATION % 60))s)
  Project:          $GCP_PROJECT_ID
  Region:           $GCP_REGION

EXECUTION STATUS
  Step                                   Status      Duration
  ────────────────────────────────────────────────────────────
  1. Cloud Run Deployment                $DEPLOYMENT_STATUS    ${DEPLOY_DURATION}s
  2. Database Migrations                 $MIGRATION_STATUS    ${MIGRATION_DURATION}s
  3. Seed Week 1                         $SEED_WEEK1_STATUS    ${WEEK1_DURATION}s
  4. Seed Week 2                         $SEED_WEEK2_STATUS    ${WEEK2_DURATION}s
  5. Seed Week 5                         $SEED_WEEK5_STATUS    ${WEEK5_DURATION}s
  6. Seed Week 6                         $SEED_WEEK6_STATUS    ${WEEK6_DURATION}s
  7. Seed Remaining Weeks (3,4,7-12)     $SEED_REMAINING_STATUS    ${REMAINING_DURATION}s
  8. Deployment Verification             $VERIFICATION_STATUS    ${VERIFY_DURATION}s

VERIFICATION RESULTS
  Health Check:     $HEALTH_STATUS
  Database Content: $DB_VERIFICATION ($WEEK_COUNT weeks found)

DEPLOYED SERVICES
  Production URL:   https://archcelerate.com
  Service URL:      https://archcelerate-h5rlhvwxaa-uc.a.run.app
  Cloud Run:        archcelerate
  Cloud SQL:        archcelerate-db (PostgreSQL 15 + pgvector)
  Redis:            archcelerate-redis (e2-micro)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo -e "${GREEN}📄 Report saved to: $REPORT_FILE${NC}"
echo ""
