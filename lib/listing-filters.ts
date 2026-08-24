import type { ListingSort } from '@/lib/constants'

/**
 * Build a Supabase `.or()` argument that matches a free-text search query
 * against both `name` and `description`. Returns null when there is no
 * query (caller applies no search constraint).
 */
export function buildSearchOrFilter(search?: string): string | null {
  const q = search?.trim()
  if (!q) return null
  return `name.ilike.%${q}%,description.ilike.%${q}%`
}

/**
 * Map a listing sort option to the ordered list of `.order()` calls to
 * apply to the products query. Defaults to featured-first, then newest —
 * matching the existing (pre-sort) default behaviour.
 */
export function sortToOrderClauses(sort?: ListingSort): { column: string; ascending: boolean }[] {
  switch (sort) {
    case 'price_asc':
      return [{ column: 'price', ascending: true }]
    case 'price_desc':
      return [{ column: 'price', ascending: false }]
    case 'newest':
      return [{ column: 'created_at', ascending: false }]
    default:
      return [
        { column: 'is_featured', ascending: false },
        { column: 'created_at', ascending: false },
      ]
  }
}
