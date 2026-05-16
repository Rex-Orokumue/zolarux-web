import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield, TrendingUp, Users, CheckCircle, ArrowRight,
  Star, BadgeCheck, Banknote, Clock, MessageCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Vendors',
  description: 'Become a Zolarux Verified Vendor. Sell gadgets with full buyer trust. Escrow payments mean you always get paid for legitimate orders.',
}

const PROBLEMS = [
  { problem: 'Buyers ghost you after asking for bank details', solution: 'Zolarux collects payment on your behalf. Buyers pay us, not you directly — reducing friction and distrust.' },
  { problem: 'Customers demand "send me a video first" endlessly', solution: 'Your Zolarux Verified badge replaces the need for repeated proof. Buyers already trust the verification.' },
  { problem: 'Chargebacks and fake payment alerts', solution: 'All payments are confirmed and held in escrow before you ship. No fake alerts. No reversals.' },
  { problem: 'Dropshipping with zero capital', solution: "Buyer pays Zolarux → we pay your supplier → supplier ships → you collect profit. Zero capital required." },
]

const BENEFITS = [
  { icon: BadgeCheck, title: 'Verified Vendor Badge',     desc: 'A publicly searchable verification that buyers can check instantly. Instant credibility.' },
  { icon: Banknote,   title: 'Guaranteed Payment',        desc: 'Once the buyer confirms delivery, you get paid. No ghosting. No payment disputes on your end.' },
  { icon: TrendingUp, title: 'Increased Sales',           desc: 'Verified vendors consistently report more conversions because buyers feel safe paying upfront.' },
  { icon: Users,      title: 'Access to Buyer Network',   desc: "Your products appear on Zolarux's verified listings, reaching buyers actively looking for safe transactions." },
  { icon: Shield,     title: 'Dispute Protection',        desc: 'When disputes arise, Zolarux investigates fairly. Vendors are protected from fraudulent buyer claims.' },
  { icon: Clock,      title: 'Fast Payout on Completion', desc: 'Payments are released promptly once buyers confirm. No waiting weeks for settlement.' },
]

const REQUIREMENTS = [
  'Valid government-issued ID (NIN or International Passport)',
  'Proof of business or supplier relationship',
  'Active social media or business presence',
  'Willingness to complete a video verification call',
  'Agreement to Zolarux Vendor Terms and SOP',
  'A guarantor (for high-value vendor applications)',
]

const VENDOR_TYPES = [
  {
    type: 'Gadget Reseller',
    desc: 'You source phones, laptops, and accessories and resell them. Zolarux verifies your supplier and protects each transaction.',
    badge: 'Most Common',
    badgeColor: 'bg-primary-light text-primary',
  },
  {
    type: 'Dropship Vendor',
    desc: "You don't hold stock. Buyers pay Zolarux, we pay your supplier directly, supplier ships. You earn the margin safely.",
    badge: 'Zero Capital',
    badgeColor: 'bg-green-50 text-green-700',
  },
  {
    type: 'Direct Importer',
    desc: 'You import directly from manufacturers. Zolarux verifies your import documentation and product authenticity.',
    badge: 'High Volume',
    badgeColor: 'bg-accent-light text-accent-dark',
  },
]

const PROCESS = [
  { step: '01', title: 'Apply Online',          desc: 'Fill out the vendor registration form. Takes about 10 minutes.' },
  { step: '02', title: 'Document Submission',   desc: 'Submit your ID, business proof, and supplier information.' },
  { step: '03', title: 'Video Verification',    desc: 'A short call with our verification team. We confirm identity and business legitimacy.' },
  { step: '04', title: 'Scoring & Decision',    desc: 'We score your application out of 100 points. 60+ passes for verification.' },
  { step: '05', title: 'Get Your Badge',        desc: 'Your Vendor ID and verified badge go live. Start listing products immediately.' },
]

export default function ForVendorsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/10 text-white/80 text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Vendor Programme
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              Sell More Gadgets.{' '}
              <span className="text-accent">Get Paid Every Time.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              The Zolarux Verified badge tells buyers you are real, you are trustworthy,
              and their money is protected. Stop chasing customers with proof videos.
              Let your verification do the talking.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register/vendor"
                className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all shadow-lg animate-nav-pulse"
              >
                Apply to Become a Vendor <ArrowRight size={18} />
              </Link>
              <Link
                href="https://wa.me/2347063107314?text=Hi, I want to become a Zolarux verified vendor"
                target="_blank"
                className="inline-flex items-center gap-2 border-2 border-white/20 text-white font-display font-700 px-7 py-4 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all"
              >
                <MessageCircle size={18} /> Ask Questions First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problems we solve */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              Problems Every Nigerian Gadget Vendor Faces
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We built Zolarux around the real frustrations of vendors who sell on WhatsApp and Instagram.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {PROBLEMS.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-card">
                <div className="bg-surface p-6">
                  <p className="text-xs font-700 text-gray-400 uppercase tracking-wider mb-2">The Problem</p>
                  <p className="text-gray-700 font-500">{item.problem}</p>
                </div>
                <div className="bg-primary p-6">
                  <p className="text-xs font-700 text-white/60 uppercase tracking-wider mb-2">Zolarux Solution</p>
                  <p className="text-white font-500">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              What You Get as a Verified Vendor
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
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

      {/* Vendor types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              Which Vendor Type Are You?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VENDOR_TYPES.map((vt) => (
              <div key={vt.type} className="bg-surface rounded-2xl p-6 border border-gray-100">
                <div className={`inline-block text-xs font-700 px-3 py-1 rounded-full mb-4 ${vt.badgeColor}`}>
                  {vt.badge}
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-3">{vt.type}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{vt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application process */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-white mb-4">
              How to Get Verified
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              The full process takes 24–72 hours from application to badge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {PROCESS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-800 text-white text-sm">{step}</span>
                </div>
                <h3 className="font-display font-700 text-white text-sm mb-2">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
                Vendor Requirements
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We verify seriously because our buyers trust us seriously. These requirements
                protect both you and your customers.
              </p>
              <ul className="space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Star size={20} className="text-accent" />
                <h3 className="font-display font-700 text-gray-900">100-Point Trust Score</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Every vendor is scored out of 100 points across identity, business
                legitimacy, supplier verification, and risk assessment. A score of
                60 or above earns the Verified badge.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Identity Verification', score: 30 },
                  { label: 'Business Legitimacy',   score: 25 },
                  { label: 'Supplier Verification', score: 25 },
                  { label: 'Risk Assessment',        score: 20 },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-700 text-primary">{score} pts</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">
            Ready to Sell with Full Buyer Trust?
          </h2>
          <p className="text-white/70 mb-8">
            Applications take 10 minutes. Verification takes 24–72 hours. Your badge lasts as long as you maintain standards.
          </p>
          <Link
            href="/vendor-registration"
            className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg"
          >
            Start Your Application <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}