import { WelcomeFlow } from '@/src/components/onboarding/WelcomeFlow'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <WelcomeFlow />
}
