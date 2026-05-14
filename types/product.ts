export type PricingType = 'fixed' | 'quote'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  pricing_type: PricingType
  image_url: string
  main_image_url: string | null
  image_urls: string[]
  video_urls: string[]
  category: string
  vendor_id: string
  vendor_name: string
  is_active: boolean
  is_featured: boolean
  created_at?: string
}
