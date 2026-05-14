import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, Lock, ClipboardCheck, Truck, ThumbsUp,
  Shield, AlertTriangle, ArrowRight, MessageCircle,
  CheckCircle, XCircle, Scale
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Zolarux escrow protects every gadget transaction. Vendor verification, escrow payment, product inspection, fulfillment monitoring, and buyer confirmation.',
}

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Inquiry & Vendor Assignment',
    color: 'bg-blue-500',
    who: 'Buyer initiates',
    details: [
      'You browse verified listings or contact Zolarux via WhatsApp',
      'Describe what you want — model, specs, budget',
      'We match you with a verified vendor who has the item',
      'We negotiate pricing on your behalf to avoid emotional manipulation',
      'No direct vendor contact at this stage — Zolarux coordinates everything',
    ],
    whyItMatters: 'Preventing direct buyer-vendor contact eliminates the most common manipulation tactics scammers use to push buyers off-platform.',
  },
  {
    number: '02',
    icon: Lock,
    title: 'Escrow Payment',
    color: 'bg-primary',
    who: 'Buyer pays Zolarux',
    details: [
      'You pay the full product price plus a small protection fee',
      'Payment goes directly to Zolarux — never to the vendor',
      'You receive a payment confirmation and transaction reference',
      'The vendor is notified that payment is secured and confirmed',
      'Vendor cannot access funds at this stage under any circumstance',
    ],
    whyItMatters: "Your money is in a controlled position. The vendor knows they will be paid — but only after fulfilling their obligations. This removes all incentive to cheat.",
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Pre-Shipment Verification',
    color: 'bg-amber-500',
    who: 'Zolarux verifies',
    details: [
      'Vendor submits product evidence before shipping is allowed',
      'We require date-stamped photos or live video of the item',
      'Serial numbers are checked against manufacturer databases',
      'For phones: battery cycle count, BIOS check, screen authenticity verified',
      'Packaging, accessories, and specifications confirmed against listing',
    ],
    whyItMatters: 'This is the step most commerce platforms skip. A product verified before shipping means no fake substitutions and no "it was different in person" situations.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Fulfillment Monitoring',
    color: 'bg-green-500',
    who: 'Zolarux monitors',
    details: [
      'Vendor provides rider information, tracking details, or delivery timeline',
      'We monitor that shipping begins within the agreed window',
      'Buyer is notified when item is dispatched',
      'If delivery is delayed, we follow up with vendor immediately',
      'Proof of delivery is requested from the vendor',
    ],
    whyItMatters: 'Non-delivery is one of the most common Nigerian social commerce scams. Active monitoring means we catch problems before they become irreversible.',
  },
  {
    number: '05',
    icon: ThumbsUp,
    title: 'Buyer Confirmation & Payout',
    color: 'bg-purple-500',
    who: 'Buyer confirms',
    details: [
      'You inspect the item immediately on delivery',
      'If satisfied, you confirm via WhatsApp or the app',
      'Zolarux releases payment to the vendor',
      'Transaction closes and both parties receive receipts',
      'Review and rating can be submitted for the vendor',
    ],
    whyItMatters: 'You are the final checkpoint. The vendor gets paid only when you say so. This is the core mechanic that makes Zolarux fundamentally different from any other platform.',
  },
]

const DISPUTE_STEPS = [
  { step: '1', title: 'Buyer raises dispute', desc: 'Within 24 hours of delivery, buyer reports the issue with evidence.' },
  { step: '2', title: 'Funds freeze', desc: 'Payment is immediately frozen. Vendor cannot access funds during investigation.' },
  { step: '3', title: 'Evidence review', desc: 'Both parties submit evidence. Zolarux reviews photos, videos, messages, and delivery proof.' },
  { step: '4', title: 'Decision issued', desc: 'Within 48–72 hours, Zolarux determines fault and issues a resolution.' },
  { step: '5', title: 'Refund or release', desc: 'Buyer receives full or partial refund, or vendor receives payment if dispute is found to be unwarranted.' },
]

const PRINCIPLES = [
  { icon: Shield,        text: 'Buyer money is sacred — funds are untouchable until buyer confirms' },
  { icon: ClipboardCheck, text: 'Verification beats speed — we never rush an inspection' },
  { icon: Scale,         text: 'Evidence over claims — decisions are always evidence-based' },
  { icon: CheckCircle,   text: 'Zolarux always controls the transaction — no off-platform exceptions' },
]

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              The Operating Model
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              How Zolarux Escrow Works
            </h1>
            <p className="text-white/75 text-lg leading-relaxed">
              Every Zolarux transaction follows a strict five-step process designed to
              eliminate every known vector of social commerce fraud in Nigeria.
              Here is exactly what happens to your money and your gadget.
            </p>
          </div>
        </div>
      </section>

      {/* The model overview */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { label: 'VENDOR', sub: 'Verified & monitored', color: 'bg-white/10 border-white/20' },
              { label: '↔', sub: '', color: 'transparent border-transparent', isArrow: true },
              { label: 'ZOLARUX', sub: 'Controls money & process', color: 'bg-primary border-primary', highlight: true },
              { label: '↔', sub: '', color: 'transparent border-transparent', isArrow: true },
              { label: 'BUYER', sub: 'Protected & informed', color: 'bg-white/10 border-white/20' },
            ].map((item, i) => (
              item.isArrow ? (
                <div key={i} className="text-white/40 text-2xl font-800 px-2 hidden md:block">↔</div>
              ) : (
                <div
                  key={i}
                  className={`border rounded-2xl px-8 py-5 text-center ${item.color}`}
                >
                  <p className={`font-display font-800 text-lg ${item.highlight ? 'text-white' : 'text-white'}`}>
                    {item.label}
                  </p>
                  {item.sub && <p className="text-white/60 text-xs mt-1">{item.sub}</p>}
                </div>
              )
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6 max-w-xl mx-auto">
            Zolarux sits in the middle of every transaction. Money flows through us.
            Products are verified by us. Disputes are resolved by us.
          </p>
        </div>
      </section>

      {/* Detailed steps */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              The Five-Step Transaction Flow
            </h2>
            <p className="text-gray-500 text-lg">
              Every step exists for a specific reason. None are skipped.
            </p>
          </div>

          <div className="space-y-6">
            {STEPS.map(({ number, icon: Icon, title, color, who, details, whyItMatters }) => (
              <div key={number} className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
                {/* Step header */}
                <div className={`${color} px-6 py-5 flex items-center gap-4`}>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-700 tracking-wider">STEP {number}</p>
                    <h3 className="font-display font-700 text-white text-lg">{title}</h3>
                  </div>
                  <div className="ml-auto">
                    <span className="bg-white/20 text-white text-xs font-600 px-3 py-1 rounded-full">
                      {who}
                    </span>
                  </div>
                </div>

                {/* Step body */}
                <div className="p-6">
                  <ul className="space-y-2.5 mb-5">
                    {details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-700 text-amber-700 uppercase tracking-wider mb-1">
                      Why This Step Matters
                    </p>
                    <p className="text-amber-800 text-sm leading-relaxed">{whyItMatters}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dispute resolution */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              What Happens When Something Goes Wrong
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Disputes are rare when verification is done properly. But when they happen,
              here is exactly how we handle them.
            </p>
          </div>

          <div className="space-y-3">
            {DISPUTE_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 bg-surface rounded-2xl p-5 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="font-display font-800 text-red-600 text-sm">{step}</span>
                </div>
                <div>
                  <p className="font-display font-700 text-gray-900 mb-1">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <p className="font-700 text-green-800 text-sm mb-2">If fault is with the vendor</p>
              <ul className="space-y-1.5 text-sm text-green-700">
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Full refund to buyer</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Vendor's trust score drops</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Repeat violations result in removal</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <p className="font-700 text-blue-800 text-sm mb-2">If fault is with the buyer</p>
              <ul className="space-y-1.5 text-sm text-blue-700">
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Vendor receives full payment</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Buyer's account flagged</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} /> Fraudulent claims result in ban</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core principles */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-white text-center mb-8">
            Our Non-Negotiable Operating Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Icon size={16} className="text-accent shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">
            Ready to Start a Protected Transaction?
          </h2>
          <p className="text-white/70 mb-8">
            Browse listings or reach out on WhatsApp to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all"
            >
              Browse Verified Listings <ArrowRight size={18} />
            </Link>
            <Link
              href="https://wa.me/2347063107314"
              target="_blank"
              className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all"
            >
              <MessageCircle size={18} /> Start on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}