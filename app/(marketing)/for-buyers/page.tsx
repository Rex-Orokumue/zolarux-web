import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import Link from 'next/link'
import { MessageCircle, ArrowRight, Package, Phone, CreditCard, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = pageMeta({
  title: 'How to Buy',
  description: 'How to buy from Zolarux: message Rex on WhatsApp, confirm your order, and get exactly what you ordered — or your money back. No arguments.',
  path: '/for-buyers',
})

export default function ForBuyersPage() {
  return (
    <div>
      {/* Hero with background image — matches How It Works hero treatment */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121C42]/95 via-primary/75 to-primary/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              How to Buy
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              How to Buy from Zolarux
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              Buying a gadget online in Nigeria shouldn&apos;t feel like a risk. At Zolarux, it isn&apos;t.
              Every order comes with a simple, unconditional guarantee: you get exactly what you
              ordered, or your money back. No arguments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/listings"
                className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg">
                Browse Listings <ArrowRight size={18} />
              </Link>
              <Link
                href="https://wa.me/2348120288390?text=Hi Rex, I want to order a gadget"
                target="_blank"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-display font-700 px-7 py-4 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all">
                <MessageCircle size={18} /> WhatsApp Rex to Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badge strip */}
      <section className="bg-surface py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['✓ 5 Years in Operation', '✓ 100+ Happy Customers', '✓ Zero Losses. Ever.'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center bg-primary-light text-primary text-sm font-600 px-4 py-2 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How to Place an Order */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-5 bg-surface rounded-2xl p-8 border border-gray-100 shadow-card">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-800 text-gray-900 mb-3">
                How to Place an Order
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Everything starts on WhatsApp. Send a message to 08120288390 with the gadget
                you&apos;re looking for — the model, storage size, colour, and any other specifics.
                Rex will confirm availability, send you photos or a video of the exact item, and
                give you a final price before you pay anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens After You Pay */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-5 bg-white rounded-2xl p-8 border border-gray-100 shadow-card">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-800 text-gray-900 mb-3">
                What Happens After You Pay
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Once payment is confirmed, Rex coordinates directly with the supplier to get your
                item dispatched. You&apos;ll be kept updated at every stage — from dispatch to
                delivery. Rex stays involved until the gadget is in your hands and you&apos;ve
                confirmed it&apos;s exactly right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Every order, personal attention — image band */}
      <section className="relative overflow-hidden min-h-[280px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121C42]/95 via-primary/75 to-primary/30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center w-full">
          <h2 className="font-display text-3xl sm:text-4xl font-800 text-white mb-3">
            Every order. Personal attention.
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Rex handles every transaction himself — from the first WhatsApp message to confirmed delivery.
          </p>
        </div>
      </section>

      {/* Flexible Payment Plans */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-5 bg-white rounded-2xl p-8 border border-gray-100 shadow-card">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-800 text-gray-900 mb-3">
                Flexible Payment Plans
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Can&apos;t pay the full amount at once? That&apos;s fine. Zolarux offers
                flexible payment plans — you pay in instalments at a pace that works for
                you, and your gadget is reserved and released to you once the full amount
                is settled. WhatsApp Rex on 08120288390 to discuss a payment arrangement
                before placing your order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Guarantee */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-5 bg-primary-light rounded-2xl p-8 border border-primary/10">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-800 text-gray-900 mb-3">
                The Guarantee
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                If what arrives is not exactly what was described — wrong model, wrong condition,
                wrong spec — Rex will sort it. Either the correct item is sent, or you get a full
                refund. This guarantee has held for five years across 100+ orders. It is not a
                marketing line. It is how every transaction works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App promo */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display font-700 text-white text-xl mb-1">Track your orders on the go</p>
              <p className="text-gray-400 text-sm">Download the Zolarux Android app to browse gadgets and track your orders from your phone.</p>
            </div>
            <Link href="/downloads" className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-700 px-6 py-3 rounded-xl hover:bg-accent-dark transition-all text-sm">
              Download App <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Ready to Order */}
      <section className="py-16 bg-[#1B3A6B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">Ready to Order?</h2>
          <p className="text-white/70 mb-4">
            WhatsApp Rex directly on 08120288390. Tell him what you&apos;re looking for and
            he&apos;ll take it from there.
          </p>
          <p className="text-white/60 text-sm italic mb-8">
            5 years. 100+ customers. Nobody has ever lost money buying from Rex.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://wa.me/2348120288390" target="_blank"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb958] text-white font-display font-700 px-7 py-4 rounded-xl transition-all">
              <Phone size={18} /> WhatsApp to Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
