import { createClient, getUser } from '@/lib/supabase/server'
import { Package, Clock, CheckCircle, AlertTriangle, Truck, ArrowRight, Shield, Scale } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: any; description: string
}> = {
  'pending': {
    label: 'Order Placed', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    icon: Clock, description: 'Your payment is secured in escrow. Zolarux is coordinating with the vendor.'
  },
  'pre-shipment verification': {
    label: 'Being Verified', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
    icon: Shield, description: 'Zolarux is physically verifying your item before the vendor can ship. This protects you from fake or wrong items.'
  },
  'in transit': {
    label: 'On the Way', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200',
    icon: Truck, description: 'Your item has been verified and is on its way to you. Inspect immediately on arrival.'
  },
  'awaiting buyer confirmation': {
    label: 'Confirm Receipt', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',
    icon: AlertTriangle, description: 'Your item has been delivered. Please inspect it and confirm or raise a dispute within 24 hours.'
  },
  'completed': {
    label: 'Completed', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300',
    icon: CheckCircle, description: 'Transaction complete. Payment has been released to the vendor.'
  },
  'cancelled': {
    label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
    icon: AlertTriangle, description: 'This order has been cancelled.'
  },
  'disputed': {
    label: 'Under Dispute', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    icon: AlertTriangle, description: 'A dispute has been raised. Zolarux is investigating. Payment is frozen until resolution.'
  },
  'awaiting evidence submission': {
    label: 'Submit Evidence', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    icon: AlertTriangle, description: 'Zolarux needs evidence from you. Submit your photos, screenshots, and delivery proof via WhatsApp immediately.'
  },
  'evidence under review': {
    label: 'Evidence Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    icon: Scale, description: 'Zolarux is reviewing all submitted evidence from both sides. A decision will be issued within 48 hours.'
  },
  'decision reached': {
    label: 'Decision Made', color: 'text-primary', bg: 'bg-primary-light', border: 'border-primary-100',
    icon: Scale, description: 'Zolarux has reviewed all evidence and issued a decision. See below for details.'
  },
  'dispute closed': {
    label: 'Resolved', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200',
    icon: CheckCircle, description: 'This dispute has been closed.'
  },
}

const FAULT_MESSAGES: Record<string, { buyer: string; color: string; bg: string }> = {
  'vendor': {
    buyer: 'Decision: The vendor was found at fault. You will receive a full refund within 24 hours.',
    color: 'text-green-800', bg: 'bg-green-50 border-green-200',
  },
  'buyer': {
    buyer: 'Decision: Based on the evidence, the dispute was not upheld. Payment has been released to the vendor.',
    color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200',
  },
  'both parties': {
    buyer: 'Decision: Both parties share responsibility. A partial refund will be processed. Contact Zolarux for details.',
    color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200',
  },
}

const PIPELINE = [
  'pending',
  'pre-shipment verification',
  'in transit',
  'awaiting buyer confirmation',
  'completed',
]

const DISPUTE_PIPELINE = [
  'disputed',
  'awaiting evidence submission',
  'evidence under review',
  'decision reached',
  'dispute closed',
]

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

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
          <Link href="/listings"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all">
            Browse Listings <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
            const Icon = cfg.icon
            const isDisputed = DISPUTE_PIPELINE.includes(order.status)
            const pipelineIndex = PIPELINE.indexOf(order.status)
            const disputeIndex = DISPUTE_PIPELINE.indexOf(order.status)
            const needsConfirmation = order.status === 'awaiting buyer confirmation'
            const needsEvidence = order.status === 'awaiting evidence submission'
            const decisionReached = order.status === 'decision reached'
            const faultConfig = order.fault_party ? FAULT_MESSAGES[order.fault_party] : null

            return (
              <div key={order.id} className={`bg-white rounded-2xl border shadow-card overflow-hidden ${
                isDisputed ? 'border-red-200' : needsConfirmation ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'
              }`}>
                {/* Header */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-50">
                  <div>
                    <p className="font-display font-700 text-gray-900">{order.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.order_ref}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-700 px-2.5 py-1.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    <Icon size={11} />
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
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 transition-all ${
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
                    <div className="flex justify-between mt-1.5">
                      {['Placed', 'Verifying', 'Transit', 'Confirm', 'Done'].map(label => (
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
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-800 shrink-0 ${
                              done ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                            } ${active ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}>
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
                  {order.notes && (
                    <div className="col-span-2 sm:col-span-3">
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
                        <p className={`text-sm font-600 ${faultConfig.color}`}>{faultConfig.buyer}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm receipt CTA */}
                {needsConfirmation && (
                  <div className="px-5 pb-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-orange-800 text-sm font-600 mb-3">
                        Have you received and inspected your item?
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I confirm delivery and satisfaction for order ${order.order_ref}. Please release payment to the vendor.`)}`}
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

                {/* Evidence submission CTA */}
                {needsEvidence && (
                  <div className="px-5 pb-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 text-sm font-600 mb-3">
                        Zolarux needs your evidence. Submit immediately via WhatsApp.
                      </p>
                      <Link
                        href={`https://wa.me/2347063107314?text=${encodeURIComponent(`I am submitting evidence for dispute on order ${order.order_ref}:`)}`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full bg-red-600 text-white text-sm font-700 py-2.5 rounded-xl hover:bg-red-700 transition-all"
                      >
                        Submit Evidence on WhatsApp
                      </Link>
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