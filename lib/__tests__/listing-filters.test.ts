import { describe, it, expect } from 'vitest'
import { buildSearchOrFilter, sortToOrderClauses } from '@/lib/listing-filters'

describe('buildSearchOrFilter', () => {
  it('returns null for empty/undefined search', () => {
    expect(buildSearchOrFilter(undefined)).toBeNull()
    expect(buildSearchOrFilter('')).toBeNull()
    expect(buildSearchOrFilter('   ')).toBeNull()
  })

  it('matches the query against both name and description', () => {
    const f = buildSearchOrFilter('iphone')!
    expect(f).toBe('name.ilike.%iphone%,description.ilike.%iphone%')
  })

  it('trims surrounding whitespace', () => {
    const f = buildSearchOrFilter('  power bank  ')!
    expect(f).toBe('name.ilike.%power bank%,description.ilike.%power bank%')
  })
})

describe('sortToOrderClauses', () => {
  it('defaults to featured-first, then newest', () => {
    expect(sortToOrderClauses(undefined)).toEqual([
      { column: 'is_featured', ascending: false },
      { column: 'created_at', ascending: false },
    ])
  })

  it('orders by price ascending for price_asc', () => {
    expect(sortToOrderClauses('price_asc')).toEqual([{ column: 'price', ascending: true }])
  })

  it('orders by price descending for price_desc', () => {
    expect(sortToOrderClauses('price_desc')).toEqual([{ column: 'price', ascending: false }])
  })

  it('orders by newest for newest', () => {
    expect(sortToOrderClauses('newest')).toEqual([{ column: 'created_at', ascending: false }])
  })
})
