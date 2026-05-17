'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, MessageCircle, ArrowRight, Shield } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const orderRef = params.get('ref')

  const whatsappMsg = orderRef
    ? `Hi Zolarux! I just completed payment for order ${orderRef}. Please confirm you have received the notification and let me know next steps.`
    : `Hi Zolarux! I just completed a payment on your platform. Please confirm you have received the notification.`

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full">
        {/* Success card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          {/* Green header */}
          <div className="bg-green-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="font-display text-3xl font-800 text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-white/80 text-sm">
              Your payment has been received and secured in escrow
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Order ref */}
            {orderRef && (
              <div className="bg-surface rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Reference</p>
                <p className="font-mono font-800 text-primary text-xl">{orderRef}</p>
                <p className="text-xs text-gray-400 mt-1">Save this for tracking your order</p>
              </div>
            )}

            {/* What happens next */}
            <div>
              <p className="font-display font-700 text-gray-900 mb-3">What happens next?</p>
              <div className="space-y-3">
                {[
                  { icon: Shield,   text: 'Your payment is held safely in Zolarux escrow — the vendor cannot access it yet' },
                  { icon: Package,  text: 'Zolarux will verify the item before the vendor is allowed to ship' },
                  { icon: CheckCircle, text: 'Once delivered and you confirm, payment is released to the vendor' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3 bg-primary-light rounded-xl p-3">
                    <Icon size={15} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-primary text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notify Zolarux CTA */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-700 text-green-800 text-sm mb-2">
                Notify Zolarux on WhatsApp
              </p>
              <p className="text-green-700 text-xs leading-relaxed mb-4">
                Send us a message to confirm your order and speed up the verification process.
                Our team will contact you within minutes during business hours.
              </p>
              <Link
                href={`https://wa.me/2347063107314?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-display font-700 py-3.5 rounded-xl hover:bg-green-600 transition-all"
              >
                <MessageCircle size={18} />
                Notify Zolarux on WhatsApp
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/buyer/orders"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-700 py-3 rounded-xl hover:bg-primary-dark transition-all text-sm"
              >
                <Package size={15} /> Track My Order
              </Link>
              <Link
                href="/listings"
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-700 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}