export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'dispute_resolved'

export interface Order {
  id: string
  order_ref: string
  product_name: string
  vendor_name: string
  vendor_id: string
  buyer_phone: string
  amount: number
  protection_fee: number
  status: OrderStatus
  fault_party?: string
  created_at: string
  updated_at: string
}
