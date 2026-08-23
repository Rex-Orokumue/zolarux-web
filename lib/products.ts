import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'
import type { ListingSort } from '@/lib/constants'

export const LISTINGS_PAGE_SIZE = 12

export interface ListingFilters {
  category?: string
  brand?: string
  condition?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: ListingSort
  page?: number
}

export async function getListings(filters: ListingFilters): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const from = (page - 1) * LISTINGS_PAGE_SIZE
  const to = from + LISTINGS_PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (filters.category && filters.category !== 'All') {
    query = query.ilike('category', `%${filters.category}%`)
  }
  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Listings fetch error:', error)
    return { products: [], total: 0 }
  }

  return { products: (data as Product[]) || [], total: count || 0 }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Featured products fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${category}%`)
    .neq('id', excludeId)
    .limit(limit)

  if (error) {
    console.error('Related products fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Product
}
