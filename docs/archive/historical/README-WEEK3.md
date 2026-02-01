# Week 3: AI Infrastructure Implementation

## Completed Features

- ✅ Redis caching layer (Local Docker)
- ✅ AIService abstraction with retry logic
- ✅ Context management system
- ✅ Reusable chat UI components
- ✅ Streaming chat API with SSE
- ✅ AI Mentor conversation interface
- ✅ Rate limiting per user
- ✅ Conversation persistence and history
- ✅ Auto-generated conversation titles

## Architecture

```
User → Chat UI → Streaming API → AIService → Claude API
                      ↓                ↓
                   Prisma          Redis Cache
```

### Key Components

**AIService (`lib/ai/service.ts`)**
- Unified interface for all AI interactions
- Automatic caching with Redis
- Retry logic with exponential backoff
- Streaming and non-streaming modes
- Uses `claude-3-haiku-20240307` model

**Context System (`lib/ai/context.ts`)**
- Assembles user context, conversation history, project data
- Trims messages to fit context window
- Provides relevant context to AI

**Chat Components (`components/chat/`)**
- Reusable across all AI features
- ChatContainer, ChatMessage, ChatInput
- Auto-scrolling, streaming support

**Rate Limiting (`lib/rate-limit.ts`)**
- Redis-based rate limiting
- Configurable per feature
- Graceful degradation if Redis fails

## API Endpoints

### POST /api/chat/stream
Streaming chat with Claude API

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How do I build a RAG system?" }
  ],
  "systemPrompt": "You are an AI mentor...",
  "conversationId": "conv_123"
}
```

**Response:** Server-Sent Events stream

### GET /api/mentor/[id]
Fetch conversation by ID

### PATCH /api/mentor/[id]/title
Update conversation title

### GET /api/user/profile
Get user profile data

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# Redis
REDIS_URL="redis://localhost:6379"
```

## Rate Limits

- Mentor chat: 20 messages/hour
- Diagnosis: 3 attempts/day
- General API: 30 requests/minute

## Docker Services

Start all services:
```bash
docker-compose up -d
```

Services:
- PostgreSQL on port 5433
- Redis on port 6379

## Database Schema

New tables added in Week 3:

```prisma
model MentorConversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  messages  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, updatedAt(sort: Desc)])
}
```

## Testing

### Test Redis connection:
```bash
docker exec -it aicelerate-redis redis-cli ping
# Should return: PONG
```

### Test streaming chat:
```bash
npm run dev
# Navigate to /mentor/new
# Send messages and verify streaming
```

### Test caching:
```typescript
// The AIService automatically caches responses
// Send the same diagnosis quiz twice and check logs for cache hits
```

### Test rate limiting:
1. Send 20 messages within an hour
2. The 21st message should be rate limited
3. Check that the error toast shows the reset time

## Implementation Notes

### Adaptations from Original Plan

1. **Database**: Used Prisma + PostgreSQL instead of Supabase
   - All database operations use Prisma Client
   - Prisma migrations for schema changes

2. **Redis**: Used local Docker Redis instead of Upstash
   - ioredis client instead of @upstash/redis
   - Runs on localhost:6379

3. **Claude Model**: Used `claude-3-haiku-20240307`
   - This is the working model for the current API key
   - Configured in AIService for all chat operations

4. **UI Components**: Manually created shadcn/ui components
   - Node.js version compatibility issue with CLI
   - Installed Radix UI primitives directly

### Edge Runtime Considerations

The streaming API uses Edge runtime for optimal performance with streaming responses. Redis (HTTP-based) works well in edge runtime.

## Pages Added

- `/mentor` - AI Mentor conversations list
- `/mentor/new` - Start new conversation
- `/mentor/[id]` - Individual conversation view
- Dashboard updated with AI Mentor link

## Next Steps

Week 4 will add:
- Learning platform content structure
- Sprint 1 modules
- Progress tracking
- Navigation between concepts
- Concept completion tracking
- Dashboard progress visualization

This sets the foundation for delivering actual learning content in the platform.

## Troubleshooting

### Redis connection errors
```bash
# Check if Redis is running
docker ps | grep redis

# Restart Redis if needed
docker-compose restart redis
```

### Streaming not working
- Check that ANTHROPIC_API_KEY is set
- Verify model `claude-3-haiku-20240307` is available for your API key
- Check browser console for errors

### Rate limit not working
- Verify Redis is running
- Check Redis connection in application logs
- Rate limiter fails open (allows requests) if Redis is down
