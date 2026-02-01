# Sprint 5: Production Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create Sprint 5 content teaching learners to deploy, scale, and maintain production-ready AI applications with reliability engineering practices.

**Architecture:** Following Sprint 3/4's pattern - 3 comprehensive MDX concepts, 4 interactive lab exercises with test cases, 1 real-world project specification, dashboard integration, and complete documentation.

**Tech Stack:** Next.js, TypeScript, MDX, Redis (Upstash), Sentry, Vercel, Monitoring tools

---

## Task 1: Create Sprint 5 Content Structure

**Files:**
- Create: `content/sprints/sprint-5/metadata.json`
- Create: `content/sprints/sprint-5/concepts/` (directory)
- Create: `content/sprints/sprint-5/labs/` (directory)

**Step 1: Create metadata.json**

Create `content/sprints/sprint-5/metadata.json`:

```json
{
  "id": "sprint-5",
  "title": "Production Deployment (Scale & Reliability)",
  "description": "Deploy and scale AI applications with monitoring, caching, and error handling for production reliability",
  "order": 5,
  "concepts": [
    {
      "id": "cost-optimization",
      "title": "Cost Optimization & Caching Strategies",
      "description": "Optimize API costs through intelligent caching and resource management",
      "difficulty": "intermediate",
      "order": 1,
      "estimatedMinutes": 60,
      "prerequisites": ["chat-assistant", "tool-use"],
      "tags": ["caching", "cost", "optimization", "redis", "production"]
    },
    {
      "id": "monitoring-observability",
      "title": "Monitoring & Observability",
      "description": "Build observable systems with logging, metrics, and error tracking",
      "difficulty": "intermediate",
      "order": 2,
      "estimatedMinutes": 75,
      "prerequisites": ["cost-optimization"],
      "tags": ["monitoring", "sentry", "logging", "metrics", "observability"]
    },
    {
      "id": "error-handling",
      "title": "Error Handling & Fallbacks",
      "description": "Implement robust error handling with retry logic and graceful degradation",
      "difficulty": "advanced",
      "order": 3,
      "estimatedMinutes": 90,
      "prerequisites": ["monitoring-observability"],
      "tags": ["errors", "retry", "fallbacks", "reliability", "resilience"]
    }
  ]
}
```

**Step 2: Create directory structure**

```bash
mkdir -p content/sprints/sprint-5/concepts
mkdir -p content/sprints/sprint-5/labs
```

**Step 3: Verify structure**

```bash
ls -la content/sprints/sprint-5/
cat content/sprints/sprint-5/metadata.json
```

Expected: Directory structure created, metadata.json contains valid JSON with 3 concepts.

**Step 4: Commit**

```bash
git add content/sprints/sprint-5/
git commit -m "feat: add Sprint 5 metadata structure

- Added metadata.json with 3 concepts
- Created directory structure for concepts and labs
- Sprint 5: Production Deployment (Scale & Reliability)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Concept 1 - Cost Optimization & Caching Strategies

**Files:**
- Create: `content/sprints/sprint-5/concepts/cost-optimization.mdx`

**Step 1: Write cost optimization concept**

Create comprehensive MDX content covering:
- Understanding AI API costs (tokens, pricing models)
- Caching strategies (response caching, semantic caching, function result caching)
- Redis for distributed caching with Upstash
- Cache invalidation patterns
- Cost monitoring and budgets
- Optimization techniques (prompt compression, model selection, batching)
- ROI calculation for AI features

Target: 500-700 lines of comprehensive content (intermediate difficulty).

Use proper MDX format with:
- Frontmatter matching metadata.json
- Code examples with TypeScript
- Mermaid diagrams for caching architectures
- Real-world cost calculations
- Best practices for production

**Step 2: Commit**

```bash
git add content/sprints/sprint-5/concepts/cost-optimization.mdx
git commit -m "feat: add cost optimization & caching strategies concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Concept 2 - Monitoring & Observability

**Files:**
- Create: `content/sprints/sprint-5/concepts/monitoring-observability.mdx`

**Step 1: Write monitoring & observability concept**

Create comprehensive MDX content covering:
- Why observability matters in AI systems
- Three pillars: Logs, Metrics, Traces
- Structured logging with Winston/Pino
- Error tracking with Sentry
- Performance monitoring (latency, throughput, error rates)
- Custom metrics and dashboards
- Alerting strategies
- Debugging production issues
- Cost vs value of observability

Target: 600-800 lines of comprehensive content (intermediate difficulty).

**Step 2: Commit**

```bash
git add content/sprints/sprint-5/concepts/monitoring-observability.mdx
git commit -m "feat: add monitoring & observability concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Concept 3 - Error Handling & Fallbacks

**Files:**
- Create: `content/sprints/sprint-5/concepts/error-handling.mdx`

**Step 1: Write error handling concept**

Create comprehensive MDX content covering:
- Types of errors in AI systems (API failures, timeouts, rate limits, invalid responses)
- Retry strategies (exponential backoff, jitter, circuit breakers)
- Graceful degradation and fallback patterns
- Timeout handling
- Rate limiting (client-side and server-side)
- Error boundaries in React
- User-friendly error messages
- Recovery strategies
- Testing error scenarios

Target: 700-900 lines of comprehensive content (advanced difficulty).

**Step 2: Commit**

```bash
git add content/sprints/sprint-5/concepts/error-handling.mdx
git commit -m "feat: add error handling & fallbacks concept content

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Lab Exercises Specifications

**Files:**
- Create: `content/sprints/sprint-5/labs/lab-1-rate-limiting.json`
- Create: `content/sprints/sprint-5/labs/lab-2-caching.json`
- Create: `content/sprints/sprint-5/labs/lab-3-monitoring.json`
- Create: `content/sprints/sprint-5/labs/lab-4-retry-logic.json`

**Step 1: Create Lab 1 - Implement Rate Limiting with Redis**

Create `content/sprints/sprint-5/labs/lab-1-rate-limiting.json`:

```json
{
  "id": "lab-1-rate-limiting",
  "title": "Implement Rate Limiting with Redis",
  "description": "Build a rate limiter using Redis to control API request frequency",
  "difficulty": "intermediate",
  "estimatedMinutes": 45,
  "language": "javascript",
  "starterCode": "/**\n * Rate limiter using Redis\n * @param {string} userId - User identifier\n * @param {number} maxRequests - Maximum requests allowed\n * @param {number} windowMs - Time window in milliseconds\n * @returns {Promise<{allowed: boolean, remaining: number}>}\n */\nasync function checkRateLimit(userId, maxRequests, windowMs) {\n  // Your code here\n  // Use Redis to track request count per user\n  return { allowed: false, remaining: 0 }\n}\n\n/**\n * Sliding window rate limiter (more accurate)\n * @param {string} key - Rate limit key\n * @param {number} limit - Request limit\n * @param {number} windowMs - Time window\n * @returns {Promise<boolean>}\n */\nasync function slidingWindowRateLimit(key, limit, windowMs) {\n  // Your code here\n  return false\n}\n",
  "instructions": "Implement rate limiting functions:\n1. `checkRateLimit(userId, maxRequests, windowMs)`: Basic fixed window rate limiter\n   - Use Redis INCR and EXPIRE commands\n   - Track requests per user in time window\n   - Return allowed status and remaining requests\n\n2. `slidingWindowRateLimit(key, limit, windowMs)`: Sliding window implementation\n   - Use Redis sorted sets with timestamps\n   - Remove old entries outside window\n   - Count entries in current window\n   - More accurate than fixed window\n\nRedis commands:\n- INCR: Increment counter\n- EXPIRE: Set key expiration\n- ZADD: Add to sorted set with score\n- ZREMRANGEBYSCORE: Remove by score range\n- ZCARD: Count set members",
  "testCases": [
    {
      "input": "await checkRateLimit('user1', 10, 60000); // First request",
      "expectedOutput": "{allowed: true, remaining: 9}",
      "description": "Allows first request within limit"
    },
    {
      "input": "// After 10 requests: await checkRateLimit('user1', 10, 60000)",
      "expectedOutput": "{allowed: false, remaining: 0}",
      "description": "Blocks request when limit exceeded"
    },
    {
      "input": "await slidingWindowRateLimit('api:user2', 5, 60000)",
      "expectedOutput": "true",
      "description": "Sliding window allows within limit"
    },
    {
      "input": "// After window expires: await checkRateLimit('user1', 10, 60000)",
      "expectedOutput": "{allowed: true, remaining: 9}",
      "description": "Resets after window expires"
    }
  ],
  "hints": [
    "Use Redis client library (ioredis or node-redis)",
    "Fixed window: Use key pattern 'ratelimit:{userId}:{timestamp}'",
    "Sliding window: Use ZSET with timestamps as scores",
    "Consider using Redis Lua scripts for atomic operations",
    "Test with different time windows and limits"
  ]
}
```

**Step 2: Create Lab 2 - Add Caching Layers for AI Responses**

Create `content/sprints/sprint-5/labs/lab-2-caching.json`:

```json
{
  "id": "lab-2-caching",
  "title": "Add Caching Layers for AI Responses",
  "description": "Implement multi-level caching to reduce API costs and improve response times",
  "difficulty": "intermediate",
  "estimatedMinutes": 45,
  "language": "javascript",
  "starterCode": "/**\n * Cache AI response with TTL\n * @param {string} prompt - User prompt\n * @param {string} response - AI response\n * @param {number} ttlSeconds - Time to live in seconds\n */\nasync function cacheResponse(prompt, response, ttlSeconds) {\n  // Your code here\n}\n\n/**\n * Get cached response\n * @param {string} prompt - User prompt\n * @returns {Promise<string|null>} Cached response or null\n */\nasync function getCachedResponse(prompt) {\n  // Your code here\n  return null\n}\n\n/**\n * Semantic cache (similar prompts)\n * @param {string} prompt - User prompt\n * @param {number} similarityThreshold - Similarity score (0-1)\n * @returns {Promise<string|null>}\n */\nasync function semanticCacheLookup(prompt, similarityThreshold) {\n  // Your code here\n  return null\n}\n",
  "instructions": "Build caching system for AI responses:\n1. `cacheResponse(prompt, response, ttlSeconds)`: Store response in Redis\n   - Generate cache key from prompt (use hash for consistent keys)\n   - Set expiration based on TTL\n   - Track cache metrics (hits, misses, cost savings)\n\n2. `getCachedResponse(prompt)`: Retrieve cached response\n   - Check if exact match exists\n   - Return null if expired or not found\n   - Increment hit/miss counters\n\n3. `semanticCacheLookup(prompt, similarityThreshold)`: Find similar cached prompts\n   - Use embeddings to find similar prompts\n   - Return response if similarity above threshold\n   - Advanced: consider using vector databases\n\nCaching strategies:\n- Exact match caching for repeated queries\n- Semantic caching for similar questions\n- Consider cache invalidation strategy",
  "testCases": [
    {
      "input": "await cacheResponse('What is AI?', 'AI is...', 3600)",
      "expectedOutput": "undefined",
      "description": "Stores response in cache"
    },
    {
      "input": "await getCachedResponse('What is AI?')",
      "expectedOutput": "'AI is...'",
      "description": "Retrieves exact match from cache"
    },
    {
      "input": "await getCachedResponse('What is ML?')",
      "expectedOutput": "null",
      "description": "Returns null for cache miss"
    },
    {
      "input": "await semanticCacheLookup('Explain artificial intelligence', 0.8)",
      "expectedOutput": "'AI is...'",
      "description": "Finds semantically similar cached response"
    },
    {
      "input": "// After TTL expires: await getCachedResponse('What is AI?')",
      "expectedOutput": "null",
      "description": "Returns null after expiration"
    }
  ],
  "hints": [
    "Use crypto.createHash() to generate consistent cache keys",
    "Store metadata alongside cached responses (timestamp, usage count)",
    "Consider cache warming for popular queries",
    "Calculate cost savings: (cache hits × API cost per request)",
    "For semantic cache, use simple string similarity initially"
  ]
}
```

**Step 3: Create Lab 3 - Set Up Monitoring with Sentry**

Create `content/sprints/sprint-5/labs/lab-3-monitoring.json`:

```json
{
  "id": "lab-3-monitoring",
  "title": "Set Up Monitoring with Sentry",
  "description": "Implement error tracking and performance monitoring for production applications",
  "difficulty": "intermediate",
  "estimatedMinutes": 45,
  "language": "javascript",
  "starterCode": "/**\n * Initialize Sentry monitoring\n * @param {object} config - Sentry configuration\n */\nfunction initializeMonitoring(config) {\n  // Your code here\n}\n\n/**\n * Track custom event\n * @param {string} eventName - Event name\n * @param {object} metadata - Additional data\n */\nfunction trackEvent(eventName, metadata) {\n  // Your code here\n}\n\n/**\n * Monitor API call performance\n * @param {Function} apiCall - Async function to monitor\n * @returns {Promise<any>}\n */\nasync function monitorApiCall(apiCall) {\n  // Your code here\n  // Track duration, success/failure, response size\n  return null\n}\n\n/**\n * Log error with context\n * @param {Error} error - Error object\n * @param {object} context - Additional context\n */\nfunction logError(error, context) {\n  // Your code here\n}\n",
  "instructions": "Build monitoring system:\n1. `initializeMonitoring(config)`: Set up Sentry\n   - Initialize Sentry SDK\n   - Configure environment, release, traces sample rate\n   - Set user context if available\n\n2. `trackEvent(eventName, metadata)`: Custom event tracking\n   - Track important application events\n   - Include relevant metadata\n   - Use Sentry breadcrumbs or custom events\n\n3. `monitorApiCall(apiCall)`: Performance monitoring\n   - Measure execution time\n   - Track success/failure rates\n   - Record response metadata\n   - Send metrics to Sentry\n\n4. `logError(error, context)`: Enhanced error logging\n   - Capture error with full stack trace\n   - Add contextual information\n   - Tag errors for filtering\n   - Set error severity level\n\nSentry features:\n- Error tracking with stack traces\n- Performance monitoring\n- Breadcrumbs for debugging context\n- Release tracking",
  "testCases": [
    {
      "input": "initializeMonitoring({dsn: 'test', environment: 'dev'})",
      "expectedOutput": "undefined",
      "description": "Initializes Sentry without errors"
    },
    {
      "input": "trackEvent('user_action', {action: 'click', button: 'submit'})",
      "expectedOutput": "undefined",
      "description": "Tracks custom event"
    },
    {
      "input": "await monitorApiCall(async () => fetch('/api/test'))",
      "expectedOutput": "Response object",
      "description": "Monitors API call and returns response"
    },
    {
      "input": "logError(new Error('Test'), {userId: '123', page: '/dashboard'})",
      "expectedOutput": "undefined",
      "description": "Logs error with context to Sentry"
    }
  ],
  "hints": [
    "Install @sentry/nextjs for Next.js integration",
    "Use Sentry.captureException() for errors",
    "Use Sentry.captureMessage() for info/warning logs",
    "Performance: Use Sentry.startTransaction() for custom spans",
    "Set up source maps for readable stack traces in production"
  ]
}
```

**Step 4: Create Lab 4 - Build Retry Logic with Exponential Backoff**

Create `content/sprints/sprint-5/labs/lab-4-retry-logic.json`:

```json
{
  "id": "lab-4-retry-logic",
  "title": "Build Retry Logic with Exponential Backoff",
  "description": "Implement robust retry mechanisms for handling transient failures",
  "difficulty": "advanced",
  "estimatedMinutes": 60,
  "language": "javascript",
  "starterCode": "/**\n * Retry function with exponential backoff\n * @param {Function} fn - Async function to retry\n * @param {object} options - Retry configuration\n * @returns {Promise<any>}\n */\nasync function retryWithBackoff(fn, options = {}) {\n  // Your code here\n  // Options: maxRetries, initialDelay, maxDelay, backoffFactor\n  return null\n}\n\n/**\n * Circuit breaker pattern\n */\nclass CircuitBreaker {\n  constructor(options) {\n    // Your code here\n    // Options: failureThreshold, resetTimeout\n  }\n\n  async execute(fn) {\n    // Your code here\n    // States: CLOSED, OPEN, HALF_OPEN\n    return null\n  }\n}\n\n/**\n * Determine if error is retryable\n * @param {Error} error - Error object\n * @returns {boolean}\n */\nfunction isRetryableError(error) {\n  // Your code here\n  return false\n}\n",
  "instructions": "Implement retry and circuit breaker patterns:\n1. `retryWithBackoff(fn, options)`: Exponential backoff retry\n   - Retry failed operations with increasing delays\n   - Formula: delay = initialDelay * (backoffFactor ^ attemptNumber)\n   - Add jitter to prevent thundering herd\n   - Stop after maxRetries attempts\n   - Only retry on transient errors (network, timeouts, 5xx)\n\n2. `CircuitBreaker`: Prevent cascade failures\n   - CLOSED state: Normal operation\n   - OPEN state: Fail fast when threshold reached\n   - HALF_OPEN state: Test if service recovered\n   - Track failure count and success rate\n   - Reset after timeout period\n\n3. `isRetryableError(error)`: Error classification\n   - Retryable: Network errors, timeouts, 429, 5xx errors\n   - Non-retryable: 4xx client errors (except 429), invalid input\n   - Check error codes and types\n\nAdvanced features:\n- Add timeout per attempt\n- Track metrics (retry count, success rate)\n- Log retry attempts for debugging",
  "testCases": [
    {
      "input": "await retryWithBackoff(() => fetch('/api/flaky'), {maxRetries: 3})",
      "expectedOutput": "Response after retries",
      "description": "Retries until success"
    },
    {
      "input": "await retryWithBackoff(() => {throw new Error('Network')}, {maxRetries: 2})",
      "expectedOutput": "Throws after max retries",
      "description": "Fails after exhausting retries"
    },
    {
      "input": "const cb = new CircuitBreaker({failureThreshold: 3}); await cb.execute(failingFn)",
      "expectedOutput": "Opens circuit after threshold",
      "description": "Circuit breaker opens on failures"
    },
    {
      "input": "isRetryableError(new Error('ECONNREFUSED'))",
      "expectedOutput": "true",
      "description": "Network errors are retryable"
    },
    {
      "input": "isRetryableError({statusCode: 400})",
      "expectedOutput": "false",
      "description": "Client errors not retryable"
    }
  ],
  "hints": [
    "Use setTimeout with Promise for delays",
    "Add random jitter: delay * (0.5 + Math.random() * 0.5)",
    "Circuit breaker needs state machine (CLOSED/OPEN/HALF_OPEN)",
    "Consider using libraries like p-retry or axios-retry for production",
    "Log retry attempts with structured logging for debugging"
  ]
}
```

**Step 5: Commit**

```bash
git add content/sprints/sprint-5/labs/
git commit -m "feat: add Sprint 5 lab exercise specifications

- Lab 1: Implement rate limiting with Redis
- Lab 2: Add caching layers for AI responses
- Lab 3: Set up monitoring with Sentry
- Lab 4: Build retry logic with exponential backoff

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Project Specification

**Files:**
- Create: `content/sprints/sprint-5/project.json`

**Step 1: Create project specification**

Create `content/sprints/sprint-5/project.json`:

```json
{
  "id": "production-ready-api",
  "title": "Production-Ready AI API",
  "description": "Transform an AI application into a production-ready API with monitoring, caching, error handling, and cost optimization",
  "difficulty": "advanced",
  "estimatedHours": 4,
  "technologies": ["Next.js", "Redis (Upstash)", "Sentry", "Vercel", "TypeScript"],
  "learningObjectives": [
    "Implement production-grade error handling with retry logic",
    "Add multi-level caching to reduce API costs",
    "Set up monitoring and observability with Sentry",
    "Build rate limiting to prevent abuse",
    "Optimize costs through intelligent resource usage",
    "Deploy with proper environment configuration",
    "Pass load testing with reliability metrics"
  ],
  "requirements": {
    "functional": [
      "Choose any previous project (Chat Assistant, Research Agent, or Visual Product Analyzer)",
      "Add Redis caching with configurable TTL",
      "Implement rate limiting (per user or per IP)",
      "Set up comprehensive error handling with retries",
      "Add monitoring with Sentry error tracking",
      "Display cache hit rate and cost savings",
      "Show system health metrics (uptime, error rate, latency)"
    ],
    "technical": [
      "Use Upstash Redis for distributed caching",
      "Implement exponential backoff retry logic",
      "Add Sentry SDK for error tracking and performance monitoring",
      "Use environment variables for all configuration",
      "Implement circuit breaker pattern for external APIs",
      "Add request/response logging with structured format",
      "Calculate and display cost per request"
    ],
    "ui": [
      "Admin dashboard showing metrics (cache hit rate, error rate, avg latency)",
      "Cost tracker display (total spend, cost per request, savings from cache)",
      "Error log viewer with filtering",
      "Rate limit status indicator",
      "Health check endpoint visualization",
      "Loading states with retry indicators"
    ]
  },
  "successCriteria": [
    {
      "criterion": "Reliability",
      "description": "Passes load test with 99%+ success rate, handles API failures gracefully",
      "weight": 30
    },
    {
      "criterion": "Cost Optimization",
      "description": "Achieves <$0.10 per 100 requests through caching, demonstrates measurable cost savings",
      "weight": 25
    },
    {
      "criterion": "Observability",
      "description": "Full error tracking in Sentry, comprehensive logs, real-time metrics dashboard",
      "weight": 20
    },
    {
      "criterion": "Error Handling",
      "description": "Proper retry logic, circuit breakers, graceful degradation, user-friendly error messages",
      "weight": 15
    },
    {
      "criterion": "Code Quality",
      "description": "Clean code, proper TypeScript types, environment config, documentation",
      "weight": 10
    }
  ],
  "testScenarios": [
    "Load test: 100 requests in 10 seconds",
    "Simulate API failures and verify retry logic",
    "Test rate limiting with burst traffic",
    "Verify cache hit rate >50% for repeated queries",
    "Check error tracking in Sentry dashboard"
  ],
  "starterFiles": {
    "structure": [
      "app/api/[feature]/route.ts",
      "lib/cache/redis-cache.ts",
      "lib/monitoring/sentry-config.ts",
      "lib/resilience/retry-logic.ts",
      "lib/resilience/circuit-breaker.ts",
      "lib/rate-limiting/rate-limiter.ts",
      "components/MetricsDashboard.tsx",
      "components/HealthCheck.tsx"
    ]
  },
  "technicalGuidance": {
    "caching": "Use Upstash Redis for serverless-compatible caching. Cache key pattern: {feature}:{hash(input)}. TTL: 1 hour for responses, 1 day for expensive computations",
    "rateLimiting": "Sliding window algorithm: 100 requests per user per minute. Use Redis sorted sets for distributed tracking",
    "retryLogic": "Exponential backoff: 1s, 2s, 4s, 8s. Max 4 retries. Only retry 429, 5xx, and network errors. Circuit breaker opens after 5 consecutive failures",
    "monitoring": "Sentry for errors + performance. Custom metrics: cache_hit_rate, api_latency_p95, cost_per_request. Set up alerts for error_rate >1%",
    "costTracking": "Log every API call cost. Formula: (input_tokens × $0.003 + output_tokens × $0.015) / 1000 for Claude Sonnet. Display cumulative spend and savings",
    "healthCheck": "Endpoint /api/health returns: {status, uptime, cache_hit_rate, error_rate_24h, avg_latency}. Use for monitoring and alerts"
  },
  "deploymentRequirements": {
    "platform": "Vercel",
    "environment": [
      "ANTHROPIC_API_KEY",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
      "SENTRY_DSN",
      "SENTRY_AUTH_TOKEN (for source maps)",
      "NEXT_PUBLIC_SENTRY_DSN",
      "RATE_LIMIT_MAX (default: 100)",
      "RATE_LIMIT_WINDOW_MS (default: 60000)",
      "CACHE_TTL_SECONDS (default: 3600)"
    ],
    "instructions": "Deploy to Vercel with environment variables. Set up Sentry project. Configure Upstash Redis instance. Enable Vercel Analytics for monitoring. Set up load testing with k6 or Artillery"
  },
  "estimatedCosts": {
    "development": {
      "redis": "$0 (Upstash free tier: 10k commands/day)",
      "sentry": "$0 (Developer plan: 5k events/month)",
      "llm": "$1.50 (100 test requests with caching)",
      "total": "$1.50"
    },
    "production": {
      "redis": "$10/month (Pro plan for high traffic)",
      "sentry": "$26/month (Team plan for production monitoring)",
      "llm": "$15/month (1000 requests, 70% cache hit rate)",
      "vercel": "$0 (Hobby tier)",
      "total": "$51/month"
    }
  },
  "extensionIdeas": [
    "Add GraphQL API with DataLoader for batching",
    "Implement A/B testing framework for prompts",
    "Add webhooks for async job processing",
    "Build admin panel for configuration management",
    "Implement multi-region failover",
    "Add request queuing for rate limit smoothing",
    "Build custom analytics dashboard",
    "Implement cost alerting (email/Slack when budget exceeded)"
  ],
  "rubric": {
    "exceeds": "Handles 200+ req/s, <$0.05 per 100 requests, 99.9% uptime, comprehensive monitoring, graceful degradation, detailed metrics dashboard",
    "meets": "Handles 100 req/s, <$0.10 per 100 requests, 99% uptime, error tracking works, retry logic implemented, basic metrics visible",
    "approaching": "Handles 50 req/s, caching reduces some costs, errors tracked but retry logic incomplete, metrics partially implemented",
    "incomplete": "Fails load test, no caching or monitoring, errors not handled properly, or not deployed"
  }
}
```

**Step 2: Commit**

```bash
git add content/sprints/sprint-5/project.json
git commit -m "feat: add Sprint 5 project specification

Production-Ready AI API - Transform existing project with monitoring,
caching, error handling, and cost optimization for production reliability.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Build and Test Sprint 5 Content

**Files:**
- Test: Build succeeds
- Test: All Sprint 5 routes load

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Verify content structure**

```bash
ls -la content/sprints/sprint-5/concepts/
ls -la content/sprints/sprint-5/labs/
```

Expected: All 3 concept files and 4 lab files present

**Step 3: Report success**

No commit needed - this is verification only.

---

## Task 8: Update Dashboard to Show Sprint 5

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Step 1: Add Sprint 5 progress fetching**

After Sprint 4 progress (around line 31), add:
```typescript
const sprint5Progress = user ? await getSprintProgress(user.id, 'sprint-5') : null
```

**Step 2: Add Sprint 5 card to dashboard**

After Sprint 4 card, add:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Sprint 5</CardTitle>
    <CardDescription>Production Deployment</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 mb-4">
      Deploy and scale AI applications with monitoring, caching, and reliability
    </p>
    {sprint5Progress && sprint5Progress.totalCount > 0 ? (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              {sprint5Progress.completedCount} of {sprint5Progress.totalCount} concepts
            </span>
            <span className="font-medium">
              {Math.round(sprint5Progress.percentComplete)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${sprint5Progress.percentComplete}%` }}
            />
          </div>
        </div>
        <Link href="/learn/sprint-5">
          <Button size="sm" variant="outline" className="w-full">
            {sprint5Progress.completedCount === 0
              ? 'Start Sprint'
              : sprint5Progress.completedCount === sprint5Progress.totalCount
              ? 'Review Sprint'
              : 'Continue Sprint'}
          </Button>
        </Link>
      </div>
    ) : (
      <Link href="/learn/sprint-5">
        <Button size="sm" variant="outline">
          Start Sprint
        </Button>
      </Link>
    )}
  </CardContent>
</Card>
```

**Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/page.tsx
git commit -m "feat: add Sprint 5 card to dashboard

Display Sprint 5: Production Deployment on dashboard with progress tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Documentation and README Update

**Files:**
- Modify: `README.md`
- Create: `docs/SPRINT-5-GUIDE.md`

**Step 1: Update README**

Add Sprint 5 to Learning Platform features (around line 198):
```markdown
- ✅ **Sprint 5**: Production Deployment (cost optimization, monitoring, reliability)
```

**Step 2: Create Sprint 5 guide**

Create comprehensive `docs/SPRINT-5-GUIDE.md` with:
- Overview of Sprint 5
- Learning path (3 concepts, 4 labs, 1 project)
- Technical details on Redis, Sentry, production patterns
- Testing checklist (load testing, cost verification)
- Common issues (Redis connection, Sentry setup, rate limit tuning)
- Deployment notes (Upstash setup, Vercel env vars, monitoring config)
- Resources (Redis docs, Sentry guides, production best practices)

Use `docs/SPRINT-4-GUIDE.md` as reference for structure.

**Step 3: Commit**

```bash
git add README.md docs/SPRINT-5-GUIDE.md
git commit -m "docs: add Sprint 5 documentation and update README

- Update README with Sprint 5 in Learning Platform
- Create comprehensive Sprint 5 implementation guide
- Document Redis caching, Sentry monitoring, and production patterns
- Include load testing guide and cost optimization strategies

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification

After completing all tasks:

1. **Build passes**: `npm run build` succeeds
2. **All routes load**: Sprint 5 pages accessible
3. **Content quality**: Concepts cover production patterns comprehensively
4. **Labs functional**: Lab exercises have clear Redis/Sentry integration steps
5. **Project well-defined**: Project spec has load testing criteria and cost metrics
6. **Documentation complete**: README and guides updated with deployment instructions

---

## Summary

This plan implements Sprint 5 with:
- ✅ Sprint structure (metadata, directories)
- ✅ 3 comprehensive concept lessons (cost optimization, monitoring, error handling)
- ✅ 4 hands-on lab exercises (rate limiting, caching, monitoring, retry logic)
- ✅ 1 real-world project (Production-Ready AI API)
- ✅ Dashboard integration
- ✅ Complete documentation

**Estimated Time**: 8-12 hours for full implementation
**Complexity**: Advanced - production engineering patterns
**Focus**: Reliability, observability, cost optimization, and scalability
