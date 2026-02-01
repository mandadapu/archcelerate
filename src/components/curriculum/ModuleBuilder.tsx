'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Save, Eye } from 'lucide-react'
import { LessonDragDrop } from './LessonDragDrop'
import { ModulePreview } from './ModulePreview'

interface Lesson {
  id: string
  title: string
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export function ModuleBuilder() {
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // New lesson form state
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonDuration, setNewLessonDuration] = useState(30)
  const [newLessonDifficulty, setNewLessonDifficulty] = useState<Lesson['difficulty']>('beginner')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: newLessonTitle,
      duration: newLessonDuration,
      difficulty: newLessonDifficulty,
    }

    setLessons([...lessons, newLesson])
    setNewLessonTitle('')
    setNewLessonDuration(30)
    setNewLessonDifficulty('beginner')
  }

  const handleRemoveLesson = (id: string) => {
    setLessons(lessons.filter((lesson) => lesson.id !== id))
  }

  const handleSave = async () => {
    // TODO: Implement save to database
    console.log('Saving module:', {
      title: moduleTitle,
      description: moduleDescription,
      lessons,
    })
    alert('Module saved! (Mock implementation)')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Builder Section */}
      <div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Module Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Module Title</label>
            <input
              type="text"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Enter module title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
              placeholder="Enter module description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add Lesson</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Lesson Title</label>
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Enter lesson title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={newLessonDifficulty}
                  onChange={(e) =>
                    setNewLessonDifficulty(e.target.value as Lesson['difficulty'])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddLesson}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <Plus size={18} />
              Add Lesson
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Lessons ({lessons.length})</h2>
            <span className="text-sm text-gray-500">Drag to reorder</span>
          </div>

          {lessons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No lessons added yet. Add your first lesson above.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={lessons} strategy={verticalListSortingStrategy}>
                {lessons.map((lesson, index) => (
                  <LessonDragDrop
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    onRemove={handleRemoveLesson}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!moduleTitle || lessons.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Save Module
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
              showPreview
                ? 'bg-purple-100 text-purple-700'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="lg:sticky lg:top-6 h-fit">
          <ModulePreview
            title={moduleTitle}
            description={moduleDescription}
            lessons={lessons}
          />
        </div>
      )}
    </div>
  )
}
