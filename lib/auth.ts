import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    // Uncomment when you have credentials:
    // LinkedInProvider({
    //   clientId: process.env.LINKEDIN_CLIENT_ID!,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in - account linking is handled by the adapter with allowDangerousEmailAccountLinking
      return true
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
    error: '/', // Redirect errors back to landing page instead of showing error
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Allow linking accounts with same email from different providers
  events: {
    async linkAccount({ user, account, profile }) {
      console.log('Account linked:', { user, account: account.provider })
    },
  },
}
