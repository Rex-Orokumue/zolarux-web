import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/buyer/', '/vendor/', '/api/', '/reset-password', '/update-password'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/buyer/', '/vendor/', '/api/', '/reset-password', '/update-password'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/buyer/', '/vendor/', '/api/', '/reset-password', '/update-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
