import { createClient } from '@/lib/supabase/server'
import { Package, Clock, CheckCircle, AlertTriangle, Truck, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:          { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   icon: Clock },
  confirmed:        { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: CheckCircle },
  in_transit:       { label: 'In Transit', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck },
  delivered:        { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
  completed:        { label: 'Completed',  color: 'text-green-800',  bg: 'bg-green-100 border-green-300',  icon: CheckCircle },
  disputed:         { label: 'Disputed',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: AlertTriangle },
  dispute_resolved: { label: 'Resolved',   color: 'text-gray-700',   bg: 'bg-gray-100 border-gray-200',    icon: CheckCircle },
  cancelled:        { label: 'Cancelled',  color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',     icon: AlertTriangle },
}

const PIPELINE = ['pending', 'confirmed', 'in_transit', 'delivered', 'completed']

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_phone', user?.phone ?? '')
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
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const Icon = cfg.icon
            const pipelineIndex = PIPELINE.indexOf(order.status)

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                {/* Order header */}
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

                {/* Pipeline progress */}
                {pipelineIndex >= 0 && !['disputed', 'dispute_resolved', 'cancelled'].includes(order.status) && (
                  <div className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center">
                      {PIPELINE.map((s, i) => {
                        const done = i <= pipelineIndex
                        const active = i === pipelineIndex
                        return (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 ${
                              done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                            } ${active ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                              {done && i < pipelineIndex ? '✓' : i + 1}
                            </div>
                            {i < PIPELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${i < pipelineIndex ? 'bg-primary' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1">
                      {PIPELINE.map((s) => (
                        <p key={s} className="text-xs text-gray-400 capitalize" style={{ width: '20%', textAlign: 'center' }}>
                          {s.replace('_', ' ')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order details */}
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                    <p className="font-700 text-gray-900">{formatPrice(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Vendor</p>
                    <p className="font-600 text-gray-700">{order.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                {order.status === 'delivered' && (
                  <div className="px-5 pb-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <p className="text-green-700 text-xs font-600">
                        Have you received and inspected your item?
                      </p>
                      <Link
                        href={`https://wa.me/2347063107314?text=I confirm delivery for order ${order.order_ref}. I am satisfied.`}
                        target="_blank"
                        className="shrink-0 bg-green-600 text-white text-xs font-700 px-3 py-2 rounded-lg hover:bg-green-700 transition-all"
                      >
                        Confirm Receipt
                      </Link>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="px-5 pb-4">
                    <Link
                      href={`https://wa.me/2347063107314?text=I want to raise a dispute for order ${order.order_ref}.`}
                      target="_blank"
                      className="text-xs text-red-500 font-700 hover:underline"
                    >
                      Raise a dispute instead
                    </Link>
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