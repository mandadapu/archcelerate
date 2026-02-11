import React from 'react'
import { CyberDefenseDesign } from '@/components/case-studies/CyberDefenseDesign'

// Callout Component
interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children: React.ReactNode
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
  }

  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌',
  }

  return (
    <div className={`border-l-4 p-4 my-4 rounded ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-2 font-semibold mb-2">
          <span>{icons[type]}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="prose prose-sm">{children}</div>
    </div>
  )
}

// Exercise Component
interface ExerciseProps {
  title: string
  difficulty?: 'easy' | 'medium' | 'hard'
  children: React.ReactNode
}

export function Exercise({ title, difficulty = 'medium', children }: ExerciseProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 my-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🏋️ Exercise: {title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>
      <div className="prose prose-sm">{children}</div>
    </div>
  )
}

// CodeSandbox Component
interface CodeSandboxProps {
  id: string
  title?: string
  height?: number
}

export function CodeSandbox({ id, title, height = 500 }: CodeSandboxProps) {
  return (
    <div className="my-6">
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <iframe
        src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 0,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
        title={title || 'CodeSandbox'}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      />
    </div>
  )
}

// Quiz Component
interface QuizOption {
  text: string
  correct: boolean
  explanation?: string
}

interface QuizProps {
  question: string
  options: QuizOption[]
}

export function Quiz({ question, options }: QuizProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const [showExplanation, setShowExplanation] = React.useState(false)

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setShowExplanation(true)
  }

  const selectedOption = selectedIndex !== null ? options[selectedIndex] : null

  return (
    <div className="border border-gray-200 rounded-lg p-6 my-6 bg-white">
      <h4 className="text-lg font-semibold mb-4">❓ {question}</h4>
      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index
          const isCorrect = option.correct
          const showResult = showExplanation && isSelected

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                showResult
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                <span>{option.text}</span>
                {showResult && (
                  <span className="ml-auto">{isCorrect ? '✅' : '❌'}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      {showExplanation && selectedOption?.explanation && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{selectedOption.explanation}</p>
        </div>
      )}
    </div>
  )
}

// MDX Components Map
export const mdxComponents = {
  Callout,
  Exercise,
  CodeSandbox,
  Quiz,
  CyberDefenseDesign,
}
