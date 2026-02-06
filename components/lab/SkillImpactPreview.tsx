import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { TrendingUp } from 'lucide-react'

interface SkillImpactPreviewProps {
  labSlug: string
}

interface DomainMapping {
  domainSlug: string
  domainName: string
  maxPoints: number
  isPrimary: boolean
}

async function getActivityDomainMappings(labSlug: string): Promise<DomainMapping[]> {
  const activity = await prisma.activity.findFirst({
    where: {
      slug: labSlug,
      activityType: 'lab'
    },
    include: {
      domainMappings: {
        include: {
          domain: true
        },
        orderBy: [
          { isPrimary: 'desc' }, // Primary domains first
          { maxPoints: 'desc' }  // Then by points
        ]
      }
    }
  })

  if (!activity) {
    return []
  }

  return activity.domainMappings.map(mapping => ({
    domainSlug: mapping.domain.slug,
    domainName: mapping.domain.name,
    maxPoints: mapping.maxPoints,
    isPrimary: mapping.isPrimary
  }))
}

export async function SkillImpactPreview({ labSlug }: SkillImpactPreviewProps) {
  const mappings = await getActivityDomainMappings(labSlug)

  if (mappings.length === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Skill Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mappings.map((mapping) => (
            <div
              key={mapping.domainSlug}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {mapping.domainName}
              </span>
              <Badge
                variant={mapping.isPrimary ? 'default' : 'secondary'}
                className="ml-2"
              >
                +{mapping.maxPoints} pts
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          Complete this lab to earn points across {mappings.length} skill {mappings.length === 1 ? 'domain' : 'domains'}
        </p>
      </CardContent>
    </Card>
  )
}
