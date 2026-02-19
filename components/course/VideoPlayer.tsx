'use client'

import { Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface VideoPlayerProps {
  videoUrl: string | null
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-lg bg-muted flex items-center justify-center border">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium">{title}</p>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </div>
      </div>
    )
  }

  // YouTube embed
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('youtu.be')
      ? videoUrl.split('/').pop()
      : new URL(videoUrl).searchParams.get('v')

    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  // Local/hosted video
  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
      <video
        src={videoUrl}
        title={title}
        controls
        className="h-full w-full object-contain bg-black"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
