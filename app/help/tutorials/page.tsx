import { VideoTutorials } from '@/src/components/help/VideoTutorials'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TutorialsPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/help">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-2">Video Tutorials</h1>
        <p className="text-xl text-slate-600">
          Watch step-by-step guides to master the platform
        </p>
      </div>

      <VideoTutorials />
    </div>
  )
}
