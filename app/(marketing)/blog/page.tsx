// app/(marketing)/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { formatDate, truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog | Zolarux',
  description:
    'Gadget buying guides, scam alerts, trust education, and Zolarux updates for Nigerian buyers and vendors.',
  openGraph: {
    title: 'Blog — Zolarux',
    description:
      'Gadget buying guides, scam alerts, and trust education for Nigerian gadget commerce.',
    url: 'https://zolarux.com.ng/blog',
    images: [{ url: '/og-image.png', width: 1200, height: 627 }],
  },
  alternates: { canonical: 'https://zolarux.com.ng/blog' },
}

export const dynamic = 'force-dynamic'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  published_at: string
  cover_image?: string | null
  author?: string | null
}

// Zolarux-specific categories
const CATEGORIES = ['All', 'Guides', 'Scam Alerts', 'Vendor Tips', 'News', 'Education']

const CATEGORY_COLORS: Record<string, string> = {
  'Guides':       'bg-blue-50 text-blue-700',
  'Scam Alerts':  'bg-red-50 text-red-700',
  'Vendor Tips':  'bg-green-50 text-green-700',
  'News':         'bg-purple-50 text-purple-700',
  'Education':    'bg-amber-50 text-amber-700',
}

async function getPosts(category?: string): Promise<BlogPost[]> {
  const supabase = await createClient()

  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, tags, published_at, cover_image, author')
    .eq('published', true)          // real column name in the CMS
    .eq('site', 'zolarux')          // only Zolarux posts
    .order('published_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.ilike('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error('Blog posts fetch error:', error)
    return []
  }
  return (data as BlogPost[]) ?? []
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category?.toLowerCase() ?? 'all'
  const posts = await getPosts(activeCategory)

  const featured = posts[0] ?? null
  const rest = posts.slice(1)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-800 text-white mb-4">
              Trust Education &amp; Scam Alerts
            </h1>
            <p className="text-white/70 text-lg">
              Guides, warnings, and insider knowledge to help Nigerian buyers and
              vendors navigate gadget commerce safely.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mt-8">
            {CATEGORIES.map((cat) => {
              const catKey = cat.toLowerCase()
              const isActive =
                catKey === activeCategory ||
                (catKey === 'all' && activeCategory === 'all')
              return (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/blog' : `/blog?category=${catKey}`}
                  scroll={false}
                  className={`px-4 py-1.5 rounded-full text-sm font-600 border transition-all ${
                    isActive
                      ? 'bg-white text-primary border-white'
                      : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag size={24} className="text-primary" />
              </div>
              <p className="text-gray-500 font-500">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <div className="mb-12">
                  <p className="text-xs font-700 text-primary uppercase tracking-wider mb-4">
                    Featured
                  </p>
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="group block bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Cover or placeholder */}
                      <div className="relative overflow-hidden bg-primary aspect-video lg:aspect-auto min-h-[220px]">
                        {featured.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featured.cover_image}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full p-12">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Tag size={26} className="text-white" />
                              </div>
                              <span
                                className={`inline-block text-xs font-700 px-3 py-1 rounded-full ${
                                  CATEGORY_COLORS[featured.category] || 'bg-white/20 text-white'
                                }`}
                              >
                                {featured.category}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex flex-col justify-center">
                        <span
                          className={`self-start text-xs font-700 px-3 py-1 rounded-full mb-4 ${
                            CATEGORY_COLORS[featured.category] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {featured.category}
                        </span>
                        <h2 className="font-display text-2xl font-800 text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                          {featured.title}
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-4">{featured.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            {formatDate(featured.published_at)}
                          </div>
                          <span className="inline-flex items-center gap-1 text-primary font-700 text-sm group-hover:gap-2 transition-all">
                            Read more <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Rest of posts */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Cover image or coloured placeholder */}
      {post.cover_image ? (
        <div className="aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="bg-primary aspect-video flex items-center justify-center">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-white" />
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-700 px-2.5 py-1 rounded-full ${categoryColor}`}>
            {post.category}
          </span>
        </div>

        <h3 className="font-display font-700 text-gray-900 mb-2 group-hover:text-primary transition-colors flex-1 leading-snug">
          {post.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          {truncate(post.excerpt, 100)}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={11} />
            {formatDate(post.published_at)}
          </div>
          <span className="text-primary text-xs font-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}