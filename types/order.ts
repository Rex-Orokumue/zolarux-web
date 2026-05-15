export type OrderStatus =
  | 'pending'
  | 'pre-shipment verification'
  | 'in transit'
  | 'awaiting buyer confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'awaiting evidence submission'
  | 'evidence under review'
  | 'decision reached'
  | 'dispute closed'

export interface Order {
  id: string
  order_ref: string
  product_name: string
  product_id: string
  vendor_name: string
  vendor_id: string
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  buyer_id: string
  amount: number
  protection_fee: number
  total_amount: number
  delivery_address: string
  status: OrderStatus
  fault_party?: string
  notes?: string
  paystack_reference?: string
  completed_at?: string
  created_at: string
  updated_at?: string
}

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  vendor_id: string
  vendor_name: string
  price: number
  pricing_type: 'fixed' | 'quote'
  quantity: number
  added_at: string
}

export interface WishlistItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  vendor_id: string
  vendor_name: string
  price: number
  pricing_type: 'fixed' | 'quote'
  added_at: string
}