'use client'

import { useState } from 'react'

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    // When video is ready, this will trigger video playback
    // For now, just show placeholder behavior
    setIsPlaying(true)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-8">
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-cyan-100">
        {/* Placeholder background - replace with video thumbnail when ready */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="group relative"
              aria-label="Play demo video"
            >
              {/* Play button */}
              <div className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/50">
                <svg
                  className="w-10 h-10 text-gray-900 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* Text below button */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-sm font-medium text-gray-700">Watch Demo (1:30)</p>
              </div>
            </button>
          ) : (
            <div className="text-center text-white">
              <p className="text-lg font-medium">Video coming soon!</p>
              <p className="text-sm opacity-75 mt-2">Demo video will be embedded here</p>
            </div>
          )}
        </div>

        {/* Optional: Video embed placeholder - uncomment when video is ready */}
        {/*
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          title="AI Architect Accelerator Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        */}
      </div>
    </div>
  )
}
