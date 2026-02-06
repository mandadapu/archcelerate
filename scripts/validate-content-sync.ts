#!/usr/bin/env tsx
/**
 * Standalone script to validate content sync between filesystem and database
 *
 * Usage:
 *   npm run validate-content-sync
 *
 * Or with strict mode (fails on any mismatch):
 *   FAIL_ON_MISMATCH=true npm run validate-content-sync
 *
 * Or for production database:
 *   DATABASE_URL="postgresql://..." npm run validate-content-sync
 */

import { validateContentSync } from '../prisma/lib/validate-content-sync'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const failOnMismatch = process.env.FAIL_ON_MISMATCH === 'true'

  console.log('🔍 Content Sync Validation\n')
  console.log('Database:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') || 'default')
  console.log('Fail on mismatch:', failOnMismatch ? 'YES' : 'NO')
  console.log()

  try {
    const result = await validateContentSync({ failOnMismatch })

    if (result.filesystemOnly.length > 0 || result.databaseOnly.length > 0) {
      console.log('💡 Suggestions:')
      console.log('  1. Run seed scripts to update database')
      console.log('  2. Check for renamed/moved files')
      console.log('  3. Verify week numbers in filenames match database\n')

      if (!failOnMismatch) {
        console.log('⚠️  Mismatches found but not failing (FAIL_ON_MISMATCH=false)\n')
      }
    }

    process.exit(result.filesystemOnly.length + result.databaseOnly.length > 0 && failOnMismatch ? 1 : 0)
  } catch (error) {
    console.error('❌ Validation error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
