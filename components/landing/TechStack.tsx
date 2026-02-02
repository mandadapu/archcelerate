'use client'

export function TechStack() {
  const technologies = [
    { name: 'Claude', logo: '🤖' },
    { name: 'Next.js', logo: '▲' },
    { name: 'TypeScript', logo: 'TS' },
    { name: 'Prisma', logo: '🔷' },
    { name: 'PostgreSQL', logo: '🐘' },
    { name: 'Vercel', logo: '▲' },
    { name: 'Tailwind', logo: '💨' },
    { name: 'OpenAI', logo: '🧠' },
  ]

  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-12">
          Built with modern AI & web technologies
        </p>

        <div className="relative overflow-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10" />

          {/* Logo grid */}
          <div className="flex items-center justify-center gap-12 md:gap-16 flex-wrap">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-2xl">
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
