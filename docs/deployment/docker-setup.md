# Docker Setup Guide

## Overview

This application uses Docker and Docker Compose for containerized development and deployment. The setup includes:

- **PostgreSQL 16**: Primary database
- **Redis 7**: Caching layer
- **Next.js App**: Application server with Prisma ORM

## Prerequisites

- Docker Desktop 4.0+ or Docker Engine 20.10+
- Docker Compose V2

## Local Development

### Start All Services

```bash
docker-compose up
```

Or run in detached mode:

```bash
docker-compose up -d
```

The application will be available at http://localhost:3000

### Rebuild After Code Changes

```bash
docker-compose up --build
```

### Stop Services

```bash
docker-compose down
```

### Clean Volumes (Reset Database)

```bash
docker-compose down -v
```

**Warning**: This deletes all data in the PostgreSQL and Redis volumes.

### Run Database Migrations

After starting services, run migrations:

```bash
docker-compose exec app npx prisma migrate deploy
```

Or for development migrations:

```bash
docker-compose exec app npx prisma migrate dev
```

## Production Build

### Build Production Image

```bash
docker build -t archcelerate:latest .
```

### Run Production Container

```bash
docker run -d \
  --name archcelerate-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/db" \
  -e REDIS_URL="redis://host:6379" \
  -e NEXTAUTH_SECRET="your-secret-min-32-chars" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e GOOGLE_CLIENT_ID="your-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-client-secret" \
  archcelerate:latest
```

## Environment Variables

Required environment variables for the app container:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://host:6379` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (min 32 chars) | `your-secret-key` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-secret` |

For local development, these are configured in `docker-compose.yml`.

## Troubleshooting

### Check Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Access Container Shell

```bash
# App container
docker-compose exec app sh

# PostgreSQL container
docker-compose exec postgres psql -U archcelerate
```

### Health Checks

Check if services are healthy:

```bash
docker-compose ps
```

All services should show "healthy" status.

### Common Issues

**Issue**: App fails to connect to database
- **Solution**: Ensure postgres service is healthy before app starts (health check dependency in docker-compose.yml)
- **Check**: `docker-compose logs postgres`

**Issue**: Prisma Client errors
- **Solution**: Rebuild the app container to regenerate Prisma Client
  ```bash
  docker-compose up --build app
  ```

**Issue**: Port 3000 already in use
- **Solution**: Stop existing Next.js dev server or change port in docker-compose.yml

**Issue**: Build fails with "EACCES: permission denied"
- **Solution**: Check file permissions, ensure Docker has access to the project directory

## Architecture Notes

### Multi-Stage Build

The Dockerfile uses a multi-stage build:

1. **Builder stage**: Installs dependencies, generates Prisma Client, builds Next.js app
2. **Runner stage**: Minimal production image with only built assets and runtime dependencies

This reduces final image size and improves security.

### Prisma in Docker

Prisma Client is generated during the build process and copied to the production image. The generated client is platform-specific (linux-musl for Alpine).

### Volume Mounts

For local development, the docker-compose configuration mounts:
- `.:/app` - Source code (live reload)
- `/app/node_modules` - Prevents local node_modules from overriding container
- `/app/.next` - Prevents local build artifacts from interfering

## Database Initialization

The postgres service runs `docker/postgres/init.sql` on first startup, which:

- Enables `pg_trgm` and `btree_gin` extensions
- Grants permissions to the `archcelerate` user
- Notes that `pgvector` extension needs manual installation if required

## Next Steps

After Docker setup:

1. Run database migrations
2. Seed initial data (if applicable)
3. Verify application is accessible
4. Check all environment variables are configured
