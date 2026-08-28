'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { LISTING_SORT_OPTIONS, PRODUCT_CONDITIONS, CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput.trim() || null })
  }

  const activeCondition = searchParams.get('condition') ?? ''
  const activeBrand = searchParams.get('brand') ?? ''
  const activeSort = searchParams.get('sort') ?? 'featured'
  const activeMin = searchParams.get('minPrice') ?? ''
  const activeMax = searchParams.get('maxPrice') ?? ''

  const facets = (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Condition</label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => updateParams({ condition: activeCondition === condition ? null : condition })}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-600 border transition-all',
                activeCondition === condition
                  ? CONDITION_MAP[condition].className
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {CONDITION_MAP[condition].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Brand</label>
        <input
          type="text"
          defaultValue={activeBrand}
          onBlur={(e) => updateParams({ brand: e.target.value.trim() || null })}
          placeholder="e.g. Apple, Samsung"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Price Range (₦)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={activeMin}
            onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
            placeholder="Min"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            defaultValue={activeMax}
            onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
            placeholder="Max"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? null : e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {LISTING_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gadgets..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden shrink-0 w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} />
        </button>
      </form>

      <div className="hidden lg:block mt-6 bg-white rounded-2xl border border-gray-100 p-5">
        {facets}
      </div>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-700 text-gray-900">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            {facets}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-6 bg-primary text-white font-700 py-3 rounded-xl"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
