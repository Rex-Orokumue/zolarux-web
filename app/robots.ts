import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/buyer/', '/vendor/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
