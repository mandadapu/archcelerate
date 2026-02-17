'use client'

import type { JSX, ReactNode } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface WeekContentTabsProps {
  conceptsCompleted: number
  conceptsTotal: number
  labCompleted: boolean
  projectCompleted: boolean
  hasLab: boolean
  hasProject: boolean
  conceptsContent: ReactNode
  labContent: ReactNode
  projectContent: ReactNode
}

function StatusIcon({ completed }: { completed: boolean }): JSX.Element {
  return completed ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
  ) : (
    <Circle className="h-3.5 w-3.5 text-gray-400" />
  )
}

export function WeekContentTabs({
  conceptsCompleted,
  conceptsTotal,
  labCompleted,
  projectCompleted,
  hasLab,
  hasProject,
  conceptsContent,
  labContent,
  projectContent,
}: WeekContentTabsProps): JSX.Element {
  return (
    <Tabs defaultValue="concepts" className="w-full">
      <TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-auto">
        <TabsTrigger
          value="concepts"
          className="flex items-center gap-1.5 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-300 rounded-full px-4 py-2 text-sm"
        >
          <StatusIcon completed={conceptsCompleted === conceptsTotal && conceptsTotal > 0} />
          <span>Concepts {conceptsCompleted}/{conceptsTotal}</span>
        </TabsTrigger>
        {hasLab && (
          <TabsTrigger
            value="lab"
            className="flex items-center gap-1.5 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-300 rounded-full px-4 py-2 text-sm"
          >
            <StatusIcon completed={labCompleted} />
            <span>Lab</span>
          </TabsTrigger>
        )}
        {hasProject && (
          <TabsTrigger
            value="project"
            className="flex items-center gap-1.5 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-300 rounded-full px-4 py-2 text-sm"
          >
            <StatusIcon completed={projectCompleted} />
            <span>Project</span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="concepts" className="mt-6">
        {conceptsContent}
      </TabsContent>
      {hasLab && (
        <TabsContent value="lab" className="mt-6">
          {labContent}
        </TabsContent>
      )}
      {hasProject && (
        <TabsContent value="project" className="mt-6">
          {projectContent}
        </TabsContent>
      )}
    </Tabs>
  )
}
