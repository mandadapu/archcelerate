import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { loadMDXContent } from '@/lib/mdx'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Security Framework',
  description: 'Enterprise-grade security for GenAI systems covering data, model, and usage protection'
}

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  // Load MDX content
  let content = null
  try {
    const { content: mdxContent } = await loadMDXContent('content/security/ai-security-framework.mdx')
    content = mdxContent
  } catch (error) {
    console.error('Failed to load security content:', error)
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Security Framework</h1>
            <p className="text-muted-foreground">
              Enterprise-grade protection for GenAI systems
            </p>
          </div>
        </div>

        {/* Quick Reference Card */}
        <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <div className="text-sm font-semibold text-green-900 mb-3">5-Layer Security Framework</div>
          <div className="grid grid-cols-5 gap-4 text-xs">
            <div>
              <div className="font-semibold text-green-900 mb-1">1. DATA</div>
              <div className="text-green-700">Poisoning, Exfiltration, Leakage</div>
            </div>
            <div>
              <div className="font-semibold text-green-900 mb-1">2. MODEL</div>
              <div className="text-green-700">Supply Chain, API, Priv Esc</div>
            </div>
            <div>
              <div className="font-semibold text-green-900 mb-1">3. USAGE</div>
              <div className="text-green-700">Prompt Injection, DoS, Theft</div>
            </div>
            <div>
              <div className="font-semibold text-green-900 mb-1">4. INFRA</div>
              <div className="text-green-700">CIA Triad, Network Security</div>
            </div>
            <div>
              <div className="font-semibold text-green-900 mb-1">5. GOV</div>
              <div className="text-green-700">Compliance, Ethics, Fairness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {content ? (
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {content}
        </article>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load security framework content</p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-12 border-t pt-8">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
