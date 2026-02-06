/**
 * MDX Validation Module for Seed Scripts
 *
 * Ensures all MDX content is validated and auto-fixed before seeding to database.
 * This prevents runtime "Failed to load concept content" errors.
 */

import { execSync } from 'child_process'
import * as path from 'path'

export async function validateAndFixMDX(): Promise<void> {
  console.log('🔍 Validating MDX content before seeding...\n')

  const scriptPath = path.join(__dirname, '../../scripts/validate-mdx-syntax.ts')

  try {
    // First run validation to check for errors
    console.log('📋 Checking for MDX syntax errors...')
    execSync(`npx tsx "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    })

    console.log('\n✅ All MDX files are valid!\n')
  } catch (error) {
    // If validation fails, run auto-fix
    console.log('\n⚠️  MDX syntax errors found. Running auto-fix...\n')

    try {
      execSync(`npx tsx "${scriptPath}" --fix`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      })

      console.log('\n🔧 Auto-fix completed. Verifying fixes...\n')

      // Verify fixes worked
      execSync(`npx tsx "${scriptPath}"`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      })

      console.log('\n✅ All MDX files validated and fixed!\n')
    } catch (fixError) {
      console.error('\n❌ Auto-fix failed or validation still failing after fix.')
      console.error('Please manually review and fix the MDX syntax errors.\n')
      throw new Error('MDX validation failed - cannot proceed with seeding')
    }
  }
}

export async function validateMDXOrExit(): Promise<void> {
  try {
    await validateAndFixMDX()
  } catch (error) {
    console.error('\n❌ MDX validation failed. Database seeding aborted.')
    console.error('Fix the MDX errors before seeding the database.\n')
    process.exit(1)
  }
}
