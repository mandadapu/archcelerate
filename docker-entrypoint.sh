#!/bin/sh
set -e

echo "🔍 Checking Prisma setup..."
ls -la node_modules/.bin/prisma || echo "❌ Prisma binary not found"

echo "🔧 Applying database hotfixes..."
# Hotfix: Add difficultyLevel column if missing
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const result = await prisma.\$queryRaw\`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'SkillDiagnosis' AND column_name = 'difficultyLevel'
    \`;
    if (result.length === 0) {
      console.log('📝 Adding difficultyLevel column...');
      await prisma.\$executeRaw\`
        ALTER TABLE \"SkillDiagnosis\"
        ADD COLUMN \"difficultyLevel\" TEXT DEFAULT 'intermediate'
      \`;
      console.log('✅ Added difficultyLevel column');
    } else {
      console.log('✅ difficultyLevel column already exists');
    }
  } catch (error) {
    console.error('⚠️  Hotfix error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
})();
" || echo "⚠️  Hotfix failed, continuing..."

echo "🔄 Running database migrations..."
# Use the local Prisma installation (from node_modules) to avoid downloading Prisma 7.x
# The Prisma client is already generated during the Docker build
if [ -x "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma migrate deploy || {
        echo "⚠️  Migration failed, but continuing to start app..."
    }
else
    echo "⚠️  Prisma binary not executable, skipping migrations"
fi

echo "✅ Database setup completed!"
echo "🚀 Starting application..."
exec node server.js
