'use client'

export function TechStack() {
  const featuredTech = [
    {
      name: 'Anthropic Claude',
      logo: '🤖',
      description: 'AI Engine',
      featured: true
    },
    {
      name: 'Claude Code',
      logo: '⚡',
      description: 'Development Platform',
      featured: true
    },
  ]

  const technologies = [
    { name: 'Next.js 14', logo: '▲' },
    { name: 'TypeScript', logo: 'TS' },
    { name: 'Prisma', logo: '🔷' },
    { name: 'PostgreSQL', logo: '🐘' },
    { name: 'Redis', logo: '🔴' },
    { name: 'Google Cloud', logo: '☁️' },
    { name: 'Vercel', logo: '▲' },
    { name: 'Tailwind CSS', logo: '💨' },
  ]

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built with{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Claude Agents
            </span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by Anthropic's Claude AI and modern web technologies
          </p>
        </div>

        {/* Featured Technologies - Claude & Claude Code */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {featuredTech.map((tech, index) => (
            <div
              key={index}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto">
                  {tech.logo}
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-lg text-gray-900">{tech.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{tech.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting Technologies */}
        <div className="relative">
          <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider mb-8">
            Supporting Stack
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-lg">
                  {tech.logo}
                </div>
                <span className="text-xs font-medium text-gray-600">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
