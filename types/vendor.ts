export type VendorStatus = 'verified' | 'pending' | 'suspended' | 'rejected'

export interface Vendor {
  id: string
  vendor_id: string
  business_name: string
  phone_number: string
  email?: string
  category: string
  status: VendorStatus
  risk_score: number
  business_address?: string
  social_links?: string[]
  created_at?: string
}

export interface FlaggedEntity {
  id: string
  phone_number: string
  reason: string
  reported_at: string
}