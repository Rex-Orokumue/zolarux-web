import { createClient } from '@/lib/supabase/server'
import { Package, Clock, CheckCircle, AlertTriangle, Truck, ArrowRight, Shield } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  'pending':                     { label: 'Pending',       color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',    icon: Clock },
  'pre-shipment verification':   { label: 'Verification',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',      icon: Shield },
  'in transit':                  { label: 'In Transit',    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200',  icon: Truck },
  'awaiting buyer confirmation': { label: 'Confirm Now',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200',  icon: AlertTriangle },
  'completed':                   { label: 'Completed',     color: 'text-green-800',  bg: 'bg-green-100 border-green-300',   icon: CheckCircle },
  'cancelled':                   { label: 'Cancelled',     color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',      icon: AlertTriangle },
  'disputed':                    { label: 'Disputed',      color: 'text-red-700',    bg: 'bg-red-50 border-red-200',        icon: AlertTriangle },
  'dispute closed':              { label: 'Resolved',      color: 'text-gray-700',   bg: 'bg-gray-100 border-gray-200',     icon: CheckCircle },
}

const PIPELINE = [
  'pending',
  'pre-shipment verification',
  'in transit',
  'awaiting buyer confirmation',
  'completed',
]

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_email', user?.email ?? '')
    .order('created_at', { ascending: false })

  const orders = (data as Order[]) || []

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">My Orders</h1>
        <span className="text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
          <Package size={32} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-700 text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-6">Start shopping from our verified listings</p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            Browse Listings <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
            const Icon = cfg.icon
            const pipelineIndex = PIPELINE.indexOf(order.status)
            const isDisputed = ['disputed', 'awaiting evidence submission', 'evidence under review', 'decision reached', 'dispute closed'].includes(order.status)
            const needsConfirmation = order.status === 'awaiting buyer confirmation'

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-50">
                  <div>
                    <p className="font-display font-700 text-gray-900">{order.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.order_ref}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-700 px-2.5 py-1.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <Icon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Pipeline */}
                {pipelineIndex >= 0 && !isDisputed && (
                  <div className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center">
                      {PIPELINE.map((s, i) => {
                        const done = i <= pipelineIndex
                        const active = i === pipelineIndex
                        return (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 transition-all ${
                              done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                            } ${active ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                              {done && i < pipelineIndex ? '✓' : i + 1}
                            </div>
                            {i < PIPELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 transition-all ${i < pipelineIndex ? 'bg-primary' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Amount Paid</p>
                    <p className="font-700 text-gray-900">{formatPrice(order.total_amount || order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Vendor</p>
                    <p className="font-600 text-gray-700">{order.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  {order.delivery_address && (
                    <div className="col-span-2 sm:col-span-3">
                      <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                      <p className="text-gray-600 text-xs">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                {/* Confirm receipt CTA */}
                {needsConfirmation && (
                  <div className="px-5 pb-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-orange-800 text-sm font-600 mb-3">
                        Your item has been delivered. Please confirm receipt to release payment to the vendor.
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I confirm delivery and satisfaction for order ${order.order_ref}. Please release payment.`)}`}
                          target="_blank"
                          className="flex-1 bg-green-600 text-white text-sm font-700 py-2.5 rounded-xl text-center hover:bg-green-700 transition-all"
                        >
                          ✓ Confirm Receipt
                        </Link>
                        <Link
                          href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I want to raise a dispute for order ${order.order_ref}. Reason: `)}`}
                          target="_blank"
                          className="flex-1 border border-red-200 text-red-600 text-sm font-700 py-2.5 rounded-xl text-center hover:bg-red-50 transition-all"
                        >
                          Raise Dispute
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dispute notice */}
                {isDisputed && (
                  <div className="px-5 pb-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-red-700 text-xs leading-relaxed">
                        This order is under dispute review. Our team is investigating and will reach out via WhatsApp within 48 hours.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}