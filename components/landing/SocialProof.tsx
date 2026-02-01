export function SocialProof() {
  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-600 mb-6">
          Trusted by developers building AI products
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale">
          {/* Placeholder for company logos */}
          <div className="text-2xl font-bold text-gray-400">Google</div>
          <div className="text-2xl font-bold text-gray-400">Meta</div>
          <div className="text-2xl font-bold text-gray-400">Stripe</div>
          <div className="text-2xl font-bold text-gray-400">OpenAI</div>
          <div className="text-2xl font-bold text-gray-400">Anthropic</div>
        </div>
      </div>
    </section>
  )
}
