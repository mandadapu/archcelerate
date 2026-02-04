#!/bin/sh
set -e

# Run migrations only if there are pending migrations
# prisma migrate deploy is idempotent - it only applies unapplied migrations
echo "🔄 Checking for pending database migrations..."
npx prisma migrate deploy

echo "✅ Database is up to date!"
echo "🚀 Starting application..."
exec node server.js
