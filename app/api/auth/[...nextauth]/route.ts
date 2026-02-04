import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Enable trustHost to allow both archcelerate.com and www.archcelerate.com
const handler = NextAuth({
  ...authOptions,
  // @ts-ignore - trustHost exists but not in types
  trustHost: true,
})

export { handler as GET, handler as POST }
