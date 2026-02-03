import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://archcelerate.com'

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/pricing',
    '/help',
    '/help/faq',
    '/help/tutorials',
    '/dashboard',
    '/onboarding',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Module pages (based on 8 learning modules)
  const modulePages = Array.from({ length: 8 }, (_, i) => ({
    url: `${baseUrl}/modules/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...modulePages]
}
