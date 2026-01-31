import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSprintById } from '@/lib/content-loader'
import { LabContainer } from '@/components/labs/LabContainer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function LabPage({
  params,
}: {
  params: { sprintId: string; slug: string }
}) {
  const sprintId = params.sprintId
  const labSlug = params.slug

  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const sprint = await getSprintById(sprintId)

  if (!sprint) {
    return <div>Sprint not found</div>
  }

  // Example lab data (in real implementation, load from files or database)
  // TODO: Create lab content files in content/sprints/{sprintId}/labs/{slug}.json
  const labData = {
    title: labSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    instructions: 'Complete the function below to solve the coding challenge. Run your code to test it, then submit when you\'re ready.',
    starterCode: `function solution(input) {\n  // Your code here\n  return result;\n}`,
    testCases: [
      { input: 'solution([1, 2, 3])', expectedOutput: '6', description: 'Sum of array [1,2,3] should equal 6' },
      { input: 'solution([10, 20])', expectedOutput: '30', description: 'Sum of array [10,20] should equal 30' },
      { input: 'solution([])', expectedOutput: '0', description: 'Sum of empty array should equal 0' },
    ],
  }

  // Find concept ID (use first concept as default for now)
  const conceptId = sprint.concepts?.[0]?.id || 'default-concept'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {labData.title}
          </h1>
          <p className="text-slate-600">
            {sprint.title} • Coding Challenge
          </p>
        </div>
        <Link href={`/learn/${sprintId}`}>
          <Button variant="outline">Back to Sprint</Button>
        </Link>
      </div>

      <LabContainer
        labSlug={labSlug}
        sprintId={sprintId}
        conceptId={conceptId}
        title={labData.title}
        instructions={labData.instructions}
        starterCode={labData.starterCode}
        testCases={labData.testCases}
      />
    </div>
  )
}
