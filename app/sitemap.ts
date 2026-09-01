import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'

export default function sitemap(): MetadataRoute.Sitemap {
  // Only routes that exist. /dev/* and /login are intentionally excluded.
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/listings`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${BASE_URL}/how-it-works`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/faq`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/contact`, priority: 0.5, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/check-device`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/check-original`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/report-item`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/scan-link`, priority: 0.8, changeFrequency: 'monthly' as const },
  ]

  return staticPages.map(({ url, priority, changeFrequency }) => ({
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
