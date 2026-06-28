// app/(marketing)/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User, ArrowRight, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import JsonLd from '@/components/seo/JsonLd'
import { articleSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string           // real column name (not 'content')
  category: string
  tags: string[]
  author?: string | null
  published_at: string
  cover_image?: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  'Guides':       'bg-blue-50 text-blue-700',
  'Scam Alerts':  'bg-red-50 text-red-700',
  'Vendor Tips':  'bg-green-50 text-green-700',
  'News':         'bg-purple-50 text-purple-700',
  'Education':    'bg-amber-50 text-amber-700',
}

function estimateReadTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, body, category, tags, author, published_at, cover_image')
    .eq('slug', slug)
    .eq('published', true)       // real column name
    .eq('site', 'zolarux')       // only Zolarux posts
    .single()

  if (error || !data) return null
  return data as BlogPost
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, published_at')
    .eq('published', true)
    .eq('site', 'zolarux')
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(3)

  return (data as BlogPost[]) ?? []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }

  const image = post.cover_image || 'https://zolarux.com.ng/og-image.png'

  return {
    title: `${post.title} | Zolarux Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://zolarux.com.ng/blog/${slug}`,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author ?? 'Zolarux Team'],
      images: [{ url: image, width: 1200, height: 627 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
    alternates: {
      canonical: `https://zolarux.com.ng/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.category, slug)
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'
  const readTime = estimateReadTime(post.body ?? '')

  return (
    <div className="bg-surface min-h-screen">
      <JsonLd data={articleSchema({
        title: post.title,
        slug: post.slug,
        published_at: post.published_at,
        image: post.cover_image ?? null,
        author: post.author ?? undefined,
      })} />

      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Blog
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-700 px-3 py-1 rounded-full ${categoryColor}`}>
              {post.category}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-800 text-white mb-5 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <User size={13} />
                <span>{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Cover image (if exists, shown below hero) */}
          {post.cover_image && (
            <div className="mb-8 -mt-6 rounded-2xl overflow-hidden shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10">
            {/* Excerpt pull-quote */}
            {post.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100 font-500">
                {post.excerpt}
              </p>
            )}

            {/* Body — HTML from the CMS */}
            {post.body ? (
              <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400">Full article coming soon.</p>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-500 px-3 py-1 rounded-full bg-primary/8 text-primary border border-primary/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Trust CTA */}
          <div className="mt-8 bg-primary rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-700 text-white">
                  Stay safe — buy through Zolarux
                </p>
                <p className="text-white/70 text-sm">
                  Verified vendors. Escrow protection. Every transaction.
                </p>
              </div>
            </div>
            <Link
              href="/listings"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-primary font-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Browse Listings <ArrowRight size={14} />
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xl font-800 text-gray-900 mb-5">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                  >
                    <span
                      className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                        CATEGORY_COLORS[rp.category] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rp.category}
                    </span>
                    <h4 className="font-display font-700 text-gray-900 text-sm mt-3 mb-2 group-hover:text-primary transition-colors leading-snug">
                      {rp.title}
                    </h4>
                    <p className="text-xs text-gray-400">{formatDate(rp.published_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}