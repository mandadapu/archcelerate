import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Video, HelpCircle, MessageCircle, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl text-slate-600">
          Everything you need to succeed on your AI engineering journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              New to the platform? Start here to learn the basics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/help/getting-started">View Guide</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Video className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>
              Watch step-by-step video guides for common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/help/tutorials">Watch Videos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <HelpCircle className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Find answers to frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/help/faq">Browse FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Detailed technical documentation and API references
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/docs">Read Docs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-pink-600 mb-2" />
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Get help from our support team via email or chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:support@archcelerate.com">Email Us</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Zap className="h-8 w-8 text-yellow-600 mb-2" />
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>
              Helpful tips and tricks to get the most out of the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/help/tips">View Tips</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Need More Help?</h2>
        <p className="text-slate-600 mb-6">
          Our support team is here to help you succeed. Reach out anytime!
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <a href="mailto:support@archcelerate.com">Email Support</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/community">Join Community</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
