import { redirect } from 'next/navigation'

export default function SignOutPage() {
  // Redirect to dashboard - signout is now handled via popup modal
  redirect('/dashboard')
}
