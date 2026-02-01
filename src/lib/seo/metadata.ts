import { Metadata } from 'next'

const defaultMetadata = {
  title: 'AI Architect Accelerator - Learn AI Engineering',
  description: 'Transform from developer to AI engineer in 12 weeks. Build production-ready AI applications with RAG, agents, and more.',
  keywords: ['AI engineering', 'learn AI', 'RAG systems', 'AI agents', 'Claude', 'LLM development', 'machine learning', 'artificial intelligence'],
  authors: [{ name: 'AI Architect Accelerator' }],
  creator: 'AI Architect Accelerator',
  publisher: 'AI Architect Accelerator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export function generateMetadata(params: {
  title?: string
  description?: string
  image?: string
  path?: string
}): Metadata {
  const { title, description, image, path = '' } = params

  const fullTitle = title
    ? `${title} | AI Architect Accelerator`
    : defaultMetadata.title

  const fullDescription = description || defaultMetadata.description
  const fullImage = image || '/og-image.png'
  const url = `https://aicelerate.com${path}`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: defaultMetadata.keywords,
    authors: defaultMetadata.authors,
    creator: defaultMetadata.creator,
    publisher: defaultMetadata.publisher,
    formatDetection: defaultMetadata.formatDetection,
    metadataBase: new URL('https://aicelerate.com'),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: 'AI Architect Accelerator',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@aicelerate',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
