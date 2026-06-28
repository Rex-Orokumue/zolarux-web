import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, Lock, Search, Truck, ThumbsUp, AlertTriangle,
  MessageCircle, ArrowRight, CheckCircle, XCircle, Phone,
  Play, Star, Users, BadgeCheck, Gift, CreditCard
} from 'lucide-react'

export const metadata: Metadata = {
  alternates: { canonical: '/for-buyers' },
  title: 'For Buyers',
  description: 'Buy gadgets safely on Zolarux. Vendor verified, escrow protected. Never lose money to fake phones or disappearing sellers again.',
}

const FEARS = [
  { fear: 'Paying and the vendor disappears', solution: 'Your money sits in Zolarux escrow — the vendor never touches it until you confirm delivery.' },
  { fear: 'Receiving a fake or cloned phone', solution: 'We verify the gadget physically via video or photos and check serial numbers before shipping is approved.' },
  { fear: 'Getting a refurbished item sold as new', solution: 'Our inspection covers battery cycle count, screen authenticity, and BIOS verification.' },
  { fear: 'No recourse when something goes wrong', solution: 'Every transaction has a dispute process. We investigate, determine fault, and refund accordingly.' },
]

const STEPS = [
  { icon: Search,   step: '01', title: 'Find What You Need',   desc: 'Browse verified listings or tell us what you want. We source from trusted vendors only.' },
  { icon: Lock,     step: '02', title: 'Pay Into Escrow',      desc: 'You pay the product price plus a small protection fee. Funds secured by Zolarux — not the vendor.' },
  { icon: Shield,   step: '03', title: 'We Verify the Gadget', desc: 'Before anything ships, we inspect the item. Photos, serial check, originality confirmed.' },
  { icon: Truck,    step: '04', title: 'Vendor Delivers',       desc: 'We monitor delivery and logistics timeline with vendor accountability at every stage.' },
  { icon: ThumbsUp, step: '05', title: 'You Confirm. Done.',   desc: 'Only after you confirm satisfaction does the vendor get paid. You are always in control.' },
]

const PROTECTION_COVERS = [
  'Non-delivery of item',
  'Item significantly different from description',
  'Fake or cloned gadget',
  'Refurbished sold as brand new',
  'Damaged item on arrival',
  'Wrong specifications delivered',
]

const NOT_COVERED = [
  'Change of mind after delivery confirmation',
  'Damage caused by buyer after receipt',
  'Items bought outside Zolarux escrow',
]

const FEES = [
  { range: 'Up to ₦50,000',         fee: '₦1,500' },
  { range: '₦50,001 – ₦150,000',    fee: '₦2,500' },
  { range: '₦150,001 – ₦300,000',   fee: '₦4,000' },
  { range: 'Above ₦300,000',        fee: '₦5,000 (flat cap)' },
]

const REASONS_TO_SHOP = [
  { icon: BadgeCheck, title: 'We Know Every Vendor Personally', desc: 'Every vendor on Zolarux has gone through a face-to-face or live video verification. We know their real name, their NIN, their supplier, and their business address. We do not just verify documents — we verify people.' },
  { icon: Shield,     title: 'Your Money Never Touches the Vendor', desc: 'Unlike every other platform where you pay the seller directly and hope for the best, on Zolarux you pay us. The vendor gets paid only when you say you are satisfied. That is the fundamental difference.' },
  { icon: Users,      title: 'Real Human Dispute Resolution', desc: 'If something goes wrong, a real Zolarux team member investigates — not an algorithm. We review chat logs, photos, delivery proof, and make a fair decision. Usually resolved within 6 hours.' },
  { icon: Gift,       title: 'Zolarux Rewards (Coming Soon)', desc: 'Every completed transaction earns you Zolarux points. Points can be redeemed for discounts on future protection fees. The more you buy safely, the cheaper it gets.' },
  { icon: CreditCard, title: 'Buy Now, Pay Later (Coming Soon)', desc: 'We are building a BNPL feature for qualified buyers based on transaction history. Shop now, spread payments — fully backed by our escrow protection.' },
  { icon: Star,       title: 'Zero Confirmed Scams in 5 Years', desc: 'Over ₦2 million processed. Over 100 transactions. Zero confirmed scams. That record speaks for itself — and we intend to keep it.' },
]

export default function ForBuyersPage() {
  return (
    <div>
      {/* Hero with background image */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-primary/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Buyer Protection
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              Stop Losing Money to Gadget Scams Online
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              Nigerian social commerce is full of fake phones, missing orders, and vendors who
              vanish after payment. Zolarux puts your money in escrow and only releases it when
              you confirm satisfaction. Every single time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/listings"
                className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg">
                Browse Verified Listings <ArrowRight size={18} />
              </Link>
              <Link
                href="https://wa.me/2347063107314?text=Hi, I want to buy something safely on Zolarux"
                target="_blank"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-display font-700 px-7 py-4 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all">
                <MessageCircle size={18} /> Start on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fear vs Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              Every Fear You Have — We Have Already Solved It
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              These are the exact reasons Nigerian buyers hesitate to shop online. Here is how Zolarux handles each one.
            </p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {FEARS.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-card">
                <div className="bg-red-50 p-6 flex items-start gap-3">
                  <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-700 text-red-400 uppercase tracking-wider mb-1">The Fear</p>
                    <p className="text-gray-700 font-500">{item.fear}</p>
                  </div>
                </div>
                <div className="bg-green-50 p-6 flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-700 text-green-500 uppercase tracking-wider mb-1">How We Solve It</p>
                    <p className="text-gray-700 font-500">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">How Buying on Zolarux Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Five steps between you and a safe, verified gadget.</p>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {STEPS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-800 text-primary/40 tracking-wider mb-1">STEP {step}</p>
                  <h3 className="font-display font-700 text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer video placeholder */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">See Exactly How We Protect You</h2>
            <p className="text-gray-500 text-sm">A short video walkthrough of the Zolarux buyer experience.</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-card-hover" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-primary">
                <Play size={24} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-gray-400 text-sm">Buyer walkthrough video — coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* We Know Every Vendor + More Reasons */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              More Reasons to Shop on Zolarux
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Beyond escrow — here is what makes Zolarux genuinely different.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REASONS_TO_SHOP.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection coverage */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">What Buyer Protection Covers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle size={18} className="text-green-600" />
                <h3 className="font-display font-700 text-green-800">Covered</h3>
              </div>
              <ul className="space-y-3">
                {PROTECTION_COVERS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-2 mb-5">
                <XCircle size={18} className="text-red-500" />
                <h3 className="font-display font-700 text-red-800">Not Covered</h3>
              </div>
              <ul className="space-y-3">
                {NOT_COVERED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> Protection only applies to transactions processed through Zolarux escrow. Off-platform payments are not covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fee table */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">Protection Fee Structure</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A small flat fee for complete peace of mind. Paid once per transaction.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="bg-primary px-6 py-4 grid grid-cols-2">
                <p className="text-white/70 text-sm font-700">Transaction Value</p>
                <p className="text-white/70 text-sm font-700">Protection Fee</p>
              </div>
              {FEES.map((row, i) => (
                <div key={i} className={`px-6 py-4 grid grid-cols-2 ${i % 2 === 0 ? 'bg-white' : 'bg-surface'}`}>
                  <p className="text-gray-700 text-sm">{row.range}</p>
                  <p className="text-primary font-700 text-sm">{row.fee}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">
              Protection fee is non-refundable regardless of transaction outcome.
            </p>
          </div>
        </div>
      </section>

      {/* App promo */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display font-700 text-white text-xl mb-1">Track your orders on the go</p>
              <p className="text-gray-400 text-sm">Download the Zolarux Android app to track every order, verify vendors, and check stolen devices from your phone.</p>
            </div>
            <Link href="/downloads" className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-700 px-6 py-3 rounded-xl hover:bg-accent-dark transition-all text-sm">
              Download App <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">Ready to Buy Without Fear?</h2>
          <p className="text-white/70 mb-8">Browse verified listings or reach out on WhatsApp to start your first protected transaction.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/listings" className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all">
              Browse Listings <ArrowRight size={18} />
            </Link>
            <Link href="https://wa.me/2347063107314" target="_blank"
              className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all">
              <Phone size={18} /> WhatsApp Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}