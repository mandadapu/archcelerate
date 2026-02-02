'use client'

import { useState, useRef } from 'react'

/**
 * Video Demo Component for Landing Page
 *
 * Supports two modes:
 * 1. Local MP4 video (self-hosted)
 * 2. YouTube embed
 *
 * To use local video:
 *   - Place video in: public/videos/demo.mp4
 *   - Set VIDEO_SOURCE = 'local'
 *
 * To use YouTube:
 *   - Upload video to YouTube
 *   - Get video ID from URL (e.g., "dQw4w9WgXcQ" from youtube.com/watch?v=dQw4w9WgXcQ)
 *   - Set VIDEO_SOURCE = 'youtube'
 *   - Set YOUTUBE_VIDEO_ID
 */

// ===== CONFIGURATION =====
const VIDEO_CONFIG = {
  // Choose 'local' for MP4 or 'youtube' for YouTube embed
  source: 'local' as 'local' | 'youtube',

  // For local video: path to video file in public folder
  localVideo: '/videos/demo.webm',

  // For YouTube: video ID (the part after watch?v= in YouTube URL)
  youtubeVideoId: '', // e.g., 'dQw4w9WgXcQ'

  // Video metadata
  title: 'AI Architect Accelerator Demo',
  duration: '1:30', // Display duration

  // Thumbnail (optional) - shown before video plays
  // If not provided, video first frame is used
  thumbnail: '/images/video-thumbnail.jpg', // optional
}
// ===== END CONFIGURATION =====

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setIsPlaying(true)

    // If local video, play it
    if (VIDEO_CONFIG.source === 'local' && videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-12">
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-cyan-100 border border-gray-200/50">

        {/* Local MP4 Video */}
        {VIDEO_CONFIG.source === 'local' && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              poster={VIDEO_CONFIG.thumbnail}
              onEnded={handleVideoEnded}
              controls={isPlaying}
              playsInline
            >
              <source src={VIDEO_CONFIG.localVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play Button Overlay (hidden when video is playing) */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-[2px]">
                <button
                  onClick={handlePlay}
                  className="group relative"
                  aria-label="Play demo video"
                >
                  {/* Play button with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
                    <div className="relative w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <svg
                        className="w-12 h-12 text-gray-900 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Text below button */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="text-base font-semibold text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
                      Watch Demo · {VIDEO_CONFIG.duration}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </>
        )}

        {/* YouTube Embed */}
        {VIDEO_CONFIG.source === 'youtube' && (
          <>
            {!isPlaying ? (
              // YouTube thumbnail with play button
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm">
                {/* YouTube thumbnail image */}
                <img
                  src={`https://img.youtube.com/vi/${VIDEO_CONFIG.youtubeVideoId}/maxresdefault.jpg`}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-[1px]" />

                <button
                  onClick={handlePlay}
                  className="group relative z-10"
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
                    <p className="text-sm font-medium text-gray-700">
                      Watch Demo ({VIDEO_CONFIG.duration})
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              // YouTube iframe
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_CONFIG.youtubeVideoId}?autoplay=1&rel=0`}
                title={VIDEO_CONFIG.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </>
        )}

        {/* Fallback if no video configured */}
        {VIDEO_CONFIG.source === 'local' && !VIDEO_CONFIG.localVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
            <div className="text-center text-gray-700">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">Demo video coming soon!</p>
              <p className="text-sm opacity-75 mt-2">
                Place your video at <code className="bg-gray-200 px-2 py-1 rounded">public/videos/demo.mp4</code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video caption/CTA below */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          See how to build production AI systems in 12 weeks
        </p>
      </div>
    </div>
  )
}
