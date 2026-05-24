import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'

// Static pages with manually-set priorities and change frequencies
const STATIC_PAGES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}> = [
  // Core pages
  { path: '/',                priority: 1.0,  changeFrequency: 'weekly' },
  { path: '/listings',        priority: 0.9,  changeFrequency: 'daily' },

  // Trust tools (high-value SEO pages)
  { path: '/check-vendor',    priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/check-device',    priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/check-original',  priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/scan-link',       priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/report-item',     priority: 0.7,  changeFrequency: 'monthly' },

  // Marketing / info pages
  { path: '/for-buyers',      priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/for-vendors',     priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/how-it-works',    priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/verified-vendors', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about',           priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/blog',            priority: 0.7,  changeFrequency: 'weekly' },
  { path: '/downloads',       priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/contact',         priority: 0.6,  changeFrequency: 'yearly' },
  { path: '/faq',             priority: 0.6,  changeFrequency: 'monthly' },

  // Auth pages (public-facing entry points)
  { path: '/login',           priority: 0.5,  changeFrequency: 'yearly' },
  { path: '/register',        priority: 0.5,  changeFrequency: 'yearly' },
  { path: '/register/vendor', priority: 0.5,  changeFrequency: 'yearly' },

  // Legal
  { path: '/privacy',         priority: 0.3,  changeFrequency: 'yearly' },
  { path: '/terms',           priority: 0.3,  changeFrequency: 'yearly' },
  { path: '/refund-policy',   priority: 0.3,  changeFrequency: 'yearly' },
]

// Fetch published blog post slugs for dynamic entries
async function getBlogSlugs(): Promise<Array<{ slug: string; published_at: string }>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// Fetch active product IDs for dynamic entries
async function getProductIds(): Promise<Array<{ id: string; updated_at?: string }>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(500) // Cap to avoid massive sitemaps

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  )

  // 2. Dynamic blog posts
  const blogSlugs = await getBlogSlugs()
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map(({ slug, published_at }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(published_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // 3. Dynamic product listings
  const productIds = await getProductIds()
  const productEntries: MetadataRoute.Sitemap = productIds.map(({ id, updated_at }) => ({
    url: `${BASE_URL}/listings/${id}`,
    lastModified: updated_at ? new Date(updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries, ...productEntries]
}
