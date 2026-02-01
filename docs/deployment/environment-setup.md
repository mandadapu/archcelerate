# Environment Setup Guide

## Overview

The AI Architect Accelerator platform uses environment variables for configuration. This guide covers setting up environment variables for local development, testing, and production.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values (see sections below)

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Files

### `.env.local` (Development)

Your local development environment. **Never commit this file.**

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### `.env.test` (Testing)

Test environment configuration. Safe to commit with placeholder values.

### `.env.production` (Production)

Production environment (managed by deployment platform or docker compose). **Never commit this file.**

## Required Variables

### Database (Prisma + PostgreSQL)

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**Local Development:**
```env
DATABASE_URL=postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate
```

**Docker Compose:**
Uses the postgres service defined in `docker-compose.yml`.

**Production:**
Get from your PostgreSQL provider (AWS RDS, DigitalOcean, Railway, etc.)

### Redis

```env
REDIS_URL=redis://host:port
```

**Local Development:**
```env
REDIS_URL=redis://localhost:6379
```

**Production:**
Get from your Redis provider (Upstash, Redis Cloud, AWS ElastiCache, etc.)

### Authentication (NextAuth.js)

```env
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Production:**
```env
NEXTAUTH_URL=https://yourdomain.com
```

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
```

### AI Services

#### Anthropic (Required)

Get your API key from [Anthropic Console](https://console.anthropic.com/)

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### OpenAI (Optional)

Get your API key from [OpenAI Platform](https://platform.openai.com/)

```env
OPENAI_API_KEY=sk-...
```

#### Tavily (Optional)

Get your API key from [Tavily](https://tavily.com/)

```env
TAVILY_API_KEY=tvly-...
```

## Optional Variables

### Monitoring (Sentry)

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-sentry-token
```

### Analytics (Vercel)

```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

### Feature Flags

```env
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_MULTIMODAL=false
```

## Environment Validation

The application validates environment variables on startup using Zod schemas defined in `src/lib/env.ts`.

**Validation includes:**
- Required variables are present
- URLs are valid
- Secrets meet minimum length requirements
- API keys have correct prefixes

**If validation fails:**
```
❌ Invalid environment variables:
{
  "NEXTAUTH_SECRET": {
    "_errors": [
      "NEXTAUTH_SECRET must be at least 32 characters"
    ]
  }
}
```

Fix the errors and restart the server.

## Setting Up Each Environment

### Local Development

1. Copy example file:
   ```bash
   cp .env.example .env.local
   ```

2. Start Docker services:
   ```bash
   docker-compose up -d postgres redis
   ```

3. Set required variables:
   ```env
   DATABASE_URL=postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate
   REDIS_URL=redis://localhost:6379
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-dev-client-id
   GOOGLE_CLIENT_SECRET=your-dev-secret
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start dev server:
   ```bash
   npm run dev
   ```

### Testing

The `.env.test` file is used automatically when running tests:

```bash
npm test
```

Test environment uses:
- In-memory database (or test database)
- Mock API keys
- Test-specific configuration

### Staging

Set up environment variables in your CI/CD platform (GitHub Actions):

**GitHub Repository Settings → Secrets:**

```
STAGING_DATABASE_URL=postgresql://...
STAGING_REDIS_URL=redis://...
STAGING_NEXTAUTH_SECRET=...
STAGING_NEXTAUTH_URL=https://staging.yourdomain.com
STAGING_GOOGLE_CLIENT_ID=...
STAGING_GOOGLE_CLIENT_SECRET=...
STAGING_ANTHROPIC_API_KEY=...
```

### Production

Set up environment variables in your deployment platform or docker environment:

**GitHub Repository Settings → Secrets:**

```
PROD_DATABASE_URL=postgresql://...
PROD_REDIS_URL=redis://...
PROD_NEXTAUTH_SECRET=...
PROD_NEXTAUTH_URL=https://yourdomain.com
PROD_GOOGLE_CLIENT_ID=...
PROD_GOOGLE_CLIENT_SECRET=...
PROD_ANTHROPIC_API_KEY=...
```

**Or in Docker Compose:**

```yaml
environment:
  DATABASE_URL: ${PROD_DATABASE_URL}
  REDIS_URL: ${PROD_REDIS_URL}
  NEXTAUTH_SECRET: ${PROD_NEXTAUTH_SECRET}
  # ... other variables
```

## Security Best Practices

1. **Never commit `.env.local` or `.env.production`**
   - These files are in `.gitignore`

2. **Use different secrets for each environment**
   - Don't reuse the same NEXTAUTH_SECRET across environments

3. **Rotate secrets regularly**
   - Update API keys and secrets every 90 days

4. **Use environment-specific OAuth clients**
   - Separate Google OAuth clients for dev/staging/prod

5. **Restrict database access**
   - Use different database users with minimal permissions for each environment

6. **Monitor for leaked secrets**
   - Use tools like GitGuardian or GitHub secret scanning

## Troubleshooting

### "Invalid environment variables" error

Check the error message and ensure the variable:
- Is set in your `.env.local` file
- Meets validation requirements (length, format, etc.)
- Has no typos in the variable name

### Database connection errors

Verify:
- PostgreSQL is running (`docker-compose ps`)
- DATABASE_URL is correct (check username, password, host, port, database name)
- Port 5433 is not in use by another service

### Redis connection errors

Verify:
- Redis is running (`docker-compose ps`)
- REDIS_URL is correct
- Port 6379 is not in use

### Authentication not working

Check:
- NEXTAUTH_SECRET is at least 32 characters
- NEXTAUTH_URL matches your current environment
- Google OAuth credentials are correct
- Redirect URIs are configured in Google Console

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
