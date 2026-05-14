import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, Lock, Search, Truck, ThumbsUp, AlertTriangle,
  MessageCircle, ArrowRight, CheckCircle, XCircle, Phone
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Buyers',
  description: 'Buy gadgets safely on Zolarux. Vendor verified, escrow protected. Never lose money to fake phones or disappearing sellers again.',
}

const FEARS = [
  { fear: 'Paying and the vendor disappears', solution: 'Your money sits in Zolarux escrow — the vendor never touches it until you confirm delivery.' },
  { fear: 'Receiving a fake or cloned phone', solution: 'We verify the gadget physically via video or photos and check serial numbers before shipping is approved.' },
  { fear: 'Getting a refurbished item sold as new', solution: 'Our inspection process includes battery cycle count, screen authenticity, and BIOS verification.' },
  { fear: 'No recourse when something goes wrong', solution: 'Every transaction has a dispute process. We investigate, determine fault, and refund accordingly.' },
]

const STEPS = [
  { icon: Search,      step: '01', title: 'Find What You Need',   desc: 'Browse verified listings or tell us what you want. We source from trusted vendors only.' },
  { icon: Lock,        step: '02', title: 'Pay Into Escrow',       desc: 'You pay the product price plus a small protection fee. Funds are secured by Zolarux.' },
  { icon: Shield,      step: '03', title: 'We Verify the Gadget',  desc: 'Before anything ships, we inspect the item. You get a report. No surprises on delivery.' },
  { icon: Truck,       step: '04', title: 'Vendor Delivers',       desc: 'We monitor the delivery process and timeline with logistics details.' },
  { icon: ThumbsUp,    step: '05', title: 'You Confirm. Done.',    desc: 'Only after you confirm satisfaction does the vendor get paid. You are always in control.' },
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
  { range: 'Up to ₦50,000',        fee: '₦2,000' },
  { range: '₦50,001 – ₦150,000',   fee: '₦3,500' },
  { range: '₦150,001 – ₦300,000',  fee: '₦5,000' },
  { range: 'Above ₦300,000',       fee: 'Contact us' },
]

export default function ForBuyersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Buyer Protection
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              Stop Losing Money to Gadget Scams Online
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              Nigerian social commerce is full of fake phones, missing orders, and
              vendors who vanish after payment. Zolarux puts your money in escrow and
              only releases it when you are satisfied. Every single time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                Browse Verified Listings <ArrowRight size={18} />
              </Link>
              <Link
                href="https://wa.me/2347063107314?text=Hi, I want to buy something safely on Zolarux"
                target="_blank"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-display font-700 px-7 py-4 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all"
              >
                <MessageCircle size={18} /> Start on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Your Fears, Our Answers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              Every Fear You Have — We Have Already Solved It
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              These are the exact reasons Nigerian buyers hesitate to shop online.
              Here is how Zolarux handles each one.
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

      {/* How it works for buyers */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              How Buying on Zolarux Works
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Five steps between you and a safe, verified gadget.
            </p>
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

      {/* Protection coverage */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              What Buyer Protection Covers
            </h2>
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
                  <strong>Important:</strong> Protection only applies to transactions
                  processed through Zolarux escrow. Off-platform payments are not covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protection fees */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              Protection Fee Structure
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A small fee for complete peace of mind. Paid once per transaction.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="bg-primary px-6 py-4 grid grid-cols-2">
                <p className="text-white/70 text-sm font-700">Transaction Value</p>
                <p className="text-white/70 text-sm font-700">Protection Fee</p>
              </div>
              {FEES.map((row, i) => (
                <div
                  key={i}
                  className={`px-6 py-4 grid grid-cols-2 ${i % 2 === 0 ? 'bg-white' : 'bg-surface'}`}
                >
                  <p className="text-gray-700 text-sm">{row.range}</p>
                  <p className="text-primary font-700 text-sm">{row.fee}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">
              Fees are reviewed periodically. WhatsApp us for large or custom transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Safety tools promo */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <AlertTriangle size={28} className="text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl font-800 text-white mb-3">
            Before You Buy Anywhere — Verify First
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Use our free tools to check vendors, devices, and product links even before
            you start an escrow transaction.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Check a Vendor', href: '/check-vendor' },
              { label: 'Check Stolen Status', href: '/check-device' },
              { label: 'Verify Originality', href: '/check-original' },
              { label: 'Scan a Link', href: '/scan-link' },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-600 rounded-xl hover:bg-white/20 transition-all"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">
            Ready to Buy Without Fear?
          </h2>
          <p className="text-white/70 mb-8">
            Browse verified listings or reach out on WhatsApp to start your first protected transaction.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all"
            >
              Browse Listings <ArrowRight size={18} />
            </Link>
            <Link
              href="https://wa.me/2347063107314"
              target="_blank"
              className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all"
            >
              <Phone size={18} /> WhatsApp Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}