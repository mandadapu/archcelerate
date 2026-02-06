import { ArchcelerateLogo } from '@/components/brand/ArchcelerateLogo'

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Archcelerate Brand Assets</h1>

        <div className="space-y-12">
          {/* Full Logo */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Full Logo</h2>
            <p className="text-gray-600 mb-6">Use for landing pages, marketing materials, and large format displays</p>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <ArchcelerateLogo variant="full" className="w-full max-w-md" />
            </div>
          </section>

          {/* Compact Logo */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compact Logo</h2>
            <p className="text-gray-600 mb-6">Use for headers, navigation bars, and constrained spaces</p>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <ArchcelerateLogo variant="compact" className="h-12 w-auto" />
            </div>
          </section>

          {/* Icon Only */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Icon Only</h2>
            <p className="text-gray-600 mb-6">Use for favicons, app icons, and social media profiles</p>
            <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-8 inline-block">
              <ArchcelerateLogo variant="icon" className="w-16 h-16" />
            </div>
          </section>

          {/* Color Variations */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Background Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Light Background */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Light Background</p>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <ArchcelerateLogo variant="compact" className="h-10 w-auto" />
                </div>
              </div>

              {/* Dark Background */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Dark Background</p>
                <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-6">
                  <ArchcelerateLogo variant="compact" className="h-10 w-auto" />
                </div>
              </div>
            </div>
          </section>

          {/* Brand Colors */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Brand Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="w-full h-24 rounded-lg bg-[#3b82f6] mb-2"></div>
                <p className="text-sm font-semibold text-gray-900">Electric Blue</p>
                <p className="text-xs text-gray-600">#3b82f6</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg bg-[#ff6b35] mb-2"></div>
                <p className="text-sm font-semibold text-gray-900">Safety Orange</p>
                <p className="text-xs text-gray-600">#ff6b35</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg bg-[#1e293b] mb-2"></div>
                <p className="text-sm font-semibold text-gray-900">Deep Charcoal</p>
                <p className="text-xs text-gray-600">#1e293b</p>
              </div>
              <div>
                <div className="w-full h-24 rounded-lg bg-[#64748b] mb-2"></div>
                <p className="text-sm font-semibold text-gray-900">Slate Gray</p>
                <p className="text-xs text-gray-600">#64748b</p>
              </div>
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Usage Guidelines</h2>
            <div className="prose prose-gray max-w-none">
              <ul className="space-y-2">
                <li className="text-gray-700">
                  <strong>Minimum Size:</strong> Icon should not be smaller than 32×32px
                </li>
                <li className="text-gray-700">
                  <strong>Clear Space:</strong> Maintain at least 50% of the logo height as clear space around all sides
                </li>
                <li className="text-gray-700">
                  <strong>Typography:</strong> Primary font is Inter, fallback to system-ui or sans-serif
                </li>
                <li className="text-gray-700">
                  <strong>Speed Lines:</strong> The three diagonal chevrons represent velocity, momentum, and architectural progression
                </li>
                <li className="text-gray-700">
                  <strong>Color Usage:</strong> "Arch" is always Electric Blue (#3b82f6), speed lines are always Safety Orange (#ff6b35)
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
