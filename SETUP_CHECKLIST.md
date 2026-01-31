# Setup Checklist

## ✅ Completed

- [x] Next.js 14 project initialized with TypeScript
- [x] Tailwind CSS configured
- [x] PostgreSQL Docker container running on port 5433
- [x] Prisma ORM configured and migrations applied
- [x] NextAuth.js configured with OAuth2 providers
- [x] shadcn/ui components (Button, Card)
- [x] Landing page created
- [x] Login page with OAuth buttons
- [x] Protected dashboard layout
- [x] Dashboard page with welcome message
- [x] Loading states for all routes
- [x] Error boundaries
- [x] Route protection middleware
- [x] Environment variable templates
- [x] Git repository initialized
- [x] Production build verified ✓

## 🔧 Requires Manual Configuration

### OAuth Provider Setup

Before you can test authentication, you need to configure OAuth providers:

#### 1. Google OAuth
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create/select project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy credentials to `.env.local`

#### 2. Facebook OAuth
- [ ] Go to [Facebook Developers](https://developers.facebook.com/)
- [ ] Create app
- [ ] Add Facebook Login
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
- [ ] Copy credentials to `.env.local`

#### 3. LinkedIn OAuth
- [ ] Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
- [ ] Create app
- [ ] Add "Sign In with LinkedIn"
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/linkedin`
- [ ] Copy credentials to `.env.local`

#### 4. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all OAuth credentials
- [ ] Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`

## 🧪 Testing Checklist

Once OAuth is configured, test these flows:

### Landing Page
- [ ] Visit `http://localhost:3000`
- [ ] Verify hero section displays
- [ ] Verify feature cards display
- [ ] Click "Get started" button → redirects to `/login`

### Authentication
- [ ] Visit `/login`
- [ ] Click "Continue with Google" → OAuth flow works
- [ ] Successfully redirected to `/dashboard`
- [ ] User session persists on refresh

### Dashboard
- [ ] Verify welcome message shows user name
- [ ] Verify 3 sprint cards display
- [ ] Click "Sign out" → redirects to `/login`
- [ ] Try accessing `/dashboard` when logged out → redirects to `/login`

### Loading States
- [ ] Slow down network in DevTools
- [ ] Verify loading skeletons appear
- [ ] Verify smooth transitions

## 📊 Database Verification

Check that tables were created correctly:

```bash
# Open Prisma Studio
npx prisma studio

# Verify these tables exist:
- User
- Account
- Session
- VerificationToken
- LearningEvent
```

## 🚀 Production Deployment

When ready to deploy to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (use hosted PostgreSQL like Supabase/Neon/Railway)
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - All OAuth credentials
4. Update OAuth redirect URIs to production URLs
5. Deploy

## 🐛 Common Issues

### Database Connection Fails
```bash
# Check if Docker is running
docker ps

# Restart container if needed
docker-compose restart
```

### OAuth Redirect Mismatch
- Ensure redirect URIs in provider dashboards match exactly
- Check `NEXTAUTH_URL` matches your current environment

### Session Not Persisting
- Verify `NEXTAUTH_SECRET` is set
- Check browser cookies are enabled
- Clear browser cache and cookies

## 📝 Next Steps

After completing setup and testing:

1. Review Week 2 plan: Skill Diagnosis (Sprint 0)
2. Implement quiz question bank
3. Build assessment UI
4. Add AI-powered analysis
5. Generate personalized learning paths
