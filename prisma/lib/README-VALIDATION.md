# Content Sync Validation

Automated validation system to ensure all MDX content files are properly synced with the database.

## Overview

This validation system prevents accidentally missing content files when seeding the database by:
1. Scanning the filesystem for all MDX content files
2. Comparing against database records
3. Reporting any mismatches

## Usage

### Standalone Validation

```bash
# Check content sync (non-strict mode)
npm run validate:content-sync

# Check with strict mode (fails on any mismatch)
npm run validate:content-sync:strict

# Check production database
DATABASE_URL="postgresql://..." npm run validate:content-sync
```

### Automatic Validation in Seed Scripts

The validation runs automatically after seeding in:
- `prisma/seed-all-weeks.ts` - All weeks seeding
- `prisma/seed-skills.ts` - Skill diagnosis system
- `prisma/seed-week2.ts` - Week 2 specific seeding

## How It Works

### File Detection

The validator scans `content/week*/` directories for:
- **Concepts**: `*.mdx` files (excluding lab-* and project-*)
- **Labs**: `lab-*.mdx` files
- **Projects**: `project-*.mdx` files

### Comparison Logic

1. **Filesystem → Database**: Finds files that exist but aren't in DB
2. **Database → Filesystem**: Finds DB records without matching files
3. **Slug Matching**: Matches based on week number, type, and slug

### Output

```
📊 Validation Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Matched:           54
📁 Total files:      79
💾 Total DB records: 75
⚠️  Files only:       25
⚠️  DB only:          21
```

Shows:
- Files in filesystem but NOT in database
- Records in database but NOT in filesystem
- Match statistics

## Integration with Seed Scripts

### Non-Strict Mode (Default)

Seed scripts run validation in non-strict mode by default:
- Reports mismatches but doesn't fail
- Useful for development and manual review

```typescript
await validateContentSync({ failOnMismatch: false })
```

### Strict Mode (CI/CD)

For production deployments, use strict mode:
```bash
FAIL_ON_MISMATCH=true npm run validate:content-sync
```

This will:
- Exit with code 1 if any mismatches found
- Prevent deployment with incomplete content
- Ensure database matches filesystem exactly

## Common Mismatches

### Files Only (Filesystem but not DB)

**Cause**: Content file created but seed script not updated

**Fix**: Add the file to the appropriate seed script:
- Update `prisma/seed-all-weeks.ts` for new concepts
- Update `prisma/seed-week*.ts` for specific weeks

### DB Only (Database but not Filesystem)

**Cause**:
- File was deleted but DB record remains
- File was renamed but slug not updated in seed script

**Fix**:
- Create the missing MDX file, or
- Update seed script to use correct filename, or
- Remove the DB record if content no longer needed

## File Structure

```
prisma/lib/
├── validate-content-sync.ts    # Core validation logic
└── README-VALIDATION.md        # This file

scripts/
└── validate-content-sync.ts    # Standalone CLI script
```

## Examples

### Adding a New Concept

1. Create MDX file: `content/week3/new-concept.mdx`
2. Run validation: `npm run validate:content-sync`
3. See it reported under "Files only"
4. Update `prisma/seed-all-weeks.ts` to include it
5. Run seed: `npm run db:seed`
6. Validation now shows it as matched ✓

### Renaming a Concept

1. Rename file: `old-name.mdx` → `new-name.mdx`
2. Update seed script slug: `old-name` → `new-name`
3. Run seed to update database
4. Validation shows perfect sync ✓

## Benefits

- ✅ Prevents missing content in production
- ✅ Catches renamed/moved files
- ✅ Identifies orphaned database records
- ✅ Ensures filesystem and DB stay in sync
- ✅ Automatic validation on every seed
- ✅ Can fail CI/CD if sync issues detected

## Troubleshooting

**Q: Validation shows many mismatches after fresh clone**

A: Run seed scripts to populate database:
```bash
npm run db:seed
npm run validate:content-sync
```

**Q: Files exist but validation doesn't find them**

A: Check file naming convention:
- Concepts: `week3/concept-name.mdx`
- Labs: `week3/lab-slug.mdx`
- Projects: `week3/project-slug.mdx`

**Q: Database has record but file is missing**

A: Either create the missing file or remove the stale DB record by updating and re-running the seed script.
