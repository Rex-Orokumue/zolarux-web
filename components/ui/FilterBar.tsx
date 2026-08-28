'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { LISTING_SORT_OPTIONS, PRODUCT_CONDITIONS, CONDITION_MAP } from '@/lib/constants'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FilterPill } from '@/components/ui/FilterPill'
import { IconButton } from '@/components/ui/IconButton'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet'

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
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
        <p className="mb-2 text-xs font-600 uppercase tracking-wider text-ink-soft">Condition</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CONDITIONS.map((condition) => (
            <FilterPill
              key={condition}
              active={activeCondition === condition}
              onClick={() => updateParams({ condition: activeCondition === condition ? null : condition })}
            >
              {CONDITION_MAP[condition].label}
            </FilterPill>
          ))}
        </div>
      </div>

      <Field label="Brand" htmlFor="filter-brand">
        <Input
          id="filter-brand"
          type="text"
          defaultValue={activeBrand}
          onBlur={(e) => updateParams({ brand: e.target.value.trim() || null })}
          placeholder="e.g. Apple, Samsung"
        />
      </Field>

      <div>
        <p className="mb-2 text-xs font-600 uppercase tracking-wider text-ink-soft">Price range (₦)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            defaultValue={activeMin}
            onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <span className="text-ink-soft">–</span>
          <Input
            type="number"
            min={0}
            defaultValue={activeMax}
            onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <Field label="Sort by" htmlFor="filter-sort">
        <Select
          aria-label="Sort by"
          value={activeSort}
          onValueChange={(value) => updateParams({ sort: value === 'featured' ? null : value })}
          options={LISTING_SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </Field>
    </div>
  )

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gadgets…"
            aria-label="Search gadgets"
            className="pl-10"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <IconButton label="Open filters" variant="outline" className="shrink-0 lg:hidden">
              <SlidersHorizontal size={16} />
            </IconButton>
          </SheetTrigger>
          <SheetContent side="bottom" title="Filters">
            {facets}
          </SheetContent>
        </Sheet>
      </form>

      <div className="mt-6 hidden rounded-lg border border-line bg-surface p-5 lg:block">{facets}</div>
    </div>
  )
}
