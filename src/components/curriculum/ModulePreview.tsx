'use client'

import { Clock, BookOpen, BarChart3 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface ModulePreviewProps {
  title: string
  description: string
  lessons: Lesson[]
}

export function ModulePreview({ title, description, lessons }: ModulePreviewProps) {
  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const difficultyCount = {
    beginner: lessons.filter((l) => l.difficulty === 'beginner').length,
    intermediate: lessons.filter((l) => l.difficulty === 'intermediate').length,
    advanced: lessons.filter((l) => l.difficulty === 'advanced').length,
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{title || 'Untitled Module'}</h2>
        <p className="text-purple-100">{description || 'No description'}</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen size={24} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
            <div className="text-sm text-gray-500">Lessons</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalDuration}</div>
            <div className="text-sm text-gray-500">Minutes</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 size={24} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {lessons.length > 0 ? 'Mixed' : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Difficulty</div>
          </div>
        </div>

        {lessons.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Difficulty Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-gray-600">Beginner</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(difficultyCount.beginner / lessons.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {difficultyCount.beginner}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-gray-600">Intermediate</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(difficultyCount.intermediate / lessons.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {difficultyCount.intermediate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-gray-600">Advanced</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(difficultyCount.advanced / lessons.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {difficultyCount.advanced}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Lesson Outline</h3>
          {lessons.length === 0 ? (
            <p className="text-gray-500 text-sm">No lessons added yet</p>
          ) : (
            <ol className="space-y-2">
              {lessons.map((lesson, index) => (
                <li key={lesson.id} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-500">{lesson.duration} minutes</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
