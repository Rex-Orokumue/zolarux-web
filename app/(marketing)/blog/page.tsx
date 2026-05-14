import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { formatDate, truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Gadget buying guides, scam alerts, trust education, and Zolarux updates for Nigerian buyers and vendors.',
}

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  published_at: string
  cover_image?: string
  is_published: boolean
  author?: string
}

async function getPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, published_at, cover_image')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Blog posts fetch error:', error)
    return []
  }
  return (data as BlogPost[]) || []
}

const CATEGORIES = ['All', 'Guides', 'Scam Alerts', 'Vendor Tips', 'News', 'Education']

const CATEGORY_COLORS: Record<string, string> = {
  'Guides':       'bg-blue-50 text-blue-700',
  'Scam Alerts':  'bg-red-50 text-red-700',
  'Vendor Tips':  'bg-green-50 text-green-700',
  'News':         'bg-purple-50 text-purple-700',
  'Education':    'bg-amber-50 text-amber-700',
}

// Fallback posts shown when DB has no content yet
const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-spot-fake-iphone-nigeria',
    title: 'How to Spot a Fake iPhone Before You Pay',
    excerpt: 'Nigeria\'s phone market is flooded with clones. These six checks will help you verify any iPhone before sending a single naira.',
    content: '',
    category: 'Guides',
    author: 'Zolarux Team',
    published_at: new Date().toISOString(),
    is_published: true,
  },
  {
    id: '2',
    slug: '5-gadget-scams-nigerians-fall-for',
    title: '5 Gadget Scams Nigerians Fall For Every Day',
    excerpt: 'From fake IMEI numbers to "UK Used" refurbished phones, these are the most common scam tactics targeting Nigerian gadget buyers in 2026.',
    content: '',
    category: 'Scam Alerts',
    author: 'Zolarux Team',
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    is_published: true,
  },
  {
    id: '3',
    slug: 'what-is-escrow-and-why-it-matters',
    title: 'What is Escrow and Why It Matters for Online Shopping',
    excerpt: 'Most Nigerians have never heard of escrow payments. This simple guide explains what it is, how it works, and why it is the safest way to buy anything online.',
    content: '',
    category: 'Education',
    author: 'Zolarux Team',
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    is_published: true,
  },
  {
    id: '4',
    slug: 'zolarux-hits-2m-naira-transactions',
    title: 'Zolarux Hits ₦2 Million in Protected Transactions',
    excerpt: 'A milestone for trust infrastructure in Nigerian social commerce. Here is what we learned from protecting over 100 transactions across five years.',
    content: '',
    category: 'News',
    author: 'Rex Orokumue',
    published_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    is_published: true,
  },
]

export default async function BlogPage() {
  const dbPosts = await getPosts()
  const posts = dbPosts.length > 0 ? dbPosts : SAMPLE_POSTS
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-800 text-white mb-4">
              Trust Education & Scam Alerts
            </h1>
            <p className="text-white/70 text-lg">
              Guides, warnings, and insider knowledge to help Nigerian buyers and
              vendors navigate gadget commerce safely.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Featured post */}
          {featured && (
            <div className="mb-12">
              <p className="text-xs font-700 text-primary uppercase tracking-wider mb-4">Featured</p>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="bg-primary aspect-video lg:aspect-auto flex items-center justify-center p-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Tag size={26} className="text-white" />
                      </div>
                      <span className={`inline-block text-xs font-700 px-3 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || 'bg-white/20 text-white'}`}>
                        {featured.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="font-display text-2xl font-800 text-gray-900 mb-3 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-4">
                      {featured.excerpt}
                    </p>
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

          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400">No posts published yet. Check back soon.</p>
            </div>
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
      {/* Cover */}
      <div className="bg-primary aspect-video flex items-center justify-center">
        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
          <Tag size={20} className="text-white" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-700 px-2.5 py-1 rounded-full ${categoryColor}`}>
            {post.category}
          </span>
        </div>

        <h3 className="font-display font-700 text-gray-900 mb-2 group-hover:text-primary transition-colors flex-1">
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