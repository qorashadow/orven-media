import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://orven.media'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/settings/',
          '/notifications/',
          '/profile/*/edit',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
