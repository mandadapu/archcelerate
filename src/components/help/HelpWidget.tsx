'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, BookOpen, Video, MessageCircle, X } from 'lucide-react'

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>How can we help?</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/getting-started">
            <BookOpen className="h-4 w-4 mr-2" />
            Getting Started Guide
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/tutorials">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </a>
        </Button>

        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help/faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </a>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            // Open chat widget (Intercom, Crisp, etc.)
            // @ts-ignore
            if (window.Intercom) {
              // @ts-ignore
              window.Intercom('show')
            }
          }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat with Support
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-600">
            Need urgent help? Email{' '}
            <a href="mailto:support@aicelerate.com" className="text-blue-600 hover:underline">
              support@aicelerate.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
