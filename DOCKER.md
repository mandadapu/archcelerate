# 🐳 Docker Deployment Guide

## Quick Start (Automated)

```bash
# 1. Run the deployment script
./docker-deploy.sh

# 2. Access the app
open http://localhost:3000
```

## Manual Deployment

### Step 1: Set Up Environment Variables

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and add your API keys
vim .env  # or use your preferred editor
```

**Required API Keys:**
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/
- `OPENAI_API_KEY` - Get from https://platform.openai.com/
- `VOYAGE_API_KEY` - Get from https://www.voyageai.com/
- `TAVILY_API_KEY` - Get from https://tavily.com/

### Step 2: Build and Start Services

```bash
# Build and start all services (PostgreSQL, Redis, App)
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Step 3: Initialize Database

```bash
# Run migrations
docker exec archcelerate-app npx prisma migrate deploy

# Seed database (optional)
docker exec archcelerate-app npx prisma db seed
```

### Step 4: Access the Application

- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6379

## Service Architecture

```
┌─────────────────────────────────────────┐
│     archcelerate-app (Next.js)         │
│         Port: 3000                      │
└───────────┬─────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────┐
│ postgres│    │  redis   │
│ :5433   │    │  :6379   │
│ pgvector│    │          │
└─────────┘    └──────────┘
```

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# App only
docker-compose logs -f app

# Database only
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart app only
docker-compose restart app
```

### Stop Services
```bash
# Stop all services (keeps data)
docker-compose down

# Stop and remove volumes (⚠️  deletes all data)
docker-compose down -v
```

### Shell Access
```bash
# Access app container
docker exec -it archcelerate-app sh

# Access database
docker exec -it archcelerate-db psql -U archcelerate -d archcelerate

# Access Redis CLI
docker exec -it archcelerate-redis redis-cli
```

### Database Operations
```bash
# Run migrations
docker exec archcelerate-app npx prisma migrate deploy

# Generate Prisma client
docker exec archcelerate-app npx prisma generate

# Open Prisma Studio
docker exec -it archcelerate-app npx prisma studio
```

## Troubleshooting

### App won't start
```bash
# Check app logs
docker-compose logs app

# Common issues:
# 1. Missing .env file → copy .env.docker to .env
# 2. Invalid API keys → check .env values
# 3. Database not ready → wait 10-20 seconds after starting
```

### Database connection errors
```bash
# Check if postgres is healthy
docker ps

# Should show:
# archcelerate-db    Up (healthy)

# If unhealthy, restart:
docker-compose restart postgres
```

### Port already in use
```bash
# If port 3000 is already in use, edit docker-compose.yml:
# Change "3000:3000" to "3001:3000"

# Or stop the conflicting service:
lsof -ti:3000 | xargs kill -9
```

### Reset everything
```bash
# ⚠️  WARNING: This deletes ALL data
docker-compose down -v
docker rmi archcelerate-app
./docker-deploy.sh
```

## Development vs Production

### Current Setup (Production Build)
- Optimized Next.js build
- No hot reload
- Smaller image size
- Better performance

### Enable Development Mode (Hot Reload)
Edit `docker-compose.yml` and uncomment:
```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

Then rebuild:
```bash
docker-compose up -d --build
```

## Monitoring

### Check Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks
```bash
# All services should show "Up (healthy)"
docker-compose ps
```

## Updating the App

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run new migrations
docker exec archcelerate-app npx prisma migrate deploy
```

## Backup & Restore

### Backup Database
```bash
# Create backup
docker exec archcelerate-db pg_dump -U archcelerate archcelerate > backup.sql

# Or use Docker volume backup
docker run --rm \
  -v archcelerate_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Restore Database
```bash
# From SQL dump
cat backup.sql | docker exec -i archcelerate-db psql -U archcelerate -d archcelerate

# From volume backup
docker run --rm \
  -v archcelerate_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection | ✅ | Set by docker-compose |
| `REDIS_URL` | Redis connection | ✅ | Set by docker-compose |
| `ANTHROPIC_API_KEY` | Claude API key | ✅ | - |
| `OPENAI_API_KEY` | OpenAI API key | ✅ | - |
| `VOYAGE_API_KEY` | Voyage embeddings | ✅ | - |
| `TAVILY_API_KEY` | Tavily search | ✅ | - |
| `NEXTAUTH_SECRET` | Auth encryption key | ✅ | Set in .env |
| `NEXTAUTH_URL` | App URL | ✅ | http://localhost:3000 |
| `GOOGLE_CLIENT_ID` | Google OAuth | ❌ | dummy |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth | ❌ | dummy |
| `ADMIN_REFRESH_KEY` | Admin operations | ❌ | change-me |

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/mandadapu/archcelerate/issues
- Documentation: See README.md

---

**Note**: This Docker setup is for local development/testing. For production deployment, use Vercel or configure additional security measures.
