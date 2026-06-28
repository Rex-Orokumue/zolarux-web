import { describe, it, expect } from 'vitest'
import { buildCategoryOrFilter } from '@/lib/category-filter'

describe('buildCategoryOrFilter', () => {
  it('returns null for All', () => {
    expect(buildCategoryOrFilter('All')).toBeNull()
  })
  it('matches keyword against category and name for Accessories', () => {
    const f = buildCategoryOrFilter('Accessories')!
    expect(f).toContain('category.ilike.%earpod%')
    expect(f).toContain('name.ilike.%earpod%')
    expect(f).toContain('category.ilike.%power bank%')
  })
  it('falls back to the raw label when no keyword group exists', () => {
    const f = buildCategoryOrFilter('Refurbished')!
    expect(f).toBe('category.ilike.%Refurbished%,name.ilike.%Refurbished%')
  })
})
