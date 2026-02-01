import { FAQSection } from '@/src/components/help/FAQSection'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FAQPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/help">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
        </Button>
      </div>

      <FAQSection />
    </div>
  )
}
