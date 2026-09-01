import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { getListings, LISTINGS_PAGE_SIZE } from '@/lib/products'
import { buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES, type ListingSort } from '@/lib/constants'
import { FilterBar } from '@/components/ui/FilterBar'
import { ProductCard } from '@/components/ui/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Shop all gadgets',
  description:
    'Browse phones, laptops and gadgets from Zolarux. Every unit is inspected before dispatch — guaranteed or refunded.',
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
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
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

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams()
    const merged: Record<string, string | number | undefined> = {
      category: activeCategory !== 'All' ? activeCategory : undefined,
      search: params.search,
      brand: params.brand,
      condition: params.condition,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sort: params.sort,
      ...overrides,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
    }
    const s = qs.toString()
    return `/listings${s ? `?${s}` : ''}`
  }

  return (
    <div className="bg-background">
      <section className="bg-hero-primary py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Shop all gadgets</h1>
          <p className="mt-2 font-body text-lg text-white/80">
            {total > 0
              ? `${total} product${total === 1 ? '' : 's'} — each one inspected before it ships.`
              : 'Every unit is inspected before dispatch. Guaranteed or refunded.'}
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-40 border-b border-line bg-surface-raised/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3">
            {LISTING_CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/listings' : `/listings?category=${encodeURIComponent(cat)}`}
                  className={
                    'shrink-0 rounded-pill px-4 py-1.5 font-body text-sm font-medium transition-micro ' +
                    (active ? 'bg-primary text-on-primary' : 'bg-surface text-ink-soft hover:text-ink')
                  }
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <Suspense
              fallback={<div className="h-11 animate-pulse rounded-md border border-line bg-surface" />}
            >
              <FilterBar />
            </Suspense>
          </aside>

          <div>
            {products.length === 0 ? (
              <div className="rounded-lg border border-line bg-surface py-20 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft">
                  <ShoppingBag size={22} className="text-primary" />
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="font-display text-lg font-bold text-ink">
                      No results match your filters
                    </h3>
                    <p className="mx-auto mt-1 max-w-sm font-body text-ink-soft">
                      Try widening your search or clearing a filter.
                    </p>
                    <div className="mt-6">
                      <Button asChild variant="secondary">
                        <Link
                          href={buildHref({
                            search: undefined,
                            brand: undefined,
                            condition: undefined,
                            minPrice: undefined,
                            maxPrice: undefined,
                            page: undefined,
                          })}
                        >
                          Clear filters
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-bold text-ink">Nothing here yet</h3>
                    <p className="mx-auto mt-1 max-w-sm font-body text-ink-soft">
                      Tell us what you&apos;re after and we&apos;ll source it for you.
                    </p>
                    <div className="mt-6">
                      <Button asChild>
                        <a
                          href={buildWhatsAppUrl(
                            `Hi Zolarux, I'm looking for ${activeCategory === 'All' ? 'a gadget' : activeCategory}. Can you source it?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle size={16} />
                          Ask us to source it
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Reveal>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </Reveal>
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      hrefFor={(p) => buildHref({ page: p })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
