import Link from 'next/link'
import { prisma } from '@/lib/db'
import { LandingClient } from '@/components/landing/LandingClient'
import { SignInButton } from '@/components/landing/SignInButton'

export const revalidate = 300

type WeekRow = {
  weekNumber: number
  title: string
  description: string
  concepts: number
  labs: number
  projects: number
}

const FALLBACK_WEEKS: WeekRow[] = [
  { weekNumber: 1, title: 'LLM Fundamentals', description: 'Tokens, model selection, cost tradeoffs, structured output.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 2, title: 'Prompt Engineering', description: 'Systematic prompting, evaluation loops, failure mode analysis.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 3, title: 'Retrieval-Augmented Generation', description: 'Embeddings, chunking, hybrid search, answer grounding.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 4, title: 'Context Engineering', description: 'Conversation memory, context windows, budget management.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 5, title: 'Multi-Agent Systems', description: 'Supervisor patterns, swarms, handoff, persistent checkpointing.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 6, title: 'Production Deployment', description: 'Containerization, scaling, observability, cost control.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 7, title: 'Evaluation', description: 'Offline evals, LLM-as-a-judge, regression detection.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 8, title: 'System Design for AI', description: 'Whiteboard architecture, interview preparation, portfolio building.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 9, title: 'Fine-Tuning and Model Adaptation', description: 'When to fine-tune, PEFT, data curation, evaluation.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 10, title: 'Safety and Governance', description: 'Guardrails, PII handling, policy enforcement, red-teaming.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 11, title: 'Multimodal Systems', description: 'Vision, audio, document understanding, cross-modal retrieval.', concepts: 0, labs: 0, projects: 0 },
  { weekNumber: 12, title: 'Capstone Project', description: 'End-to-end system design, code, deployment, writeup.', concepts: 0, labs: 0, projects: 0 },
]

async function getWeeks(): Promise<WeekRow[]> {
  try {
    const rows = await prisma.curriculumWeek.findMany({
      where: { active: true },
      orderBy: { weekNumber: 'asc' },
      select: {
        weekNumber: true,
        title: true,
        description: true,
        _count: { select: { concepts: true, labs: true, weekProjects: true } },
      },
    })

    if (rows.length === 0) return FALLBACK_WEEKS

    return rows.map((w) => ({
      weekNumber: w.weekNumber,
      title: w.title,
      description: w.description ?? '',
      concepts: w._count.concepts,
      labs: w._count.labs,
      projects: w._count.weekProjects,
    }))
  } catch (err) {
    console.error('[landing] Failed to fetch CurriculumWeek rows, using fallback', err)
    return FALLBACK_WEEKS
  }
}

export default async function Home() {
  const weeks = await getWeeks()

  return (
    <LandingClient>
      <div className="relative isolate min-h-screen bg-slate-50 pt-14">
        {/* Subtle dot-grid background, fades out below the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] -z-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgb(156 163 175) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
            maskImage:
              'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          }}
        />

        {/* Hero */}
        <section className="min-h-[60vh] flex items-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Learn to architect production LLM systems.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A free, hands-on curriculum for working engineers — retrieval, agents,
              evaluation, and the systems work that happens <em>around</em> the model.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <SignInButton className="px-5 py-3 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                Sign in with GitHub
              </SignInButton>
              <a
                href="#curriculum"
                className="px-5 py-3 rounded-md border border-gray-300 text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                View the curriculum <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* The approach */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              The approach
            </h2>
            <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
              <p>
                Most AI tutorials teach you to call a model. This one teaches you to build the
                system around it.
              </p>
              <p>
                A working LLM feature in production is mostly not the model. It&apos;s retrieval
                that stays fresh, evaluations that catch regressions, context windows that
                don&apos;t blow your budget, agents that recover from failure, and guardrails
                that hold under real traffic. The model is one component in a system that has
                to keep running on Monday morning.
              </p>
              <p>
                The curriculum works through that system, step by step, with runnable code.
                You&apos;ll read lessons, run examples, and build the pieces yourself — no
                videos, no quizzes to unlock the next module, no certificates. Just the
                material, open source, free to use.
              </p>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section id="curriculum" className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              The curriculum
            </h2>
            <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-200">
              {weeks.map((w) => (
                <li key={w.weekNumber}>
                  <Link
                    href={`/curriculum/week-${w.weekNumber}`}
                    className="block px-5 py-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-sm font-mono text-gray-500 w-20 shrink-0">
                        Module {w.weekNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">{w.title}</h3>
                        {w.description && (
                          <p className="mt-1 text-base text-gray-600">{w.description}</p>
                        )}
                        {(w.concepts > 0 || w.labs > 0 || w.projects > 0) && (
                          <p className="mt-2 text-sm text-gray-500">
                            {[
                              w.concepts > 0 && `${w.concepts} concepts`,
                              w.labs > 0 && `${w.labs} labs`,
                              w.projects > 0 && `${w.projects} projects`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Start with the first module
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Sign in with GitHub to track your progress across modules. No payment, no email
              capture, no newsletter — your progress lives on this server, and you can delete
              it any time.
            </p>
            <div className="mt-6 flex justify-center">
              <SignInButton className="px-5 py-3 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                Sign in with GitHub
              </SignInButton>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              Source is on{' '}
              <a
                href="https://github.com/mandadapu/archcelerate"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-900"
              >
                GitHub
              </a>{' '}
              · MIT licensed
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
            <a
              href="https://github.com/mandadapu/archcelerate/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              MIT License
            </a>
            <span className="mx-3">·</span>
            <a
              href="https://github.com/mandadapu/archcelerate"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
            <span className="mx-3">·</span>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy
            </Link>
            <span className="mx-3">·</span>
            <Link href="/terms" className="hover:text-gray-900">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </LandingClient>
  )
}
