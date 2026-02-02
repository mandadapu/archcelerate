import { recommendPath, getUserProfileDefaults, AssessmentAnswers, LearningPath } from '../personalization'

describe('Onboarding Personalization', () => {
  describe('recommendPath', () => {
    describe('Beginner Path', () => {
      it('should recommend full curriculum for beginners', () => {
        const answers: AssessmentAnswers = {
          experience: 'beginner',
          ai_exposure: 'none',
          goal: 'learn',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'full',
          name: 'Full Curriculum (Beginner Pace)',
          modules: ['all'],
          recommendedPace: 'slow',
        })
      })

      it('should recommend full curriculum for those with no AI exposure', () => {
        const answers: AssessmentAnswers = {
          experience: 'intermediate',
          ai_exposure: 'none',
          goal: 'build',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'full',
          name: 'Full Curriculum (Beginner Pace)',
          modules: ['all'],
          recommendedPace: 'slow',
        })
      })
    })

    describe('Rapid Builder Path', () => {
      it('should recommend rapid builder for advanced devs who want to build', () => {
        const answers: AssessmentAnswers = {
          experience: 'advanced',
          ai_exposure: 'api',
          goal: 'build',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'rapid',
          name: 'Rapid Builder',
          modules: ['1', '2', '3', '5', '7'],
          skipModules: ['4', '6'],
          recommendedPace: 'fast',
        })
      })

      it('should recommend rapid builder for advanced devs with some AI exposure', () => {
        const answers: AssessmentAnswers = {
          experience: 'advanced',
          ai_exposure: 'some',
          goal: 'build',
        }

        const result = recommendPath(answers)

        expect(result.id).toBe('rapid')
        expect(result.recommendedPace).toBe('fast')
      })

      it('should recommend rapid builder for advanced devs with production experience', () => {
        const answers: AssessmentAnswers = {
          experience: 'advanced',
          ai_exposure: 'production',
          goal: 'build',
        }

        const result = recommendPath(answers)

        expect(result.id).toBe('rapid')
        expect(result.recommendedPace).toBe('fast')
      })
    })

    describe('RAG Specialist Path', () => {
      it('should recommend RAG specialist for learners with some AI exposure', () => {
        const answers: AssessmentAnswers = {
          experience: 'intermediate',
          ai_exposure: 'some',
          goal: 'learn',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'rag-specialist',
          name: 'RAG Specialist',
          modules: ['1', '2', '3'],
          recommendedPace: 'medium',
        })
      })

      it('should recommend RAG specialist for learners with API experience', () => {
        const answers: AssessmentAnswers = {
          experience: 'intermediate',
          ai_exposure: 'api',
          goal: 'learn',
        }

        const result = recommendPath(answers)

        expect(result.id).toBe('rag-specialist')
        expect(result.recommendedPace).toBe('medium')
      })
    })

    describe('Agent Developer Path', () => {
      it('should recommend agent developer for builders with API experience', () => {
        const answers: AssessmentAnswers = {
          experience: 'intermediate',
          ai_exposure: 'api',
          goal: 'build',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'agent',
          name: 'Agent Developer',
          modules: ['1', '3', '5'],
          recommendedPace: 'medium',
        })
      })
    })

    describe('Default Path', () => {
      it('should recommend full curriculum for career transition', () => {
        const answers: AssessmentAnswers = {
          experience: 'intermediate',
          ai_exposure: 'some',
          goal: 'career',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'full',
          name: 'Full Curriculum',
          modules: ['all'],
          recommendedPace: 'medium',
        })
      })

      it('should recommend full curriculum for business goals', () => {
        const answers: AssessmentAnswers = {
          experience: 'advanced',
          ai_exposure: 'production',
          goal: 'business',
        }

        const result = recommendPath(answers)

        expect(result).toEqual({
          id: 'full',
          name: 'Full Curriculum',
          modules: ['all'],
          recommendedPace: 'medium',
        })
      })
    })

    describe('Type Safety and Control Flow', () => {
      it('should handle all valid ai_exposure values', () => {
        const exposureValues: Array<AssessmentAnswers['ai_exposure']> = ['none', 'some', 'api', 'production']

        exposureValues.forEach((exposure) => {
          const answers: AssessmentAnswers = {
            experience: 'intermediate',
            ai_exposure: exposure,
            goal: 'learn',
          }

          const result = recommendPath(answers)

          expect(result).toBeDefined()
          expect(result.id).toBeDefined()
          expect(result.recommendedPace).toBeDefined()
        })
      })

      it('should handle all valid experience levels', () => {
        const experienceLevels: Array<AssessmentAnswers['experience']> = ['beginner', 'intermediate', 'advanced']

        experienceLevels.forEach((experience) => {
          const answers: AssessmentAnswers = {
            experience,
            ai_exposure: 'some',
            goal: 'learn',
          }

          const result = recommendPath(answers)

          expect(result).toBeDefined()
          expect(result.id).toBeDefined()
        })
      })

      it('should handle all valid goals', () => {
        const goals: Array<AssessmentAnswers['goal']> = ['learn', 'build', 'career', 'business']

        goals.forEach((goal) => {
          const answers: AssessmentAnswers = {
            experience: 'intermediate',
            ai_exposure: 'some',
            goal,
          }

          const result = recommendPath(answers)

          expect(result).toBeDefined()
          expect(result.id).toBeDefined()
        })
      })

      it('should never return undefined for valid inputs', () => {
        const experiences: Array<AssessmentAnswers['experience']> = ['beginner', 'intermediate', 'advanced']
        const exposures: Array<AssessmentAnswers['ai_exposure']> = ['none', 'some', 'api', 'production']
        const goals: Array<AssessmentAnswers['goal']> = ['learn', 'build', 'career', 'business']

        experiences.forEach((experience) => {
          exposures.forEach((ai_exposure) => {
            goals.forEach((goal) => {
              const answers: AssessmentAnswers = { experience, ai_exposure, goal }
              const result = recommendPath(answers)

              expect(result).toBeDefined()
              expect(result.id).toBeDefined()
              expect(result.name).toBeDefined()
              expect(result.modules).toBeDefined()
              expect(result.recommendedPace).toBeDefined()
            })
          })
        })
      })
    })
  })

  describe('getUserProfileDefaults', () => {
    it('should return profile defaults with correct structure', () => {
      const userId = 'user-123'
      const answers: AssessmentAnswers = {
        experience: 'intermediate',
        ai_exposure: 'api',
        goal: 'build',
      }
      const path: LearningPath = {
        id: 'agent',
        name: 'Agent Developer',
        modules: ['1', '3', '5'],
        recommendedPace: 'medium',
      }

      const result = getUserProfileDefaults(userId, answers, path)

      expect(result).toEqual({
        learningPathId: 'agent',
        recommendedPace: 'medium',
        assessmentAnswers: answers,
        onboardingCompletedAt: expect.any(Date),
      })
    })

    it('should include all assessment answers', () => {
      const userId = 'user-123'
      const answers: AssessmentAnswers = {
        experience: 'beginner',
        ai_exposure: 'none',
        goal: 'learn',
      }
      const path: LearningPath = {
        id: 'full',
        name: 'Full Curriculum',
        modules: ['all'],
        recommendedPace: 'slow',
      }

      const result = getUserProfileDefaults(userId, answers, path)

      expect(result.assessmentAnswers).toEqual(answers)
      expect(result.assessmentAnswers.experience).toBe('beginner')
      expect(result.assessmentAnswers.ai_exposure).toBe('none')
      expect(result.assessmentAnswers.goal).toBe('learn')
    })

    it('should use path recommendedPace', () => {
      const userId = 'user-123'
      const answers: AssessmentAnswers = {
        experience: 'advanced',
        ai_exposure: 'production',
        goal: 'build',
      }
      const path: LearningPath = {
        id: 'rapid',
        name: 'Rapid Builder',
        modules: ['1', '2', '3', '5', '7'],
        recommendedPace: 'fast',
      }

      const result = getUserProfileDefaults(userId, answers, path)

      expect(result.recommendedPace).toBe('fast')
    })

    it('should set onboardingCompletedAt to current date', () => {
      const userId = 'user-123'
      const answers: AssessmentAnswers = {
        experience: 'intermediate',
        ai_exposure: 'some',
        goal: 'career',
      }
      const path: LearningPath = {
        id: 'full',
        name: 'Full Curriculum',
        modules: ['all'],
        recommendedPace: 'medium',
      }

      const beforeCall = new Date()
      const result = getUserProfileDefaults(userId, answers, path)
      const afterCall = new Date()

      expect(result.onboardingCompletedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime())
      expect(result.onboardingCompletedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime())
    })
  })
})
