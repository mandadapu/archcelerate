import { describe, it, expect } from '@jest/globals'

describe('Week 1 Curriculum Data Structure', () => {
  // Week 1 objectives as defined in seed script
  const week1Objectives = [
    // Core Technical Understanding
    'Understand LLM fundamentals: tokenization, context windows, and model capabilities',
    'Master prompt engineering patterns: zero-shot, few-shot, chain-of-thought reasoning',
    'Learn API integration patterns: streaming responses, error handling, retry logic',
    'Experience visual agent building before coding to understand abstraction layers',

    // Architectural Decisions
    'Evaluate architecture choices: serverless vs long-running, synchronous vs streaming',
    'Design conversation state management: in-memory, database, or distributed cache',
    'Choose appropriate model tiers based on latency, cost, and quality trade-offs',
    'Implement rate limiting strategies to prevent abuse and control costs',

    // Security & Safety
    'Implement input validation and sanitization to prevent prompt injection attacks',
    'Add content filtering and guardrails to detect harmful or inappropriate outputs',
    'Secure API keys using environment variables and secret management',
    'Implement proper authentication and authorization for production deployments',

    // Production Considerations
    'Handle token limits and implement context window management strategies',
    'Implement error handling for API failures, rate limits, and timeouts',
    'Add comprehensive logging and monitoring for debugging and analytics',
    'Design graceful degradation when AI services are unavailable',

    // Cost & Performance
    'Understand pricing models: per-token costs, caching strategies, batch processing',
    'Optimize prompt design to reduce token usage without sacrificing quality',
    'Implement response caching for frequently asked questions',
    'Monitor and set budget alerts to prevent unexpected costs',

    // Domain-Specific Use Cases
    'Customer Support: Context-aware responses with conversation history',
    'Technical Documentation: Code generation and explanation capabilities',
    'Content Creation: SEO-friendly copy with brand voice consistency',
    'Data Analysis: Natural language queries to structured data insights',

    // Implementation Implications
    'Understand latency implications: real-time chat vs batch processing',
    'Consider compliance requirements: data retention, GDPR, user privacy',
    'Plan for scaling: connection pooling, load balancing, distributed systems',
    'Build production-ready chat assistant with all best practices integrated'
  ]

  const week1Concepts = [
    { slug: 'llm-fundamentals', title: 'LLM Fundamentals', estimatedMinutes: 45 },
    { slug: 'prompt-engineering', title: 'Prompt Engineering Mastery', estimatedMinutes: 60 },
    { slug: 'api-integration', title: 'API Integration Patterns', estimatedMinutes: 45 },
    { slug: 'visual-builders', title: 'Visual Agent Builders', estimatedMinutes: 30 },
    { slug: 'architecture-decisions', title: 'AI Architecture & Design Patterns', estimatedMinutes: 50 },
    { slug: 'security-safety', title: 'Security & Safety in AI Systems', estimatedMinutes: 40 },
    { slug: 'production-deployment', title: 'Production Deployment & Operations', estimatedMinutes: 55 },
    { slug: 'cost-performance', title: 'Cost Optimization & Performance', estimatedMinutes: 45 },
  ]

  const costPerformanceLab = {
    slug: 'cost-performance-lab',
    title: 'Cost & Performance Analysis',
    exercises: [
      {
        title: 'Token Counting Exercise',
        type: 'coding',
        hasGuidance: true,
        hasSteps: true,
        expectedSteps: 5
      },
      {
        title: 'Cost Calculation Exercise',
        type: 'analysis',
        hasGuidance: true,
        hasSteps: true,
        expectedSteps: 6
      },
      {
        title: 'Model Comparison Exercise',
        type: 'coding',
        hasGuidance: true,
        hasSteps: true,
        expectedSteps: 6
      },
      {
        title: 'Prompt Optimization for Cost',
        type: 'coding',
        hasGuidance: true,
        hasSteps: true,
        expectedSteps: 6
      }
    ]
  }

  describe('Learning Objectives Structure', () => {
    it('should have exactly 28 comprehensive objectives', () => {
      expect(week1Objectives).toHaveLength(28)
    })

    it('should cover 7 major categories (4 objectives each)', () => {
      // Core Technical: 4 objectives
      const coreTech = week1Objectives.slice(0, 4)
      expect(coreTech.length).toBe(4)
      expect(coreTech[0]).toContain('LLM fundamentals')

      // Architectural: 4 objectives
      const architectural = week1Objectives.slice(4, 8)
      expect(architectural.length).toBe(4)
      expect(architectural[0]).toContain('architecture choices')

      // Security: 4 objectives
      const security = week1Objectives.slice(8, 12)
      expect(security.length).toBe(4)
      expect(security[0]).toContain('input validation')

      // Production: 4 objectives
      const production = week1Objectives.slice(12, 16)
      expect(production.length).toBe(4)
      expect(production[0]).toContain('token limits')

      // Cost: 4 objectives
      const cost = week1Objectives.slice(16, 20)
      expect(cost.length).toBe(4)
      expect(cost[0]).toContain('pricing models')

      // Domain: 4 objectives
      const domain = week1Objectives.slice(20, 24)
      expect(domain.length).toBe(4)
      expect(domain[0]).toContain('Customer Support')

      // Implementation: 4 objectives
      const implementation = week1Objectives.slice(24, 28)
      expect(implementation.length).toBe(4)
      expect(implementation[0]).toContain('latency implications')
    })

    it('should include specific technical terms and concepts', () => {
      const allObjectives = week1Objectives.join(' ')

      // Technical terms
      expect(allObjectives).toContain('tokenization')
      expect(allObjectives).toContain('context windows')
      expect(allObjectives).toContain('streaming')
      expect(allObjectives).toContain('API integration')

      // Architectural concepts
      expect(allObjectives).toContain('serverless')
      expect(allObjectives).toContain('distributed cache')
      expect(allObjectives).toContain('load balancing')

      // Security concepts
      expect(allObjectives).toContain('prompt injection')
      expect(allObjectives).toContain('guardrails')
      expect(allObjectives).toContain('authentication')

      // Cost concepts
      expect(allObjectives).toContain('per-token costs')
      expect(allObjectives).toContain('caching')
      expect(allObjectives).toContain('budget alerts')
    })
  })

  describe('Concepts Structure', () => {
    it('should have 8 concepts', () => {
      expect(week1Concepts).toHaveLength(8)
    })

    it('should include 4 foundation concepts', () => {
      const foundationSlugs = week1Concepts.slice(0, 4).map(c => c.slug)

      expect(foundationSlugs).toContain('llm-fundamentals')
      expect(foundationSlugs).toContain('prompt-engineering')
      expect(foundationSlugs).toContain('api-integration')
      expect(foundationSlugs).toContain('visual-builders')
    })

    it('should include 4 advanced operational concepts', () => {
      const advancedSlugs = week1Concepts.slice(4, 8).map(c => c.slug)

      expect(advancedSlugs).toContain('architecture-decisions')
      expect(advancedSlugs).toContain('security-safety')
      expect(advancedSlugs).toContain('production-deployment')
      expect(advancedSlugs).toContain('cost-performance')
    })

    it('should have total ~370 minutes (6+ hours) of content', () => {
      const totalMinutes = week1Concepts.reduce((sum, c) => sum + c.estimatedMinutes, 0)

      expect(totalMinutes).toBeGreaterThanOrEqual(360)
      expect(totalMinutes).toBeLessThanOrEqual(380)
      expect(totalMinutes).toBe(370)
    })

    it('should have reasonable time estimates per concept', () => {
      week1Concepts.forEach(concept => {
        expect(concept.estimatedMinutes).toBeGreaterThanOrEqual(30)
        expect(concept.estimatedMinutes).toBeLessThanOrEqual(60)
      })
    })
  })

  describe('Cost & Performance Lab Structure', () => {
    it('should have 4 exercises', () => {
      expect(costPerformanceLab.exercises).toHaveLength(4)
    })

    it('should have correct exercise types', () => {
      const types = costPerformanceLab.exercises.map(e => e.type)

      expect(types).toContain('coding')
      expect(types).toContain('analysis')
      expect(types.filter(t => t === 'coding').length).toBe(3)
      expect(types.filter(t => t === 'analysis').length).toBe(1)
    })

    it('should have comprehensive guidance for each exercise', () => {
      costPerformanceLab.exercises.forEach(exercise => {
        expect(exercise.hasGuidance).toBe(true)
        expect(exercise.hasSteps).toBe(true)
        expect(exercise.expectedSteps).toBeGreaterThanOrEqual(5)
      })
    })

    it('should cover token counting', () => {
      const hasTokenExercise = costPerformanceLab.exercises.some(e =>
        e.title.includes('Token Counting')
      )
      expect(hasTokenExercise).toBe(true)
    })

    it('should cover cost calculation', () => {
      const hasCostExercise = costPerformanceLab.exercises.some(e =>
        e.title.includes('Cost Calculation')
      )
      expect(hasCostExercise).toBe(true)
    })

    it('should cover model comparison', () => {
      const hasModelExercise = costPerformanceLab.exercises.some(e =>
        e.title.includes('Model Comparison')
      )
      expect(hasModelExercise).toBe(true)
    })

    it('should cover prompt optimization', () => {
      const hasOptimizationExercise = costPerformanceLab.exercises.some(e =>
        e.title.includes('Prompt Optimization')
      )
      expect(hasOptimizationExercise).toBe(true)
    })
  })

  describe('Curriculum Alignment', () => {
    it('should align concept slugs with objective categories', () => {
      const conceptSlugs = week1Concepts.map(c => c.slug)
      const objectivesText = week1Objectives.join(' ').toLowerCase()

      // LLM fundamentals concept aligns with fundamentals objectives
      expect(conceptSlugs).toContain('llm-fundamentals')
      expect(objectivesText).toContain('llm fundamentals')

      // Architecture concept aligns with architectural objectives
      expect(conceptSlugs).toContain('architecture-decisions')
      expect(objectivesText).toContain('architecture choices')

      // Security concept aligns with security objectives
      expect(conceptSlugs).toContain('security-safety')
      expect(objectivesText).toContain('input validation')

      // Cost concept aligns with cost objectives
      expect(conceptSlugs).toContain('cost-performance')
      expect(objectivesText).toContain('pricing models')
    })

    it('should have lab exercises that support learning objectives', () => {
      const objectivesText = week1Objectives.join(' ')

      // Token counting exercise supports tokenization objective
      expect(objectivesText).toContain('tokenization')
      expect(costPerformanceLab.exercises[0].title).toContain('Token Counting')

      // Cost calculation exercise supports pricing objective
      expect(objectivesText).toContain('pricing models')
      expect(costPerformanceLab.exercises[1].title).toContain('Cost Calculation')

      // Model comparison exercise supports model tier objective
      expect(objectivesText).toContain('model tiers')
      expect(costPerformanceLab.exercises[2].title).toContain('Model Comparison')

      // Optimization exercise supports token usage objective
      expect(objectivesText).toContain('token usage')
      expect(costPerformanceLab.exercises[3].title).toContain('Optimization')
    })
  })
})
