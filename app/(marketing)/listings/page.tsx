import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES } from '@/lib/constants'
import { Shield, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Verified Listings',
  description: 'Browse verified gadget listings on Zolarux. Every product is from a verified vendor. Every transaction is escrow-protected.',
}

const PAGE_SIZE = 12

interface ListingsPageProps {
  searchParams: Promise<{ category?: string; page?: string }>
}

async function getProducts(category: string, page: number): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category && category !== 'All') {
    query = query.ilike('category', `%${category}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Products fetch error:', error)
    return { products: [], total: 0 }
  }

  return { products: (data as Product[]) || [], total: count || 0 }
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const activeCategory = params.category || 'All'
  const currentPage = parseInt(params.page || '1', 10)
  const { products, total } = await getProducts(activeCategory, currentPage)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-600">Every listing is vendor-verified & escrow-protected</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">
            Verified Listings
          </h1>
          <p className="text-white/70 text-lg">
            {total > 0 ? `${total} verified product${total !== 1 ? 's' : ''} available` : 'Browse our verified gadget catalogue'}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {LISTING_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/listings${cat !== 'All' ? `?category=${cat}` : ''}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-12 bg-surface min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {products.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-xl font-700 text-gray-900 mb-2">No listings yet in this category</h3>
              <p className="text-gray-500 mb-6">We are actively onboarding verified vendors. Check back soon.</p>
              <Link
                href={`https://wa.me/2347063107314?text=Hi, I'm looking for ${activeCategory === 'All' ? 'a gadget' : activeCategory} on Zolarux`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
              >
                <MessageCircle size={16} />
                Request via WhatsApp
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={`/listings?category=${activeCategory}&page=${currentPage - 1}`}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`/listings?category=${activeCategory}&page=${currentPage + 1}`}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Request CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-display text-xl font-700 text-gray-900 mb-2">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-gray-500 mb-6">
            Tell us exactly what you need. Our team will source it from a verified vendor for you.
          </p>
          <Link
            href="https://wa.me/2347063107314?text=Hi, I'd like to request a product on Zolarux"
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-700 px-6 py-3 rounded-xl hover:bg-green-600 transition-all"
          >
            <MessageCircle size={16} />
            Request a Product
          </Link>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || (product.image_urls?.[0]) || null
  const whatsappMsg = `Hi, I'm interested in "${product.name}" on Zolarux. Can I get more details?`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <Link href={`/listings/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-3 left-3 bg-accent text-white text-xs font-700 px-2.5 py-1 rounded-full">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-green-200 text-green-700 text-xs font-700 px-2 py-1 rounded-full flex items-center gap-1">
          <Shield size={10} />
          Verified
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="font-display font-700 text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-3">{product.category}</p>

        <div className="flex items-center justify-between">
          <div>
            {product.pricing_type === 'quote' ? (
              <span className="text-primary font-700 text-sm">Price on request</span>
            ) : (
              <span className="font-display font-800 text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <Link
            href={`https://wa.me/2347063107314?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            title="Inquire on WhatsApp"
          >
            <MessageCircle size={14} className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
}
