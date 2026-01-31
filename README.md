# AI Architect Accelerator

Transform from Software Engineer to AI Product Builder in 12 weeks.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** (Docker)
- **Prisma** ORM
- **NextAuth.js** (OAuth2: Google, Facebook, LinkedIn)

## Getting Started

### Prerequisites

- Node.js 19+ (recommended: upgrade to Node 20+ for better compatibility)
- Docker Desktop (for PostgreSQL database)
- OAuth credentials from Google, Facebook, and LinkedIn

### Installation

1. **Clone the repository**
   ```bash
   cd aicelerate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   The project uses `.env.local` for Next.js and `.env` for Prisma.

   Update `.env.local` with your OAuth credentials:
   ```env
   DATABASE_URL="postgresql://aicelerate:aicelerate_dev_password@localhost:5433/aicelerate"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

   # Get these from OAuth provider dashboards
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   FACEBOOK_CLIENT_ID="your-facebook-client-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## OAuth Setup Instructions

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and App Secret to `.env.local`

### LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. Set Redirect URLs: `http://localhost:3000/api/auth/callback/linkedin`
5. Copy Client ID and Client Secret to `.env.local`

## Database Management

- **View database**: `npx prisma studio`
- **Create migration**: `npx prisma migrate dev --name migration_name`
- **Reset database**: `npx prisma migrate reset`

## Project Structure

```
aicelerate/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page with OAuth buttons
│   ├── (dashboard)/
│   │   └── dashboard/      # Protected dashboard
│   ├── api/
│   │   └── auth/           # NextAuth.js API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── types/
│   └── next-auth.d.ts      # NextAuth type extensions
├── docker-compose.yml      # PostgreSQL Docker setup
└── .env.local              # Environment variables
```

## Features Implemented

- ✅ OAuth authentication (Google, Facebook, LinkedIn)
- ✅ Protected dashboard with session management
- ✅ PostgreSQL database with Prisma ORM
- ✅ User profile storage
- ✅ Responsive UI with Tailwind CSS
- ✅ shadcn/ui component library
- ✅ Docker PostgreSQL setup

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma database GUI
- `docker-compose up -d` - Start PostgreSQL
- `docker-compose down` - Stop PostgreSQL

## Next Steps (Week 2)

After completing Week 1 setup, proceed to:

- Sprint 0: Skill Diagnosis quiz
- User onboarding flow
- Learning path personalization
- AI mentor integration

## Troubleshooting

**Port 5432 already in use:**
- PostgreSQL is running on port 5433 instead. The docker-compose.yml is configured for this.

**NextAuth session errors:**
- Make sure NEXTAUTH_SECRET is set in `.env.local`
- Ensure OAuth redirect URLs match exactly in provider dashboards

**Prisma connection errors:**
- Check that Docker PostgreSQL container is running: `docker ps`
- Verify DATABASE_URL in both `.env` and `.env.local`

**Node version warnings:**
- Current setup works with Node 19.8.1
- Recommended: Upgrade to Node 20+ for better compatibility with latest tools

## License

MIT
