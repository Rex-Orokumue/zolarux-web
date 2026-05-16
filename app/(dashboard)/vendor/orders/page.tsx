import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, AlertTriangle, Truck, Shield, ArrowRight, MessageCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'pending':                     { label: 'Pending',         color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  'pre-shipment verification':   { label: 'Verification',    color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  'in transit':                  { label: 'In Transit',      color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200' },
  'awaiting buyer confirmation': { label: 'Awaiting Buyer',  color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200' },
  'completed':                   { label: 'Completed',       color: 'text-green-800',  bg: 'bg-green-100',  border: 'border-green-300' },
  'cancelled':                   { label: 'Cancelled',       color: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  'disputed':                    { label: 'Disputed',        color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200' },
  'dispute closed':              { label: 'Resolved',        color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-200' },
}

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get vendor record
  const { data: vendor } = await supabase
    .from('vendors')
    .select('vendor_id, business_name, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor')

  // Get all orders for this vendor
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendor.vendor_id)
    .order('created_at', { ascending: false })

  const orders = (data as Order[]) || []

  const pending = orders.filter(o => o.status === 'pending').length
  const active = orders.filter(o => ['pre-shipment verification', 'in transit', 'awaiting buyer confirmation'].includes(o.status)).length
  const completed = orders.filter(o => o.status === 'completed').length
  const disputed = orders.filter(o => o.status === 'disputed').length

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">Orders</h1>
        <span className="text-sm text-gray-400">{orders.length} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New',       value: pending,   color: 'text-amber-600 bg-amber-50' },
          { label: 'Active',    value: active,    color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', value: completed, color: 'text-green-600 bg-green-50' },
          { label: 'Disputed',  value: disputed,  color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
            <p className={`font-display font-800 text-2xl ${color.split(' ')[0]}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
          <Package size={32} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-700 text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm">
            Orders will appear here when buyers purchase your listings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
            const isNew = order.status === 'pending'
            const needsAction = order.status === 'pre-shipment verification'
            const isDisputed = order.status === 'disputed'

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border shadow-card overflow-hidden ${
                  isNew ? 'border-amber-200 ring-1 ring-amber-100' :
                  isDisputed ? 'border-red-200 ring-1 ring-red-100' :
                  'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-50">
                  <div className="min-w-0">
                    <p className="font-display font-700 text-gray-900 truncate">{order.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.order_ref}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-700 px-2.5 py-1.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Order details */}
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                    <p className="font-700 text-gray-900">{formatPrice(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Buyer</p>
                    <p className="font-600 text-gray-700">{order.buyer_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Payout</p>
                    <p className={`font-700 text-sm ${order.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                      {order.status === 'completed' ? formatPrice(order.amount) : 'On completion'}
                    </p>
                  </div>
                  {order.delivery_address && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                      <p className="text-gray-600 text-xs">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                {/* Action areas */}
                {isNew && (
                  <div className="px-5 pb-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 text-sm font-600 mb-3">
                        New order! Payment is secured in escrow. Prepare the item for pre-shipment verification.
                      </p>
                      <Link
                        href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I'm ready for pre-shipment verification for order ${order.order_ref}`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-all"
                      >
                        <MessageCircle size={14} /> Notify Zolarux
                      </Link>
                    </div>
                  </div>
                )}

                {needsAction && (
                  <div className="px-5 pb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 text-sm font-600 mb-3">
                        Pre-shipment verification required. Submit photos/video of the item to Zolarux before shipping.
                      </p>
                      <Link
                        href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I'm submitting pre-shipment evidence for order ${order.order_ref}`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all"
                      >
                        <MessageCircle size={14} /> Submit Evidence
                      </Link>
                    </div>
                  </div>
                )}

                {isDisputed && (
                  <div className="px-5 pb-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm leading-relaxed mb-3">
                        This order is under dispute. Submit your evidence to Zolarux immediately. Payment is frozen pending investigation.
                      </p>
                      <Link
                        href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I want to submit evidence for disputed order ${order.order_ref}`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all"
                      >
                        <MessageCircle size={14} /> Submit Evidence
                      </Link>
                    </div>
                  </div>
                )}

                {order.status === 'completed' && (
                  <div className="px-5 pb-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle size={15} className="text-green-600 shrink-0" />
                      <p className="text-green-700 text-sm font-600">
                        Order complete. ₦{formatPrice(order.amount)} has been released to you.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Help note */}
      <div className="bg-surface rounded-2xl border border-gray-100 p-5 text-center">
        <Shield size={18} className="text-primary mx-auto mb-2" />
        <p className="text-gray-500 text-sm mb-1 font-600">All orders are managed by Zolarux</p>
        <p className="text-gray-400 text-xs mb-3">
          You cannot move order stages yourself. Contact Zolarux to update any order status.
        </p>
        <Link
          href="https://wa.me/2347063107314?text=Hi, I need help with an order"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-primary font-700 hover:underline"
        >
          <MessageCircle size={14} /> Contact Zolarux Support
        </Link>
      </div>
    </div>
  )
}