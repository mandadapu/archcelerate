import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe.skip('Week 1 Curriculum Seed', () => {
  let week1Id: string

  beforeAll(async () => {
    // Get Week 1 data
    const week1 = await prisma.curriculumWeek.findUnique({
      where: { weekNumber: 1 },
      include: {
        concepts: true,
        labs: true,
        projects: true,
      },
    })

    if (week1) {
      week1Id = week1.id
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Week 1 Metadata', () => {
    it('should have Week 1 curriculum created', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      expect(week1).toBeDefined()
      expect(week1?.weekNumber).toBe(1)
      expect(week1?.title).toBe('Foundations + Visual Builder Introduction')
      expect(week1?.active).toBe(true)
    })

    it('should have comprehensive description', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      expect(week1?.description).toContain('LLM fundamentals')
      expect(week1?.description).toContain('API integration')
      expect(week1?.description).toContain('visual agent building')
      expect(week1?.description).toContain('production-ready')
    })
  })

  describe('Week 1 Learning Objectives', () => {
    it('should have 28 comprehensive objectives', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      expect(Array.isArray(week1?.objectives)).toBe(true)
      expect(week1?.objectives).toHaveLength(28)
    })

    it('should include core technical understanding objectives', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for LLM fundamentals
      expect(objectives.some((obj: string) =>
        obj.includes('LLM fundamentals') && obj.includes('tokenization')
      )).toBe(true)

      // Check for prompt engineering
      expect(objectives.some((obj: string) =>
        obj.includes('prompt engineering') && obj.includes('zero-shot')
      )).toBe(true)

      // Check for API integration
      expect(objectives.some((obj: string) =>
        obj.includes('API integration') && obj.includes('streaming')
      )).toBe(true)
    })

    it('should include architectural decision objectives', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for architecture choices
      expect(objectives.some((obj: string) =>
        obj.includes('architecture choices') && obj.includes('serverless')
      )).toBe(true)

      // Check for state management
      expect(objectives.some((obj: string) =>
        obj.includes('state management')
      )).toBe(true)

      // Check for model tiers
      expect(objectives.some((obj: string) =>
        obj.includes('model tiers') && obj.includes('latency')
      )).toBe(true)
    })

    it('should include security and safety objectives', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for input validation
      expect(objectives.some((obj: string) =>
        obj.includes('input validation') && obj.includes('prompt injection')
      )).toBe(true)

      // Check for content filtering
      expect(objectives.some((obj: string) =>
        obj.includes('content filtering') && obj.includes('guardrails')
      )).toBe(true)

      // Check for API key security
      expect(objectives.some((obj: string) =>
        obj.includes('API keys') && obj.includes('environment variables')
      )).toBe(true)
    })

    it('should include production considerations', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for token limits
      expect(objectives.some((obj: string) =>
        obj.includes('token limits') && obj.includes('context window')
      )).toBe(true)

      // Check for error handling
      expect(objectives.some((obj: string) =>
        obj.includes('error handling')
      )).toBe(true)

      // Check for logging
      expect(objectives.some((obj: string) =>
        obj.includes('logging') && obj.includes('monitoring')
      )).toBe(true)
    })

    it('should include cost and performance objectives', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for pricing models
      expect(objectives.some((obj: string) =>
        obj.includes('pricing models') && obj.includes('per-token')
      )).toBe(true)

      // Check for prompt optimization
      expect(objectives.some((obj: string) =>
        obj.includes('prompt design') && obj.includes('token usage')
      )).toBe(true)

      // Check for caching
      expect(objectives.some((obj: string) =>
        obj.includes('caching')
      )).toBe(true)
    })

    it('should include domain-specific use cases', async () => {
      const week1 = await prisma.curriculumWeek.findUnique({
        where: { weekNumber: 1 },
      })

      const objectives = week1?.objectives as string[]

      // Check for customer support
      expect(objectives.some((obj: string) =>
        obj.includes('Customer Support')
      )).toBe(true)

      // Check for technical documentation
      expect(objectives.some((obj: string) =>
        obj.includes('Technical Documentation')
      )).toBe(true)

      // Check for content creation
      expect(objectives.some((obj: string) =>
        obj.includes('Content Creation')
      )).toBe(true)
    })
  })

  describe('Week 1 Concepts', () => {
    it('should have 8 concepts', async () => {
      const concepts = await prisma.concept.findMany({
        where: { weekId: week1Id },
        orderBy: { orderIndex: 'asc' },
      })

      expect(concepts).toHaveLength(8)
    })

    it('should have core foundation concepts', async () => {
      const concepts = await prisma.concept.findMany({
        where: { weekId: week1Id },
        orderBy: { orderIndex: 'asc' },
      })

      const slugs = concepts.map(c => c.slug)

      expect(slugs).toContain('llm-fundamentals')
      expect(slugs).toContain('prompt-engineering')
      expect(slugs).toContain('api-integration')
      expect(slugs).toContain('visual-builders')
    })

    it('should have new architectural and operational concepts', async () => {
      const concepts = await prisma.concept.findMany({
        where: { weekId: week1Id },
        orderBy: { orderIndex: 'asc' },
      })

      const slugs = concepts.map(c => c.slug)

      expect(slugs).toContain('architecture-decisions')
      expect(slugs).toContain('security-safety')
      expect(slugs).toContain('production-deployment')
      expect(slugs).toContain('cost-performance')
    })

    it('should have estimated minutes for each concept', async () => {
      const concepts = await prisma.concept.findMany({
        where: { weekId: week1Id },
      })

      concepts.forEach(concept => {
        expect(concept.estimatedMinutes).toBeGreaterThan(0)
        expect(concept.estimatedMinutes).toBeLessThanOrEqual(60)
      })
    })

    it('should have total ~370 minutes of content', async () => {
      const concepts = await prisma.concept.findMany({
        where: { weekId: week1Id },
      })

      const totalMinutes = concepts.reduce((sum, c) => sum + c.estimatedMinutes, 0)

      expect(totalMinutes).toBeGreaterThanOrEqual(360)
      expect(totalMinutes).toBeLessThanOrEqual(380)
    })
  })

  describe('Week 1 Labs', () => {
    it('should have 2 labs', async () => {
      const labs = await prisma.lab.findMany({
        where: { weekId: week1Id },
      })

      expect(labs).toHaveLength(2)
    })

    it('should have Visual Builder lab', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'visual-to-code' },
      })

      expect(lab).toBeDefined()
      expect(lab?.title).toBe('Visual Builder → Code Translation')
      expect(lab?.weekId).toBe(week1Id)
    })

    it('should have Cost & Performance Analysis lab', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      expect(lab).toBeDefined()
      expect(lab?.title).toBe('Cost & Performance Analysis')
      expect(lab?.weekId).toBe(week1Id)
    })

    it('should have 4 exercises in Cost & Performance lab', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      const exercises = lab?.exercises as any[]

      expect(exercises).toHaveLength(4)
    })

    it('should have detailed guidance for each exercise', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      const exercises = lab?.exercises as any[]

      exercises.forEach((exercise: any) => {
        expect(exercise.title).toBeDefined()
        expect(exercise.guidance).toBeDefined()
        expect(exercise.steps).toBeDefined()
        expect(Array.isArray(exercise.steps)).toBe(true)
        expect(exercise.steps.length).toBeGreaterThan(0)
      })
    })

    it('should include token counting exercise', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      const exercises = lab?.exercises as any[]
      const tokenExercise = exercises.find((e: any) =>
        e.title.includes('Token Counting')
      )

      expect(tokenExercise).toBeDefined()
      expect(tokenExercise.guidance).toContain('Anthropic API tokenizer')
      expect(tokenExercise.steps).toBeDefined()
    })

    it('should include cost calculation exercise', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      const exercises = lab?.exercises as any[]
      const costExercise = exercises.find((e: any) =>
        e.title.includes('Cost Calculation')
      )

      expect(costExercise).toBeDefined()
      expect(costExercise.guidance).toContain('10,000 conversations')
      expect(costExercise.steps.length).toBeGreaterThanOrEqual(5)
    })

    it('should include model comparison exercise', async () => {
      const lab = await prisma.lab.findUnique({
        where: { slug: 'cost-performance-lab' },
      })

      const exercises = lab?.exercises as any[]
      const modelExercise = exercises.find((e: any) =>
        e.title.includes('Model Comparison')
      )

      expect(modelExercise).toBeDefined()
      expect(modelExercise.guidance).toContain('Haiku')
      expect(modelExercise.guidance).toContain('Sonnet')
      expect(modelExercise.guidance).toContain('Opus')
    })
  })

  describe('Week 1 Project', () => {
    it('should have Chat Assistant project', async () => {
      const project = await prisma.weekProject.findUnique({
        where: { slug: 'chat-assistant-dual' },
      })

      expect(project).toBeDefined()
      expect(project?.title).toBe('Chat Assistant (Dual Implementation)')
      expect(project?.weekId).toBe(week1Id)
    })

    it('should have requirements and success criteria', async () => {
      const project = await prisma.weekProject.findUnique({
        where: { slug: 'chat-assistant-dual' },
      })

      expect(Array.isArray(project?.requirements)).toBe(true)
      expect(project?.requirements.length).toBeGreaterThan(0)
      expect(Array.isArray(project?.successCriteria)).toBe(true)
      expect(project?.successCriteria.length).toBeGreaterThan(0)
    })

    it('should require both visual and code implementations', async () => {
      const project = await prisma.weekProject.findUnique({
        where: { slug: 'chat-assistant-dual' },
      })

      const requirements = project?.requirements as string[]

      expect(requirements.some((r: string) =>
        r.includes('visual prototype')
      )).toBe(true)
      expect(requirements.some((r: string) =>
        r.includes('production code')
      )).toBe(true)
    })

    it('should have estimated hours', async () => {
      const project = await prisma.weekProject.findUnique({
        where: { slug: 'chat-assistant-dual' },
      })

      expect(project?.estimatedHours).toBeGreaterThan(0)
      expect(project?.estimatedHours).toBe(5)
    })
  })
})
