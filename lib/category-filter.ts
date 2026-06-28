import { CATEGORY_KEYWORDS } from '@/lib/constants'

/**
 * Build a Supabase `.or()` argument that matches a broad listing category
 * against both `category` and `name` columns, expanded by keyword synonyms.
 * Returns null for 'All'/empty (caller applies no category constraint).
 */
export function buildCategoryOrFilter(category: string): string | null {
  if (!category || category === 'All') return null
  const keywords = CATEGORY_KEYWORDS[category] ?? [category]
  return keywords
    .map((kw) => `category.ilike.%${kw}%,name.ilike.%${kw}%`)
    .join(',')
}
