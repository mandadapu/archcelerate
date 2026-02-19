import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { env } from '@/src/lib/env'

// Build providers list — only include OAuth providers with configured credentials
const providers: NextAuthOptions['providers'] = [
  GitHubProvider({
    clientId: env.GITHUB_ID,
    clientSecret: env.GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
  GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
]

if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Allow automatic account linking for users with the same email
        if (account?.provider && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          })

          // If user exists but doesn't have this provider linked, link it
          if (existingUser && !existingUser.accounts.some(acc => acc.provider === account.provider)) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
          }
        }
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        // Return true to allow sign-in to proceed even if linking fails
        return true
      }
    },
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error', // Custom error page with friendly messages
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
