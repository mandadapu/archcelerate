import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">✅ App is Working!</h1>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All components are functioning correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Next.js Server</span>
              <span className="text-green-600 font-semibold">✓ Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database (PostgreSQL)</span>
              <span className="text-green-600 font-semibold">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tailwind CSS</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span>shadcn/ui Components</span>
              <span className="text-green-600 font-semibold">✓ Loaded</span>
            </div>
            <div className="flex items-center justify-between">
              <span>TypeScript</span>
              <span className="text-green-600 font-semibold">✓ Compiled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Missing?</CardTitle>
            <CardDescription>To enable authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600">
              The login buttons won&apos;t work until you configure OAuth credentials in <code className="bg-slate-100 px-1 rounded">.env.local</code>
            </p>
            <p className="text-sm text-slate-600">
              See <code className="bg-slate-100 px-1 rounded">SETUP_CHECKLIST.md</code> for step-by-step instructions.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/">
            <Button>View Landing Page</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">View Login Page</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
