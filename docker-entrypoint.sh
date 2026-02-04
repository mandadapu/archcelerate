#!/bin/sh
set -e

echo "🔍 Checking Prisma setup..."
ls -la node_modules/.bin/prisma || echo "❌ Prisma binary not found"

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
