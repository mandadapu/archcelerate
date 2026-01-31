import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-white">
              AI Architect Accelerator
            </h1>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-slate-700">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Build 7 AI Products in 12 Weeks
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Transform from Software Engineer to AI Product Builder through
            project-based learning. Learn by shipping, not by watching.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start building →
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">7</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Deployed Projects
            </h3>
            <p className="text-slate-400 text-sm">
              Build real AI products from chat assistants to production systems
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Mentor
            </h3>
            <p className="text-slate-400 text-sm">
              Get instant help with code reviews and debugging anytime
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">12</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Weeks to Job-Ready
            </h3>
            <p className="text-slate-400 text-sm">
              Complete the program and be ready for AI Architect interviews
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
