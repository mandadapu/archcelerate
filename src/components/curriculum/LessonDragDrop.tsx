'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Clock, Trash2 } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface LessonDragDropProps {
  lesson: Lesson
  index: number
  onRemove: (id: string) => void
}

export function LessonDragDrop({ lesson, index, onRemove }: LessonDragDropProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex items-center gap-3 hover:shadow-md transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={14} />
            {lesson.duration} min
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              difficultyColors[lesson.difficulty]
            }`}
          >
            {lesson.difficulty}
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(lesson.id)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Remove lesson"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
