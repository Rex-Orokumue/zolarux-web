export type SentinelXOrderStatus = 'initiated' | 'held' | 'released' | 'refunded' | 'disputed'
export type SentinelXAction = 'release' | 'refund' | 'dispute'
export type SentinelXWebhookEvent = 'payment_held' | 'delivery_confirmed' | 'order_refunded'

export interface SentinelXOrder {
  id: string
  order_ref: string
  listing_id: string
  listing_title: string
  buyer_id: string
  seller_id: string
  amount: number
  paystack_reference: string | null
  status: SentinelXOrderStatus
  initiated_at: string
  held_at: string | null
  resolved_at: string | null
  created_at: string
}

export interface SentinelXWebhookPayload {
  event: SentinelXWebhookEvent
  order_ref: string
  data: Record<string, unknown>
  sent_at: string
}
