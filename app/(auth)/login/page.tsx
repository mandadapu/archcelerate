import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to home page where all auth options are available
  redirect('/')
}
