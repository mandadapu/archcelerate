# Week 2 Deployment Guide

Complete guide for deploying the production chat application with governance.

## Prerequisites

- GitHub account
- Vercel account (or preferred hosting platform)
- Supabase project
- Upstash Redis account
- Anthropic API key

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

### Getting API Keys

**Anthropic API Key:**
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new key
4. Copy and save securely

**Supabase:**
1. Create project at https://supabase.com
2. Go to Settings → API
3. Copy Project URL and anon public key
4. Copy service_role key (keep secret!)

**Upstash Redis:**
1. Create account at https://upstash.com
2. Create new Redis database
3. Copy REST URL and REST Token

## Database Setup

### 1. Run Migrations

```bash
# Start Supabase locally (for testing)
npx supabase start

# Or use remote Supabase
npx supabase link --project-ref your-project-ref

# Apply migrations
npx supabase db push
```

### 2. Seed Data

```bash
# Run seed file
npx supabase db seed
```

### 3. Verify Tables

Ensure these tables exist:
- curriculum_weeks
- concepts
- labs
- lab_submissions
- projects
- project_submissions
- user_week_progress
- llm_requests
- moderation_logs
- user_budgets
- audit_logs
- conversations
- messages

## Deployment to Vercel

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Or use the Vercel Dashboard:
1. Import your GitHub repository
2. Vercel will auto-detect Next.js
3. Configure environment variables

### 2. Environment Variables in Vercel

Add all environment variables from `.env.local`:

1. Go to Project Settings → Environment Variables
2. Add each variable
3. Ensure `NEXT_PUBLIC_URL` points to your production URL

### 3. Database Connection

Ensure your Supabase project allows connections from Vercel:

1. Supabase Dashboard → Settings → Database
2. Add Vercel IP ranges if using SQL directly
3. RLS policies should work automatically

### 4. Deploy

```bash
# Production deployment
vercel --prod
```

## Monitoring Setup

### 1. Supabase Dashboard

Monitor database performance:
- Database → Query Performance
- Database → Table Editor (check data)
- Authentication → Users

### 2. Vercel Analytics

Enable Vercel Analytics:

```bash
npm install @vercel/analytics
```

Add to your `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 3. Application Monitoring

Use the built-in governance dashboard:

- Navigate to `/governance`
- Monitor:
  - Total spend
  - API request count
  - Average latency
  - Flagged content
  - Budget usage
  - Recent audit logs

### 4. Error Tracking (Recommended)

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

Configure in `sentry.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### 5. Uptime Monitoring

Use Vercel's built-in uptime checks or:
- UptimeRobot (free)
- Pingdom
- Better Uptime

### 6. Log Aggregation

All governance logs are stored in Supabase:
- Query `llm_requests` for API usage
- Query `audit_logs` for user actions
- Query `moderation_logs` for content filtering

Create views for common queries:

```sql
-- Daily cost by user
CREATE VIEW daily_costs AS
SELECT
  user_id,
  DATE(created_at) as date,
  SUM(cost) as total_cost,
  COUNT(*) as request_count
FROM llm_requests
GROUP BY user_id, DATE(created_at)
ORDER BY date DESC;
```

## Performance Optimization

### 1. Enable Edge Functions (Optional)

For global low latency, deploy API routes to edge:

```typescript
// app/api/chat/route.ts
export const runtime = 'edge'
```

### 2. Caching

Implement caching for common queries:

```typescript
import { unstable_cache } from 'next/cache'

export const getCachedUsageStats = unstable_cache(
  async (userId: string) => {
    return await getUsageStats(userId)
  },
  ['usage-stats'],
  { revalidate: 60 } // Cache for 60 seconds
)
```

### 3. Database Indexes

Ensure indexes are created (already in migrations):
- `idx_llm_requests_user_created`
- `idx_moderation_logs_user_created`
- `idx_messages_conversation`
- `idx_audit_logs_user_created`

## Security Checklist

- [ ] All environment variables are secret (not committed)
- [ ] RLS policies are enabled on all tables
- [ ] API keys are not exposed in client code
- [ ] Rate limiting is active
- [ ] Content moderation is enabled
- [ ] Input validation is working
- [ ] Budget limits are enforced
- [ ] Audit logging is capturing all events
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured properly

## Health Checks

### Endpoint Health Check

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database connection
  const dbHealthy = await checkDatabase()

  // Check Redis connection
  const redisHealthy = await checkRedis()

  // Check Anthropic API
  const apiHealthy = await checkAnthropicAPI()

  const healthy = dbHealthy && redisHealthy && apiHealthy

  return Response.json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks: {
      database: dbHealthy,
      redis: redisHealthy,
      anthropic: apiHealthy
    }
  }, {
    status: healthy ? 200 : 503
  })
}
```

### Automated Testing

Run before deployment:

```bash
# Run all tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build locally
npm run build
```

## Scaling Considerations

### Database Scaling

Supabase handles this automatically, but monitor:
- Connection pool size
- Query performance
- Table sizes

### Redis Scaling

Upstash auto-scales, but consider:
- Daily request limits
- Memory usage
- Region selection

### Rate Limits

Current defaults:
- Chat: 10 messages/minute
- Code Review: 3 reviews/hour
- Lab Submissions: 20/hour

Adjust in `lib/governance/rate-limiter.ts` as needed.

### Cost Management

Monitor and adjust:
- User budget limits (default $10/month)
- Model selection (Sonnet vs Haiku)
- Context window optimization
- Caching strategies

## Rollback Plan

If deployment issues occur:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git revert HEAD
vercel --prod
```

## Support and Troubleshooting

Common issues and solutions:

1. **Database connection errors**
   - Check Supabase service status
   - Verify connection string
   - Check RLS policies

2. **Rate limit not working**
   - Verify Redis connection
   - Check UPSTASH_* environment variables
   - Confirm user ID is being passed

3. **High costs**
   - Check `llm_requests` table for usage
   - Verify budget enforcement is working
   - Consider using Haiku for simple tasks

4. **Slow responses**
   - Check database indexes
   - Monitor Anthropic API latency
   - Enable caching
   - Consider edge deployment

## Next Steps

After deployment:
1. Monitor governance dashboard daily
2. Review audit logs weekly
3. Optimize costs based on usage patterns
4. Collect user feedback
5. Iterate on governance rules

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
