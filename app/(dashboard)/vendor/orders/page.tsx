import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, AlertTriangle, Truck, Shield, MessageCircle, Scale } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; description: string }> = {
  'pending':                     { label: 'New Order',       color: 'text-amber-700',  bg: 'bg-amber-50',    border: 'border-amber-200',   description: 'Payment is in escrow. Prepare the item and notify Zolarux for pre-shipment verification.' },
  'pre-shipment verification':   { label: 'Verification',    color: 'text-blue-700',   bg: 'bg-blue-50',     border: 'border-blue-200',    description: 'Submit date-stamped photos or live video of the item to Zolarux via WhatsApp before you can ship.' },
  'in transit':                  { label: 'In Transit',      color: 'text-purple-700', bg: 'bg-purple-50',   border: 'border-purple-200',  description: 'Item is on its way to the buyer. Provide tracking or delivery confirmation when done.' },
  'awaiting buyer confirmation': { label: 'Awaiting Buyer',  color: 'text-orange-700', bg: 'bg-orange-50',   border: 'border-orange-200',  description: 'Delivered. Waiting for buyer to confirm receipt. Payment will be released once confirmed.' },
  'completed':                   { label: 'Completed',       color: 'text-green-800',  bg: 'bg-green-100',   border: 'border-green-300',   description: 'Transaction complete. Payment has been released to you.' },
  'cancelled':                   { label: 'Cancelled',       color: 'text-gray-500',   bg: 'bg-gray-50',     border: 'border-gray-200',    description: 'This order has been cancelled.' },
  'disputed':                    { label: 'Disputed',        color: 'text-red-700',    bg: 'bg-red-50',      border: 'border-red-200',     description: 'A dispute has been raised. Payment is frozen. Submit your evidence to Zolarux immediately.' },
  'awaiting evidence submission':{ label: 'Submit Evidence', color: 'text-red-700',    bg: 'bg-red-50',      border: 'border-red-200',     description: 'Zolarux needs your evidence. Submit photos, waybill, and chat logs via WhatsApp now.' },
  'evidence under review':       { label: 'Under Review',    color: 'text-amber-700',  bg: 'bg-amber-50',    border: 'border-amber-200',   description: 'Zolarux is reviewing all evidence. A decision will be made within 48 hours.' },
  'decision reached':            { label: 'Decision Made',   color: 'text-primary',    bg: 'bg-primary-light', border: 'border-primary-100', description: 'Zolarux has issued a decision based on the evidence. See below for details.' },
  'dispute closed':              { label: 'Resolved',        color: 'text-gray-700',   bg: 'bg-gray-100',    border: 'border-gray-200',    description: 'This dispute has been closed.' },
}

const FAULT_MESSAGES: Record<string, { vendor: string; color: string; bg: string }> = {
  'vendor': {
    vendor: 'Decision: You were found at fault. The buyer will receive a full refund from escrow. This will affect your trust score.',
    color: 'text-red-800', bg: 'bg-red-50 border-red-200',
  },
  'buyer': {
    vendor: 'Decision: The dispute was not upheld. Your payment will be released in full within 24 hours.',
    color: 'text-green-800', bg: 'bg-green-50 border-green-200',
  },
  'both parties': {
    vendor: 'Decision: Both parties share responsibility. A partial refund will be processed. Contact Zolarux for the exact breakdown.',
    color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200',
  },
}

const PIPELINE = ['pending', 'pre-shipment verification', 'in transit', 'awaiting buyer confirmation', 'completed']
const DISPUTE_PIPELINE = ['disputed', 'awaiting evidence submission', 'evidence under review', 'decision reached', 'dispute closed']

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('vendor_id, business_name, status')
    .eq('auth_user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor')

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendor.vendor_id)
    .order('created_at', { ascending: false })

  const orders = (data as Order[]) || []

  const pending = orders.filter(o => o.status === 'pending').length
  const active = orders.filter(o => ['pre-shipment verification', 'in transit', 'awaiting buyer confirmation'].includes(o.status)).length
  const completed = orders.filter(o => o.status === 'completed').length
  const disputed = orders.filter(o => DISPUTE_PIPELINE.includes(o.status)).length

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
          <p className="text-gray-400 text-sm">Orders will appear here when buyers purchase your listings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
            const isDisputed = DISPUTE_PIPELINE.includes(order.status)
            const pipelineIndex = PIPELINE.indexOf(order.status)
            const disputeIndex = DISPUTE_PIPELINE.indexOf(order.status)
            const isNew = order.status === 'pending'
            const needsVerification = order.status === 'pre-shipment verification'
            const needsEvidence = order.status === 'awaiting evidence submission'
            const decisionReached = order.status === 'decision reached'
            const isCompleted = order.status === 'completed'
            const faultConfig = order.fault_party ? FAULT_MESSAGES[order.fault_party] : null

            return (
              <div key={order.id} className={`bg-white rounded-2xl border shadow-card overflow-hidden ${
                isNew ? 'border-amber-200 ring-1 ring-amber-100' :
                isDisputed ? 'border-red-200 ring-1 ring-red-100' :
                'border-gray-100'
              }`}>
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

                {/* Status description */}
                <div className={`px-5 py-3 text-xs leading-relaxed ${cfg.color} ${cfg.bg}`}>
                  {cfg.description}
                </div>

                {/* Normal pipeline */}
                {!isDisputed && pipelineIndex >= 0 && (
                  <div className="px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center">
                      {PIPELINE.map((s, i) => {
                        const done = i <= pipelineIndex
                        const active = i === pipelineIndex
                        return (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 ${done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                              {done && i < pipelineIndex ? '✓' : i + 1}
                            </div>
                            {i < PIPELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${i < pipelineIndex ? 'bg-primary' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {['New', 'Verify', 'Transit', 'Confirm', 'Done'].map(label => (
                        <p key={label} className="text-xs text-gray-400 text-center" style={{ width: '20%' }}>{label}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dispute pipeline */}
                {isDisputed && disputeIndex >= 0 && (
                  <div className="px-5 py-4 border-b border-gray-50">
                    <p className="text-xs font-700 text-red-500 uppercase tracking-wider mb-3">Dispute Progress</p>
                    <div className="flex items-center">
                      {DISPUTE_PIPELINE.map((s, i) => {
                        const done = i <= disputeIndex
                        const active = i === disputeIndex
                        return (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 ${done ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}>
                              {done && i < disputeIndex ? '✓' : i + 1}
                            </div>
                            {i < DISPUTE_PIPELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${i < disputeIndex ? 'bg-red-400' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {['Raised', 'Evidence', 'Review', 'Decision', 'Closed'].map(label => (
                        <p key={label} className="text-xs text-gray-400 text-center" style={{ width: '20%' }}>{label}</p>
                      ))}
                    </div>
                  </div>
                )}

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
                    <p className="text-xs text-gray-400 mb-0.5">Your Payout</p>
                    <p className={`font-700 text-sm ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      {isCompleted ? formatPrice(order.amount) : 'On completion'}
                    </p>
                  </div>
                  {order.delivery_address && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                      <p className="text-gray-600 text-xs">{order.delivery_address}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-xs text-gray-400 mb-0.5">Notes from Zolarux</p>
                      <p className="text-gray-700 text-xs bg-surface rounded-lg px-3 py-2">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Fault decision banner */}
                {decisionReached && faultConfig && (
                  <div className="px-5 pb-4">
                    <div className={`rounded-xl border p-4 ${faultConfig.bg}`}>
                      <div className="flex items-start gap-2">
                        <Scale size={15} className={`${faultConfig.color} shrink-0 mt-0.5`} />
                        <p className={`text-sm font-600 ${faultConfig.color}`}>{faultConfig.vendor}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action CTAs */}
                {isNew && (
                  <div className="px-5 pb-4">
                    <Link href={`https://wa.me/2348120288390?text=${encodeURIComponent(`New order received: ${order.order_ref} for ${order.product_name}. I am preparing it for verification.`)}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-amber-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-all">
                      <MessageCircle size={14} /> Notify Zolarux
                    </Link>
                  </div>
                )}

                {needsVerification && (
                  <div className="px-5 pb-4">
                    <Link href={`https://wa.me/2348120288390?text=${encodeURIComponent(`I am ready to submit pre-shipment evidence for order ${order.order_ref}`)}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all">
                      <MessageCircle size={14} /> Submit Evidence
                    </Link>
                  </div>
                )}

                {needsEvidence && (
                  <div className="px-5 pb-4">
                    <Link href={`https://wa.me/2348120288390?text=${encodeURIComponent(`I am submitting dispute evidence for order ${order.order_ref}:`)}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all">
                      <MessageCircle size={14} /> Submit Dispute Evidence
                    </Link>
                  </div>
                )}

                {isCompleted && (
                  <div className="px-5 pb-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                      <CheckCircle size={15} className="text-green-600 shrink-0" />
                      <p className="text-green-700 text-sm font-600">
                        Payment of {formatPrice(order.amount)} has been released to you.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-gray-100 p-5 text-center">
        <Shield size={18} className="text-primary mx-auto mb-2" />
        <p className="text-gray-500 text-sm mb-1 font-600">All orders are managed by Zolarux</p>
        <p className="text-gray-400 text-xs mb-3">Contact Zolarux to update any order status or resolve issues.</p>
        <Link href="https://wa.me/2348120288390?text=Hi, I need help with an order"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-primary font-700 hover:underline">
          <MessageCircle size={14} /> Contact Zolarux Support
        </Link>
      </div>
    </div>
  )
}