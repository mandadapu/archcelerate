const projects = [
  {
    title: 'RAG Q&A System',
    description: 'Build document search with Claude and vector databases',
    tags: ['Anthropic', 'Pinecone', 'LangChain'],
    outcome: 'Production RAG with 90%+ accuracy',
  },
  {
    title: 'AI Chatbot with Tools',
    description: 'Function calling, API integrations, and real-time responses',
    tags: ['Claude', 'Function Calling', 'Next.js'],
    outcome: 'Interactive chatbot with live data',
  },
  {
    title: 'Agent Workflow System',
    description: 'Multi-step autonomous agents that reason and act',
    tags: ['Agents', 'LangGraph', 'TypeScript'],
    outcome: 'Autonomous task completion',
  },
  {
    title: 'Fine-tuned Model',
    description: 'Custom AI trained for your specific domain and use case',
    tags: ['Fine-tuning', 'Anthropic', 'Datasets'],
    outcome: 'Domain-specific AI performance',
  },
  {
    title: 'AI API Product',
    description: 'Ship production API with auth, rate limiting, and monitoring',
    tags: ['API', 'Auth', 'Monitoring'],
    outcome: 'Production-ready AI service',
  },
  {
    title: 'Multi-Agent Collaboration',
    description: 'Coordinated AI workflows with specialized agents',
    tags: ['Multi-Agent', 'Orchestration', 'Python'],
    outcome: 'Complex task automation',
  },
  {
    title: 'Portfolio Deployment',
    description: 'Ship all 7 projects to production with CI/CD',
    tags: ['Vercel', 'GitHub Actions', 'Docker'],
    outcome: 'Full-stack portfolio live',
  },
]

export function ProjectShowcase() {
  return (
    <section className="pt-12 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What You'll Build
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            7 production-ready AI projects that ship to real users
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {projects.slice(0, 6).map((project, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-transparent"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />

              {/* Screenshot placeholder */}
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
                <div className="text-4xl">🚀</div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Outcome */}
                <div className="flex items-center text-sm font-medium text-purple-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {project.outcome}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Last project centered */}
        <div className="flex justify-center">
          <div className="w-full md:w-1/2 lg:w-1/3 group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-transparent">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />

            <div className="aspect-video bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
              <div className="text-4xl">🎉</div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {projects[6].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {projects[6].description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {projects[6].tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm font-medium text-purple-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {projects[6].outcome}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
