// Manual Testing Checklist Generator
// This creates a comprehensive testing guide for the industry scenario labs

const testingChecklist = `
# Industry Scenario Labs - Manual Testing Checklist

## Prerequisites
- [ ] Development server running (\`npm run dev\`)
- [ ] Database seeded with lab activities
- [ ] User account created and logged in
- [ ] Browser DevTools open (Console tab)

---

## Test 1: Week 1 - Multi-Tier Triage Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-1\`
2. [ ] Locate "Multi-Tier Triage System" lab card
3. [ ] Click to open lab

### Skill Impact Preview
4. [ ] Verify "Skill Impact" card is visible above lab content
5. [ ] Verify it shows:
   - Systematic Prompting: +40 pts (PRIMARY badge)
   - Production Observability: +10 pts (Secondary badge)

### Lab Completion Flow
6. [ ] Complete Exercise 1: Haiku Classifier
7. [ ] Submit code and verify tests pass
8. [ ] Complete remaining exercises (2-4)
9. [ ] After final submission, verify:
   - [ ] "Lab Complete" success message appears
   - [ ] Console shows: \`✅ Skill scores updated for user [id], lab w1-multi-tier-triage-lab\`
   - [ ] Link to diagnosis results is present

### Radar Chart Verification
10. [ ] Click link to \`/diagnosis/results\`
11. [ ] Verify radar chart updated:
    - [ ] Systematic Prompting domain increased (~40 pts)
    - [ ] Production Observability increased (~10 pts)
12. [ ] Take screenshot for reference

---

## Test 2: Week 2 - HIPAA Gateway Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-2\`
2. [ ] Locate "HIPAA-Compliant Gateway" lab
3. [ ] Open lab

### Verification
4. [ ] Skill Impact Preview shows:
   - Sovereign Governance: +50 pts (PRIMARY)
   - Interface Engineering: +10 pts (Secondary)
5. [ ] Complete all exercises
6. [ ] Verify skill scores update
7. [ ] Check radar chart:
   - [ ] Sovereign Governance +50 pts

---

## Test 3: Week 4 - Support Ticket Router Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-4\`
2. [ ] Open "Support Ticket Router" lab

### Verification
3. [ ] Skill Impact Preview shows:
   - Interface Engineering: +45 pts (PRIMARY)
   - Systematic Prompting: +15 pts (Secondary)
   - Agentic Orchestration: +10 pts (Secondary)
4. [ ] Complete exercises (including Exercise 3.5 - tool calling)
5. [ ] Verify completion triggers score update
6. [ ] Check radar: Interface Engineering increased

---

## Test 4: Week 5 - Research Swarm Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-5\`
2. [ ] Open "Autonomous Medical Research Swarm" lab

### Verification
3. [ ] Skill Impact Preview:
   - Agentic Orchestration: +50 pts (PRIMARY)
   - Knowledge Architecture: +10 pts (Secondary)
4. [ ] Complete multi-agent exercises
5. [ ] Verify scores update
6. [ ] Check radar: Agentic Orchestration +50 pts

---

## Test 5: Week 6 - Clinical RAG Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-6\`
2. [ ] Open "Clinical RAG System" lab

### Verification
3. [ ] Skill Impact Preview:
   - Knowledge Architecture: +40 pts (PRIMARY)
   - Retrieval Optimization: +20 pts (Secondary)
4. [ ] Complete hybrid search + reranking exercises
5. [ ] Verify scores update
6. [ ] Check radar: Knowledge Architecture +40, Retrieval Optimization +20

---

## Test 6: Week 7 - LLM Judge Pipeline Lab

### Setup
1. [ ] Navigate to \`http://localhost:3000/curriculum/week-7\`
2. [ ] Open "LLM-as-a-Judge Pipeline" lab

### Verification
3. [ ] Skill Impact Preview:
   - Production Observability: +50 pts (PRIMARY)
   - Systematic Prompting: +10 pts (Secondary)
4. [ ] Complete evaluation pipeline exercises
5. [ ] Verify scores update
6. [ ] Check radar: Production Observability +50 pts

---

## Integration Tests

### Database Verification
\`\`\`bash
# Run this to verify database state
export \$(grep DATABASE_URL .env.local | xargs) && npx tsx scripts/verify-lab-activities.ts
\`\`\`

### API Endpoint Test
\`\`\`bash
# Test lab submission API (requires auth token)
curl -X POST http://localhost:3000/api/labs/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "sprintId": "week-1",
    "conceptId": "architecture-decisions",
    "labSlug": "w1-multi-tier-triage-lab",
    "code": "console.log(42)",
    "testCases": [{ "input": "42", "expectedOutput": "42" }]
  }'
\`\`\`

---

## Validation Criteria

### ✅ Success Criteria
- [ ] All 6 labs have Skill Impact Preview visible
- [ ] All labs trigger skill score updates on completion
- [ ] Radar chart reflects accurate point increases
- [ ] No console errors during lab submission
- [ ] Database queries show correct mappings

### ⚠️ Known Issues to Watch For
- Skill Impact Preview returns null → Lab slug mismatch
- Scores don't update → Check \`updateUserSkillScores()\` call in API
- Wrong point values → Domain mapping misconfiguration

---

## Troubleshooting

### Skill Impact Preview Not Showing
\`\`\`typescript
// Check if component is imported in lab page
import { SkillImpactPreview } from '@/components/lab/SkillImpactPreview'

// Verify usage
<SkillImpactPreview labSlug="w1-multi-tier-triage-lab" />
\`\`\`

### Scores Not Updating
\`\`\`bash
# Check API logs
tail -f logs/api.log

# Verify activity exists
export \$(grep DATABASE_URL .env.local | xargs) && npx tsx -e "
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
prisma.activity.findFirst({ where: { slug: 'w1-multi-tier-triage-lab' }})
  .then(console.log)
  .then(() => prisma.\$disconnect())
"
\`\`\`

### Database State Reset (if needed)
\`\`\`bash
# Reset skill scores for a user
export \$(grep DATABASE_URL .env.local | xargs) && npx tsx -e "
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function reset() {
  await prisma.userSkillScore.deleteMany({ where: { userId: 'USER_ID_HERE' }})
  await prisma.userActivityScore.deleteMany({ where: { userId: 'USER_ID_HERE' }})
  console.log('Scores reset')
}
reset().then(() => prisma.\$disconnect())
"
\`\`\`

---

## Expected Outcomes

After completing all 6 labs, the radar chart should show:

| Domain | Expected Points (Approx) |
|--------|--------------------------|
| Systematic Prompting | ~105 pts |
| Sovereign Governance | ~50 pts |
| Interface Engineering | ~70 pts |
| Agentic Orchestration | ~110 pts |
| Knowledge Architecture | ~90 pts |
| Retrieval Optimization | ~20 pts |
| Production Observability | ~70 pts |

---

## Sign-off

- [ ] All 6 labs tested successfully
- [ ] Skill scores update correctly
- [ ] Radar chart reflects accurate data
- [ ] No critical errors encountered
- [ ] Ready for production deployment

**Tested by**: _______________
**Date**: _______________
**Notes**: _______________

`

console.log(testingChecklist)

