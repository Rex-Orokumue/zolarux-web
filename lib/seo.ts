import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'
const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

/**
 * Build page metadata with matching <title>, canonical, and Open Graph /
 * Twitter fields. og:title does NOT fall back to title in Next.js and child
 * pages inherit the root's openGraph unless they set their own — so every page
 * must define its own og:title/description or share previews look identical.
 */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  const ogTitle = `${title} | Zolarux`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: ogTitle, description, url: path },
    twitter: { title: ogTitle, description },
  }
}

export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zolarux',
    url: SITE_URL,
    logo: `${SITE_URL}/zolarux_logo.png`,
    description:
      'Zolarux is a trusted gadget retailer selling phones, laptops, and accessories in Nigeria. 5 years in operation, 100+ customers, with a full money-back guarantee on every order.',
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zolarux',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/listings?category={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productSchema(p: {
  id: string
  name: string
  description?: string
  price: number
  pricing_type: 'fixed' | 'quote'
  image?: string | null
  vendor_name?: string
}) {
  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
    url: abs(`/listings/${p.id}`),
  }
  if (p.pricing_type === 'fixed') offers.price = p.price
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.vendor_name ? { brand: { '@type': 'Brand', name: p.vendor_name } } : {}),
    offers,
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  }
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}

export function articleSchema(a: {
  title: string
  slug: string
  published_at: string
  image?: string | null
  author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.title,
    datePublished: a.published_at,
    url: abs(`/blog/${a.slug}`),
    ...(a.image ? { image: abs(a.image) } : {}),
    author: { '@type': 'Organization', name: a.author || 'Zolarux' },
  }
}
