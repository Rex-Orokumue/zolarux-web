import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES } from '@/lib/constants'
import { buildCategoryOrFilter } from '@/lib/category-filter'
import SupplyNotice, { PriceNote } from '@/components/listings/SupplyNotice'
import { Shield, ShoppingBag, ArrowRight, MessageCircle, Link2, Play, Star } from 'lucide-react'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Verified Listings',
  description: 'Browse verified gadget listings on Zolarux. Every product is from a verified vendor. Every transaction is escrow-protected.',
}

const PAGE_SIZE = 12

interface ListingsPageProps {
  searchParams: Promise<{ category?: string; page?: string; vendor?: string }>
}

const GADGET_CATEGORIES = ['phones', 'laptop', 'accessories', 'electronics', 'gadget', 'gaming', 'tablet', 'computer']

async function getProducts(category: string, page: number, vendor?: string): Promise<{ products: Product[]; total: number }> {
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

  const orFilter = buildCategoryOrFilter(category)
  if (orFilter) {
    query = query.or(orFilter)
  }

  if (vendor) {
    query = query.eq('vendor_id', vendor)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Products fetch error:', error)
    return { products: [], total: 0 }
  }

  const products = (data as Product[]) || []
  const sorted = [
    ...products.filter(p => GADGET_CATEGORIES.some(g => p.category?.toLowerCase().includes(g))),
    ...products.filter(p => !GADGET_CATEGORIES.some(g => p.category?.toLowerCase().includes(g))),
  ]

  return { products: sorted, total: count || 0 }
}

// Featured products — shown in a prominent band at the top of page 1
async function getFeaturedProducts(category: string, vendor?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const orFilter = buildCategoryOrFilter(category)
  if (orFilter) {
    query = query.or(orFilter)
  }
  if (vendor) {
    query = query.eq('vendor_id', vendor)
  }

  const { data, error } = await query
  if (error) {
    console.error('Featured products fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}

// Fetch vendor rating for a given vendor_id
async function getVendorRatings(vendorIds: string[]): Promise<Record<string, { avg_rating: number; review_count: number }>> {
  if (vendorIds.length === 0) return {}
  const supabase = await createClient()
  const { data } = await supabase
    .from('vendors')
    .select('vendor_id, avg_rating, review_count')
    .in('vendor_id', vendorIds)

  const map: Record<string, { avg_rating: number; review_count: number }> = {}
  ;(data || []).forEach((v: { vendor_id: string; avg_rating: number; review_count: number }) => {
    map[v.vendor_id] = { avg_rating: v.avg_rating ?? 0, review_count: v.review_count ?? 0 }
  })
  return map
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const activeCategory = params.category || 'All'
  const currentPage = parseInt(params.page || '1', 10)
  const vendorFilter = params.vendor || ''
  const { products, total } = await getProducts(activeCategory, currentPage, vendorFilter)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Featured products only on the first page
  const featured = currentPage === 1 ? await getFeaturedProducts(activeCategory, vendorFilter) : []

  // Fetch vendor ratings for all products shown on this page (grid + featured)
  const vendorIds = [...new Set([...products, ...featured].map(p => p.vendor_id).filter(Boolean))]
  const vendorRatings = await getVendorRatings(vendorIds)

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
            Browse our verified gadget catalogue
          </p>
        </div>
      </section>

      {/* Vendor filter banner */}
      {vendorFilter && (
        <div className="bg-primary-light border-b border-primary-100 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <p className="text-primary text-sm font-600">
              Showing listings from one verified vendor
            </p>
            <Link href="/listings" className="text-primary text-xs font-700 hover:underline">
              View all listings →
            </Link>
          </div>
        </div>
      )}

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

      {/* Supply / price-availability notice */}
      <SupplyNotice />

      {/* Featured band */}
      {featured.length > 0 && (
        <section className="py-10 bg-gradient-to-b from-accent/5 to-surface border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 bg-accent/15 rounded-lg flex items-center justify-center">
                <Star size={15} className="text-accent" fill="currentColor" />
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">Featured Listings</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {featured.map((product) => (
                <ProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  avgRating={vendorRatings[product.vendor_id]?.avg_rating ?? 0}
                  reviewCount={vendorRatings[product.vendor_id]?.review_count ?? 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 bg-surface min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {featured.length > 0 && products.length > 0 && (
            <h2 className="font-display text-xl font-800 text-gray-900 mb-5">All Listings</h2>
          )}
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
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    avgRating={vendorRatings[product.vendor_id]?.avg_rating ?? 0}
                    reviewCount={vendorRatings[product.vendor_id]?.review_count ?? 0}
                  />
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

      {/* Scan Link Promo */}
      <section className="py-10 bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                <Link2 size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-700 text-white">Saw a gadget elsewhere?</p>
                <p className="text-gray-400 text-sm">Paste the link and we will check if it is safe before you pay.</p>
              </div>
            </div>
            <Link
              href="/scan-link"
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-700 px-5 py-3 rounded-xl hover:bg-accent-dark transition-all text-sm"
            >
              <Link2 size={15} /> Scan a Link
            </Link>
          </div>
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

function ProductCard({
  product,
  avgRating,
  reviewCount,
}: {
  product: Product
  avgRating: number
  reviewCount: number
}) {
  const imageUrl = product.main_image_url || product.image_url || (product.image_urls?.[0]) || null
  const videoUrl = !imageUrl ? (product.video_urls?.[0] || null) : null
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
        ) : videoUrl ? (
          <>
            {/* Show the video's first frame without playing it */}
            <video
              src={videoUrl}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center">
                <Play size={20} className="text-white translate-x-0.5" fill="currentColor" />
              </div>
            </div>
          </>
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
        <p className="text-xs text-gray-400 mb-2">{product.category}</p>

        {/* Star rating — only if vendor has reviews */}
        {avgRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFA600">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-xs font-700 text-amber-600">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {product.pricing_type === 'quote' ? (
              <span className="text-primary font-700 text-sm">Price on request</span>
            ) : (
              <span className="font-display font-800 text-gray-900">{formatPrice(product.price)}</span>
            )}
            <div className="mt-1"><PriceNote /></div>
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