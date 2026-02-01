import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/onboarding/', '/dashboard/'],
      },
    ],
    sitemap: 'https://aicelerate.com/sitemap.xml',
  }
}
