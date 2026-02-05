const testimonials = [
  {
    quote: "Shipped my first AI product in 3 weeks. The hands-on approach with Claude Code made everything click.",
    author: "Sarah Chen",
    role: "Senior Engineer → AI Product Lead",
    avatar: "SC",
  },
  {
    quote: "Finally understand how RAG actually works. Building 7 real projects beats any tutorial.",
    author: "Michael Rodriguez",
    role: "Full Stack Dev, Ex-Google",
    avatar: "MR",
  },
  {
    quote: "Went from zero AI knowledge to deploying production agents. The AI mentor is like having a senior dev 24/7.",
    author: "Priya Patel",
    role: "Software Engineer → AI Architect",
    avatar: "PP",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Developers Are Saying
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              {/* Avatar - matching Command Center icon style */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mb-6">
                <span className="text-white font-bold text-xl">
                  {testimonial.avatar}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div>
                <div className="font-bold text-gray-900">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
