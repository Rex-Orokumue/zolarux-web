export type PricingType = 'fixed' | 'quote'
export type ProductCondition = 'new' | 'uk_used' | 'refurbished' | 'used'

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  pricing_type: PricingType
  image_url: string | null
  main_image_url: string | null
  image_urls: string[]
  video_urls: string[]
  category: string
  brand: string | null
  condition: ProductCondition | null
  specs: ProductSpec[] | null
  vendor_id: string | null
  vendor_name: string | null
  is_active: boolean
  is_featured: boolean | null
  created_at?: string
}
