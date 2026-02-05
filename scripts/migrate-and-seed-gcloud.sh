#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   🚀 Migrate & Seed Google Cloud Database${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ No GCP project configured${NC}"
  echo -e "${YELLOW}Run: gcloud config set project YOUR_PROJECT_ID${NC}"
  exit 1
fi

echo -e "${BLUE}Project:${NC} $PROJECT_ID"

# Get database password from secrets
echo -e "${YELLOW}Retrieving database credentials...${NC}"
DB_PASSWORD=$(gcloud secrets versions access latest --secret=DB_PASSWORD --project=$PROJECT_ID 2>/dev/null)
if [ -z "$DB_PASSWORD" ]; then
  echo -e "${RED}❌ Could not retrieve database password from secrets${NC}"
  echo -e "${YELLOW}Make sure DB_PASSWORD secret exists in Secret Manager${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Database password retrieved${NC}"

# Get database instance IP
echo -e "${YELLOW}Getting database host...${NC}"
DB_HOST=$(gcloud sql instances describe archcelerate-db --project=$PROJECT_ID --format="value(ipAddresses[0].ipAddress)")
if [ -z "$DB_HOST" ]; then
  echo -e "${RED}❌ Could not retrieve database host${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Database host:${NC} $DB_HOST"

# Set database URL
export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/archcelerate?schema=public"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Step 1: Running Database Migrations${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}Checking migration status...${NC}"
npx prisma migrate status

echo -e "${YELLOW}Deploying pending migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Migrations deployed successfully${NC}"
else
  echo -e "${RED}❌ Migration deployment failed${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Step 2: Seeding Curriculum Content (All 12 Weeks)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Seed all weeks
echo -e "${YELLOW}Running seed-all-weeks.ts...${NC}"
npx tsx prisma/seed-all-weeks.ts
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All 12 weeks seeded successfully${NC}"
else
  echo -e "${YELLOW}⚠ Weeks may already be seeded (continuing...)${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Step 3: Seeding Skill Diagnosis System${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Seed skill diagnosis system
echo -e "${YELLOW}Running seed-skills.ts...${NC}"
echo -e "${BLUE}This includes:${NC}"
echo "  - 7 skill domains"
echo "  - 29 activities (12 labs + 17 projects)"
echo "  - 92 activity-domain mappings"
echo "  - 6 NEW industry-specific labs:"
echo "    • Week 1: Multi-Tier Triage System"
echo "    • Week 2: HIPAA-Compliant Gateway"
echo "    • Week 4: Support Auto-Router (enhanced)"
echo "    • Week 5: Medical Research Swarm"
echo "    • Week 6: Clinical RAG System"
echo "    • Week 7: LLM-as-a-Judge Pipeline"
echo ""

npx tsx prisma/seed-skills.ts
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Skill diagnosis system seeded successfully${NC}"
else
  echo -e "${RED}❌ Failed to seed skill diagnosis system${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Step 4: Verifying Seeded Data${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verify using Prisma
echo -e "${YELLOW}Verifying database content...${NC}"

# Create verification script
cat > /tmp/verify-seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  try {
    // Check curriculum weeks
    const weeks = await prisma.curriculumWeek.count()
    console.log(`✓ Curriculum Weeks: ${weeks}/12`)

    // Check skill domains
    const domains = await prisma.skillDomain.count()
    console.log(`✓ Skill Domains: ${domains}/7`)

    // Check activities
    const activities = await prisma.activity.count()
    console.log(`✓ Activities: ${activities}`)

    // Check activity-domain mappings
    const mappings = await prisma.activityDomainMapping.count()
    console.log(`✓ Activity-Domain Mappings: ${mappings}`)

    // Check new industry-specific labs
    const industryLabs = await prisma.activity.findMany({
      where: {
        slug: {
          in: [
            'w1-multi-tier-triage-lab',
            'w2-hipaa-gateway-lab',
            'w4-support-ticket-router-lab',
            'w5-research-swarm-lab',
            'w6-clinical-rag-lab',
            'w7-llm-judge-lab'
          ]
        }
      },
      include: {
        domainMappings: {
          include: { domain: true }
        }
      }
    })

    console.log(`\n📊 Industry-Specific Labs Verified:`)
    industryLabs.forEach(lab => {
      const primaryDomain = lab.domainMappings.find(m => m.isPrimary)
      console.log(`  ✓ ${lab.title}`)
      console.log(`    Primary: ${primaryDomain?.domain.name} (${primaryDomain?.maxPoints} pts)`)
    })

    if (weeks === 12 && domains === 7 && industryLabs.length === 6) {
      console.log(`\n✅ All data verified successfully!`)
      process.exit(0)
    } else {
      console.log(`\n⚠ Some data may be missing`)
      console.log(`   Weeks: ${weeks}/12, Domains: ${domains}/7, Industry Labs: ${industryLabs.length}/6`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Verification error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
EOF

npx tsx /tmp/verify-seed.ts
VERIFY_STATUS=$?

# Cleanup
rm /tmp/verify-seed.ts

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✅ Migration & Seeding Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Production URLs:${NC}"
echo "  • Homepage:     https://archcelerate.com"
echo "  • Diagnosis:    https://archcelerate.com/diagnosis"
echo "  • Curriculum:   https://archcelerate.com/curriculum/week-1"
echo "  • Results:      https://archcelerate.com/diagnosis/results"
echo ""
echo -e "${BLUE}Test Scenario:${NC}"
echo "  1. Sign in with Google OAuth"
echo "  2. Complete Week 1 Multi-Tier Triage lab"
echo "  3. View updated radar chart at /diagnosis/results"
echo "  4. Verify Systematic Prompting increased by 40 pts"
echo ""
echo -e "${BLUE}Monitoring:${NC}"
echo "  • Cloud SQL:   https://console.cloud.google.com/sql/instances/archcelerate-db?project=$PROJECT_ID"
echo "  • Cloud Run:   https://console.cloud.google.com/run/detail/us-central1/archcelerate?project=$PROJECT_ID"
echo "  • Secrets:     https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo ""

if [ $VERIFY_STATUS -eq 0 ]; then
  exit 0
else
  echo -e "${YELLOW}⚠ Seeding completed with warnings${NC}"
  exit 1
fi
