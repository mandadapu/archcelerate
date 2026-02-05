import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Proficiency levels based on percentage thresholds
 */
export type ProficiencyLevel = 'junior' | 'mid' | 'lead' | 'architect'

export interface DomainScore {
  domainId: string
  domainName: string
  domainSlug: string
  totalPoints: number
  maxPoints: number
  percentage: number
  proficiencyLevel: ProficiencyLevel
  activities: ActivityScore[]
  orderIndex: number
}

export interface ActivityScore {
  activityId: string
  activitySlug: string
  activityTitle: string
  weekNumber: number
  activityType: 'lab' | 'project'
  maxPoints: number // Max points for this domain in this activity
  earnedPoints: number // Points earned by user
  scorePercentage: number // User's score percentage for this activity
  completedAt?: Date
}

export interface OverallScore {
  userId: string
  overallProficiency: number // Weighted average across all domains
  proficiencyLevel: ProficiencyLevel
  domains: DomainScore[]
  completedActivities: number
  totalActivities: number
  updatedAt: Date
}

/**
 * Get proficiency level from percentage score
 */
export function getProficiencyLevel(percentage: number): ProficiencyLevel {
  if (percentage >= 96) return 'architect'
  if (percentage >= 81) return 'lead'
  if (percentage >= 61) return 'mid'
  return 'junior'
}

/**
 * Get proficiency level display information
 */
export function getProficiencyLevelInfo(level: ProficiencyLevel) {
  const info = {
    junior: {
      label: 'Junior',
      color: '#94a3b8', // slate-400
      description: 'Building foundational skills',
      range: '0-60'
    },
    mid: {
      label: 'Mid-Level',
      color: '#60a5fa', // blue-400
      description: 'Solid competency across domains',
      range: '61-80'
    },
    lead: {
      label: 'Technical Lead',
      color: '#34d399', // emerald-400
      description: 'Lead-level proficiency',
      range: '81-95'
    },
    architect: {
      label: 'AI Architect',
      color: '#a78bfa', // violet-400
      description: 'Distinguished architectural authority',
      range: '96-100'
    }
  }

  return info[level]
}

/**
 * Calculate domain score for a user based on their activity completions
 */
export async function calculateDomainScore(
  userId: string,
  domainId: string
): Promise<DomainScore | null> {
  // Get domain info
  const domain = await prisma.skillDomain.findUnique({
    where: { id: domainId },
    include: {
      activityMappings: {
        include: {
          activity: true
        }
      }
    }
  })

  if (!domain) return null

  // Get user's activity scores
  const userActivityScores = await prisma.userActivityScore.findMany({
    where: { userId }
  })

  const activityScoreMap = new Map(
    userActivityScores.map(score => [score.activityId, score])
  )

  // Calculate points for each activity
  const activities: ActivityScore[] = []
  let totalPointsEarned = 0
  let maxPointsPossible = 0

  for (const mapping of domain.activityMappings) {
    const userScore = activityScoreMap.get(mapping.activityId)
    const scorePercentage = userScore?.scorePercentage || 0
    const earnedPoints = (scorePercentage / 100) * mapping.maxPoints

    maxPointsPossible += mapping.maxPoints
    totalPointsEarned += earnedPoints

    activities.push({
      activityId: mapping.activityId,
      activitySlug: mapping.activity.slug,
      activityTitle: mapping.activity.title,
      weekNumber: mapping.activity.weekNumber,
      activityType: mapping.activity.activityType as 'lab' | 'project',
      maxPoints: mapping.maxPoints,
      earnedPoints,
      scorePercentage,
      completedAt: userScore?.completedAt
    })
  }

  // Calculate percentage and proficiency level
  const percentage = maxPointsPossible > 0 ? (totalPointsEarned / maxPointsPossible) * 100 : 0
  const proficiencyLevel = getProficiencyLevel(percentage)

  return {
    domainId: domain.id,
    domainName: domain.name,
    domainSlug: domain.slug,
    totalPoints: Math.round(totalPointsEarned * 100) / 100, // Round to 2 decimals
    maxPoints: maxPointsPossible,
    percentage: Math.round(percentage * 100) / 100,
    proficiencyLevel,
    activities: activities.sort((a, b) => a.weekNumber - b.weekNumber),
    orderIndex: domain.orderIndex
  }
}

/**
 * Calculate overall skill score for a user across all domains
 */
export async function calculateOverallScore(userId: string): Promise<OverallScore> {
  // Get all domains
  const domains = await prisma.skillDomain.findMany({
    orderBy: { orderIndex: 'asc' }
  })

  // Calculate score for each domain
  const domainScores: DomainScore[] = []
  for (const domain of domains) {
    const score = await calculateDomainScore(userId, domain.id)
    if (score) {
      domainScores.push(score)
    }
  }

  // Calculate overall proficiency (average of all domains)
  const overallProficiency = domainScores.length > 0
    ? domainScores.reduce((sum, d) => sum + d.percentage, 0) / domainScores.length
    : 0

  // Count completed activities
  const allActivities = await prisma.activity.count()
  const completedActivities = await prisma.userActivityScore.count({
    where: {
      userId,
      scorePercentage: { gte: 70 } // Consider 70%+ as "completed"
    }
  })

  return {
    userId,
    overallProficiency: Math.round(overallProficiency * 100) / 100,
    proficiencyLevel: getProficiencyLevel(overallProficiency),
    domains: domainScores,
    completedActivities,
    totalActivities: allActivities,
    updatedAt: new Date()
  }
}

/**
 * Update user skill scores in database
 * This should be called whenever a user completes an activity
 */
export async function updateUserSkillScores(
  userId: string,
  activityId: string,
  scorePercentage: number
): Promise<void> {
  // Record the activity score
  await prisma.userActivityScore.upsert({
    where: {
      userId_activityId: {
        userId,
        activityId
      }
    },
    create: {
      userId,
      activityId,
      weekNumber: 0, // Will be updated below
      activityType: 'lab', // Will be updated below
      scorePercentage,
      completedAt: new Date()
    },
    update: {
      scorePercentage,
      completedAt: new Date()
    }
  })

  // Get activity info to update week number and type
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      domainMappings: {
        include: {
          domain: true
        }
      }
    }
  })

  if (!activity) return

  // Update the activity score with week and type info
  await prisma.userActivityScore.update({
    where: {
      userId_activityId: {
        userId,
        activityId
      }
    },
    data: {
      weekNumber: activity.weekNumber,
      activityType: activity.activityType
    }
  })

  // Update domain scores for all affected domains
  for (const mapping of activity.domainMappings) {
    const domainScore = await calculateDomainScore(userId, mapping.domainId)

    if (domainScore) {
      await prisma.userSkillScore.upsert({
        where: {
          userId_domainId: {
            userId,
            domainId: mapping.domainId
          }
        },
        create: {
          userId,
          domainId: mapping.domainId,
          totalPoints: domainScore.totalPoints,
          maxPoints: domainScore.maxPoints,
          percentage: domainScore.percentage,
          proficiencyLevel: domainScore.proficiencyLevel,
          lastActivityAt: new Date()
        },
        update: {
          totalPoints: domainScore.totalPoints,
          maxPoints: domainScore.maxPoints,
          percentage: domainScore.percentage,
          proficiencyLevel: domainScore.proficiencyLevel,
          lastActivityAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
  }
}

/**
 * Get skill gaps and recommendations for a user
 */
export interface SkillGap {
  domainName: string
  domainSlug: string
  currentLevel: number
  targetLevel: number
  gap: number
  priority: 'high' | 'medium' | 'low'
  recommendations: string[]
}

export async function getSkillGaps(userId: string): Promise<SkillGap[]> {
  const overallScore = await calculateOverallScore(userId)
  const gaps: SkillGap[] = []

  // Target: All domains at 80+ for "Lead" level
  const targetLevel = 80

  for (const domain of overallScore.domains) {
    if (domain.percentage < targetLevel) {
      const gap = targetLevel - domain.percentage
      const priority: 'high' | 'medium' | 'low' =
        gap > 40 ? 'high' : gap > 20 ? 'medium' : 'low'

      // Get incomplete activities for recommendations
      const incompleteActivities = domain.activities
        .filter(a => a.scorePercentage < 70)
        .slice(0, 3) // Top 3 recommendations

      const recommendations = incompleteActivities.map(a =>
        `Complete Week ${a.weekNumber} ${a.activityType === 'lab' ? 'Lab' : 'Project'}: ${a.activityTitle}`
      )

      gaps.push({
        domainName: domain.domainName,
        domainSlug: domain.domainSlug,
        currentLevel: domain.percentage,
        targetLevel,
        gap,
        priority,
        recommendations
      })
    }
  }

  // Sort by gap size (highest first)
  return gaps.sort((a, b) => b.gap - a.gap)
}

/**
 * Get certification status for a user
 */
export interface CertificationStatus {
  isEligible: boolean
  level: 'junior' | 'mid' | 'lead' | 'architect' | 'none'
  overallProficiency: number
  requirementsMet: {
    allDomainsAbove70: boolean
    fourDomainsAbove85: boolean
    overallAbove80: boolean
  }
  verificationSummary: string
}

export async function getCertificationStatus(userId: string): Promise<CertificationStatus> {
  const overallScore = await calculateOverallScore(userId)

  const domainsAbove70 = overallScore.domains.filter(d => d.percentage >= 70).length
  const domainsAbove85 = overallScore.domains.filter(d => d.percentage >= 85).length
  const allDomainsAbove70 = domainsAbove70 === 7
  const fourDomainsAbove85 = domainsAbove85 >= 4
  const overallAbove80 = overallScore.overallProficiency >= 80

  const isEligible = allDomainsAbove70 && fourDomainsAbove85 && overallAbove80

  // Determine certification level
  let level: CertificationStatus['level'] = 'none'
  if (overallScore.overallProficiency >= 87 && overallScore.domains.every(d => d.percentage >= 80)) {
    level = 'architect'
  } else if (isEligible) {
    level = 'lead'
  } else if (overallScore.overallProficiency >= 61) {
    level = 'mid'
  } else if (overallScore.overallProficiency > 0) {
    level = 'junior'
  }

  // Generate verification summary
  const topDomains = overallScore.domains
    .filter(d => d.percentage >= 85)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map(d => `${d.domainName} (${Math.round(d.percentage)}th percentile)`)

  const verificationSummary = topDomains.length > 0
    ? `The candidate has demonstrated high proficiency in ${topDomains.join(' and ')}, with proven experience across ${domainsAbove85} advanced domains.`
    : `The candidate is building foundational skills across ${domainsAbove70} of 7 core AI architecture domains.`

  return {
    isEligible,
    level,
    overallProficiency: overallScore.overallProficiency,
    requirementsMet: {
      allDomainsAbove70,
      fourDomainsAbove85,
      overallAbove80
    },
    verificationSummary
  }
}

/**
 * Generate radar chart data for visualization
 */
export interface RadarChartDataPoint {
  domain: string
  score: number
  fullMark: 100
}

export async function getRadarChartData(userId: string): Promise<RadarChartDataPoint[]> {
  const overallScore = await calculateOverallScore(userId)

  return overallScore.domains.map(domain => ({
    domain: domain.domainName,
    score: Math.round(domain.percentage),
    fullMark: 100
  }))
}
