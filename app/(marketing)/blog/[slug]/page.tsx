import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User, Tag, ArrowRight, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author?: string
  published_at: string
  cover_image?: string
  is_published: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  'Guides':       'bg-blue-50 text-blue-700',
  'Scam Alerts':  'bg-red-50 text-red-700',
  'Vendor Tips':  'bg-green-50 text-green-700',
  'News':         'bg-purple-50 text-purple-700',
  'Education':    'bg-amber-50 text-amber-700',
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1', slug: 'how-to-spot-fake-iphone-nigeria',
    title: 'How to Spot a Fake iPhone Before You Pay',
    excerpt: "Nigeria's phone market is flooded with clones. These six checks will help you verify any iPhone before sending a single naira.",
    content: '', category: 'Guides', published_at: new Date().toISOString(), is_published: true,
  },
  {
    id: '2', slug: '5-gadget-scams-nigerians-fall-for',
    title: '5 Gadget Scams Nigerians Fall For Every Day',
    excerpt: 'From fake IMEI numbers to "UK Used" refurbished phones, these are the most common scam tactics targeting Nigerian gadget buyers in 2026.',
    content: '', category: 'Scam Alerts', published_at: new Date(Date.now() - 86400000 * 3).toISOString(), is_published: true,
  },
  {
    id: '3', slug: 'what-is-escrow-and-why-it-matters',
    title: 'What is Escrow and Why It Matters for Online Shopping',
    excerpt: 'Most Nigerians have never heard of escrow payments. This simple guide explains what it is, how it works, and why it is the safest way to buy anything online.',
    content: '', category: 'Education', published_at: new Date(Date.now() - 86400000 * 7).toISOString(), is_published: true,
  },
  {
    id: '4', slug: 'zolarux-hits-2m-naira-transactions',
    title: 'Zolarux Hits ₦2 Million in Protected Transactions',
    excerpt: 'A milestone for trust infrastructure in Nigerian social commerce. Here is what we learned from protecting over 100 transactions across five years.',
    content: '', category: 'News', published_at: new Date(Date.now() - 86400000 * 14).toISOString(), is_published: true,
  },
]

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!error && data) return data as BlogPost

  // Fall back to sample posts if not in DB yet
  return SAMPLE_POSTS.find(p => p.slug === slug) || null
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, published_at')
    .eq('category', category)
    .eq('is_published', true)
    .neq('slug', currentSlug)
    .limit(3)

  return (data as BlogPost[]) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.category, slug)
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-surface min-h-screen">
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
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10">
            {post.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100 font-500">
                {post.excerpt}
              </p>
            )}

            {post.content ? (
              <div
                className="prose prose-gray max-w-none prose-headings:font-display prose-headings:font-700 prose-a:text-primary prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Tag size={20} className="text-primary" />
                </div>
                <p className="text-gray-400">Full article coming soon.</p>
              </div>
            )}
          </div>

          {/* Trust CTA */}
          <div className="mt-8 bg-primary rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-700 text-white">Stay safe — buy through Zolarux</p>
                <p className="text-white/70 text-sm">Verified vendors. Escrow protection. Every transaction.</p>
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
              <h3 className="font-display text-xl font-800 text-gray-900 mb-5">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                  >
                    <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${CATEGORY_COLORS[rp.category] || 'bg-gray-100 text-gray-600'}`}>
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