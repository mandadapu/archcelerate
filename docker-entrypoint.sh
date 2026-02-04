#!/bin/sh
set -e

echo "🔄 Running database migrations..."
# Use the local Prisma installation (from node_modules) to avoid downloading Prisma 7.x
# The Prisma client is already generated during the Docker build
node_modules/.bin/prisma migrate deploy

echo "✅ Database migrations completed!"
echo "🚀 Starting application..."
exec node server.js
