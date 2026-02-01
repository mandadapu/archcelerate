'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'

interface Metrics {
  totalUsers: number
  activeUsers: number
  totalModules: number
  totalLessons: number
  averageCompletionRate: number
  weeklySignups: number
  signupGrowth: number
}

interface AnalyticsDashboardProps {
  metrics: Metrics
}

export function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {metrics.weeklySignups} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-slate-600 mt-1">
              {metrics.totalUsers > 0
                ? ((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(0)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalModules}M / {metrics.totalLessons}L
            </div>
            <p className="text-xs text-slate-600 mt-1">Modules / Lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Signup Growth</CardTitle>
            {metrics.signupGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.signupGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.signupGrowth >= 0 ? '+' : ''}{metrics.signupGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-600 mt-1">vs last week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
