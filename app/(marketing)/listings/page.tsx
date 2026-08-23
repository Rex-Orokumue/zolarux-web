import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getListings, LISTINGS_PAGE_SIZE } from '@/lib/products'
import { buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES, type ListingSort } from '@/lib/constants'
import { Shield, ShoppingBag, MessageCircle } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { FilterBar } from '@/components/ui/FilterBar'

export const metadata: Metadata = {
  title: 'Verified Listings',
  description: 'Browse verified gadget listings on Zolarux. Every product is from a verified vendor. Every transaction is escrow-protected.',
}

interface ListingsPageProps {
  searchParams: Promise<{
    category?: string
    page?: string
    search?: string
    brand?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const activeCategory = params.category || 'All'
  const currentPage = parseInt(params.page || '1', 10)
  const hasActiveFilters = Boolean(
    params.search || params.brand || params.condition || params.minPrice || params.maxPrice
  )

  const { products, total } = await getListings({
    category: activeCategory,
    page: currentPage,
    search: params.search,
    brand: params.brand,
    condition: params.condition,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: params.sort as ListingSort | undefined,
  })
  const totalPages = Math.ceil(total / LISTINGS_PAGE_SIZE)

  const pageHref = (page: number) => {
    const qs = new URLSearchParams()
    if (activeCategory !== 'All') qs.set('category', activeCategory)
    if (params.search) qs.set('search', params.search)
    if (params.brand) qs.set('brand', params.brand)
    if (params.condition) qs.set('condition', params.condition)
    if (params.minPrice) qs.set('minPrice', params.minPrice)
    if (params.maxPrice) qs.set('maxPrice', params.maxPrice)
    if (params.sort) qs.set('sort', params.sort)
    qs.set('page', String(page))
    return `/listings?${qs.toString()}`
  }

  const clearFiltersHref = activeCategory !== 'All' ? `/listings?category=${activeCategory}` : '/listings'

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

      {/* Filters + Products */}
      <section className="py-12 bg-surface min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside>
              <Suspense fallback={<div className="h-12 bg-white rounded-xl border border-gray-100 animate-pulse" />}>
                <FilterBar />
              </Suspense>
            </aside>

            <div>
              {products.length === 0 ? (
                hasActiveFilters ? (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={24} className="text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-700 text-gray-900 mb-2">No results match your filters</h3>
                    <p className="text-gray-500 mb-6">Try widening your search or clearing a filter.</p>
                    <Link
                      href={clearFiltersHref}
                      className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
                    >
                      Clear Filters
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={24} className="text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-700 text-gray-900 mb-2">No listings yet in this category</h3>
                    <p className="text-gray-500 mb-6">We are actively onboarding verified vendors. Check back soon.</p>
                    <Link
                      href={buildWhatsAppUrl(`Hi, I'm looking for ${activeCategory === 'All' ? 'a gadget' : activeCategory} on Zolarux`)}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
                    >
                      <MessageCircle size={16} />
                      Request via WhatsApp
                    </Link>
                  </div>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {currentPage > 1 && (
                        <Link
                          href={pageHref(currentPage - 1)}
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
                          href={pageHref(currentPage + 1)}
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
            href={buildWhatsAppUrl(`Hi, I'd like to request a product on Zolarux`)}
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
