'use client'

import { useEffect, useState } from 'react'
import { CompletionChart } from './CompletionChart'
import { BookOpen, Clock, Award, TrendingUp, Flame } from 'lucide-react'
import { formatDuration } from '@/src/lib/analytics/progress-tracking'

interface ProgressDashboardProps {
  userId: string
}

interface DashboardData {
  stats: {
    totalModules: number
    completedModules: number
    totalLessons: number
    completedLessons: number
    totalTimeSpent: number
    overallProgress: number
    streakDays: number
  }
  dailyActivity: Array<{ date: string; lessonsCompleted: number; timeSpent: number }>
  difficultyBreakdown: Array<{ difficulty: string; completed: number; total: number }>
  moduleCompletion: Array<{ moduleTitle: string; progress: number }>
}

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch(`/api/progress/stats?userId=${userId}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-12">
        Failed to load progress data
      </div>
    )
  }

  const { stats, dailyActivity, difficultyBreakdown, moduleCompletion } = data

  // Format data for charts
  const difficultyChartData = difficultyBreakdown.map((item) => ({
    name: item.difficulty,
    completed: item.completed,
    remaining: item.total - item.completed,
  }))

  const activityChartData = dailyActivity.map((item) => ({
    name: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    lessons: item.lessonsCompleted,
    time: item.timeSpent,
  }))

  const moduleChartData = moduleCompletion.map((item) => ({
    name: item.moduleTitle.length > 20
      ? item.moduleTitle.substring(0, 20) + '...'
      : item.moduleTitle,
    progress: item.progress,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="text-purple-600" size={24} />}
          title="Lessons Completed"
          value={stats.completedLessons}
          total={stats.totalLessons}
          color="purple"
        />
        <StatCard
          icon={<Award className="text-blue-600" size={24} />}
          title="Modules Completed"
          value={stats.completedModules}
          total={stats.totalModules}
          color="blue"
        />
        <StatCard
          icon={<Clock className="text-green-600" size={24} />}
          title="Time Spent"
          value={formatDuration(stats.totalTimeSpent)}
          color="green"
        />
        <StatCard
          icon={<Flame className="text-orange-600" size={24} />}
          title="Streak"
          value={`${stats.streakDays} days`}
          color="orange"
        />
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold text-purple-600">
            {stats.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${stats.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CompletionChart
            type="line"
            data={activityChartData}
            dataKey="lessons"
            xAxisKey="name"
            title="Daily Activity (Last 7 Days)"
          />
        </div>

        {/* Module Completion */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <CompletionChart
            type="bar"
            data={moduleChartData}
            dataKey="progress"
            xAxisKey="name"
            title="Module Completion"
          />
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Difficulty Breakdown</h3>
          <div className="space-y-3">
            {difficultyBreakdown.map((item) => (
              <div key={item.difficulty}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {item.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    {item.completed}/{item.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.difficulty === 'beginner'
                        ? 'bg-green-500'
                        : item.difficulty === 'intermediate'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(item.completed / item.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Learning Insights</h3>
          <div className="space-y-4">
            <InsightCard
              icon={<TrendingUp size={20} className="text-green-600" />}
              title="Completion Rate"
              value={`${Math.round((stats.completedLessons / stats.totalLessons) * 100)}%`}
              description="of total lessons completed"
            />
            <InsightCard
              icon={<Clock size={20} className="text-blue-600" />}
              title="Avg. Time per Lesson"
              value={formatDuration(
                Math.round(stats.totalTimeSpent / (stats.completedLessons || 1))
              )}
              description="average lesson duration"
            />
            <InsightCard
              icon={<BookOpen size={20} className="text-purple-600" />}
              title="Active Modules"
              value={`${stats.totalModules - stats.completedModules}`}
              description="modules in progress"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  total,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  total?: number
  color: string
}) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  return (
    <div
      className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}
    >
      <div className="flex items-center gap-3 mb-3">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value}
        {total !== undefined && (
          <span className="text-lg text-gray-500">/{total}</span>
        )}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

function InsightCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-2xl font-bold text-gray-900 my-1">{value}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </div>
  )
}
