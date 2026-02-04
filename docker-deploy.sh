#!/bin/bash

set -e

echo "🐳 Archcelerate Docker Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating .env from .env.docker template..."
    cp .env.docker .env
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your API keys:${NC}"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - OPENAI_API_KEY"
    echo "   - VOYAGE_API_KEY"
    echo "   - TAVILY_API_KEY"
    echo ""
    read -p "Press Enter to continue (make sure you've added your keys)..."
fi

echo "📦 Building and starting services..."
echo ""

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."

# Wait for postgres
echo -n "   PostgreSQL: "
until docker exec archcelerate-db pg_isready -U archcelerate > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e " ${GREEN}✅${NC}"

# Wait for redis
echo -n "   Redis: "
until docker exec archcelerate-redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e " ${GREEN}✅${NC}"

echo ""
echo "🔄 Running database migrations..."
docker exec archcelerate-app npx prisma migrate deploy

echo ""
echo "🌱 Seeding database (optional - may take a few minutes)..."
read -p "Do you want to seed the database? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker exec archcelerate-app npx prisma db seed || echo "⚠️  Seeding failed (this is optional)"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   - App: http://localhost:3000"
echo "   - PostgreSQL: localhost:5433"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   View app logs:    docker-compose logs -f app"
echo "   Stop services:    docker-compose down"
echo "   Restart app:      docker-compose restart app"
echo "   Shell into app:   docker exec -it archcelerate-app sh"
echo ""
