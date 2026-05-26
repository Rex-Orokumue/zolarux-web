export type VendorStatus = 'verified' | 'pending' | 'suspended' | 'rejected'

export interface Vendor {
  id: string
  vendor_id: string
  business_name: string
  phone_number: string
  email?: string
  business_category: string
  address?: string
  status: VendorStatus
  is_verified: boolean
  risk_score: number
  trade_count: number
  enforcement_count: number
  verification_score?: number
  verification_tier?: string
  verification_notes?: string
  verified_at?: string
  activated_at?: string
  auth_user_id?: string
  created_at?: string
  updated_at?: string
  avg_rating?: number
  review_count?: number
}

export interface FlaggedEntity {
  id: string
  phone_number: string
  reason: string
  reported_at: string
}