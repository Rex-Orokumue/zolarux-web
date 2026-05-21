import Link from 'next/link'
import {
  Shield, CheckCircle, Lock, ArrowRight,
  Smartphone, Laptop, Headphones, Zap,
  Search, ClipboardCheck, Truck, ThumbsUp,
  Star, AlertTriangle, Link2, Flag, Play
} from 'lucide-react'
import VendorCheckerInline from '@/components/trust/VendorCheckerInline'

const STATS = [
  { value: '₦2M+', label: 'Protected in Escrow' },
  { value: '100+', label: 'Transactions Completed' },
  { value: '0',    label: 'Confirmed Scams' },
  { value: '5yrs', label: 'Building Trust' },
]

const STEPS = [
  { number: '01', icon: Search,       title: 'Inquiry',           desc: 'You contact Zolarux about a gadget. We negotiate with the vendor — no direct friction.' },
  { number: '02', icon: Lock,         title: 'Escrow Payment',    desc: 'You pay the product price plus a small protection fee. Funds held by Zolarux — not the vendor.' },
  { number: '03', icon: ClipboardCheck, title: 'Verification',    desc: 'We verify the physical gadget via video or photos before shipping is approved.' },
  { number: '04', icon: Truck,        title: 'Fulfillment',       desc: 'Vendor delivers. We monitor logistics and timelines. You inspect on arrival.' },
  { number: '05', icon: ThumbsUp,     title: 'You Confirm. We Pay.', desc: 'Only after you confirm satisfaction do we release payment to the vendor.' },
]

const CATEGORIES = [
  { label: 'Phones',      icon: Smartphone, href: '/listings?category=Phones' },
  { label: 'Laptops',     icon: Laptop,     href: '/listings?category=Laptops' },
  { label: 'Accessories', icon: Headphones, href: '/listings?category=Accessories' },
  { label: 'Electronics', icon: Zap,        href: '/listings?category=Electronics' },
]

const TOOLS = [
  { icon: Shield,       title: 'Check a Vendor',      desc: 'Instantly verify if any vendor is Zolarux-certified before you pay them anything.', href: '/check-vendor',   color: 'bg-blue-50 text-primary',    badge: 'Most Used' },
  { icon: Smartphone,   title: 'Check Stolen Status', desc: "Buying a used phone? Check the IMEI against our national stolen device registry.",   href: '/check-device',   color: 'bg-red-50 text-red-600',     badge: null },
  { icon: Search,       title: 'Verify Originality',  desc: "Is that iPhone real or a clone? Verify against the manufacturer's global database.",  href: '/check-original', color: 'bg-green-50 text-green-600', badge: null },
  { icon: Link2,        title: 'Scan a Link',          desc: 'Paste any product link from Instagram or Jiji. We detect scam signals instantly.',   href: '/scan-link',      color: 'bg-amber-50 text-amber-600', badge: 'New' },
  { icon: Flag,         title: 'Report Stolen Device', desc: "Lost your phone? Report it now so no one buys it from a thief unknowingly.",         href: '/report-item',    color: 'bg-purple-50 text-purple-600', badge: null },
]

const TESTIMONIALS = [
  {
    quote: 'I was about to buy a "UK Used" iPhone 13 for ₦280k. Zolarux verified it was refurbished with a replaced screen. Saved me from a huge mistake.',
    name: 'Adebayo O.', role: 'Buyer · Abuja', stars: 5,
  },
  {
    quote: 'My clients used to be scared to pay upfront. Since I got Zolarux verified, they pay immediately. My sales genuinely doubled within two months.',
    name: 'Chioma N.', role: 'Verified Vendor · Lagos', stars: 5,
  },
  {
    quote: "As a dropshipper with no capital, Zolarux's split-payment system let me fulfill orders using the customer's payment. Life-changing for my business.",
    name: 'Tunde M.', role: 'Dropship Vendor · Port Harcourt', stars: 5,
  },
]

// Placeholder YouTube video ID — replace with real video when ready
const INTRO_VIDEO_ID = 'dQw4w9WgXcQ'

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO — background image + overlay ────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1600&q=80')`,
          }}
        />
        {/* Blue overlay */}
        <div className="absolute inset-0 bg-primary/88" />

        {/* Subtle pattern on top of overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-8">
                <Shield size={13} className="text-accent" />
                <span className="text-white/90 text-xs font-600 tracking-wide">
                  Trust Infrastructure for Nigerian Gadget Commerce
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-800 text-white leading-[1.08] mb-6">
                Buy Gadgets Online{' '}
                <span className="text-accent">Without Fear.</span>
              </h1>

              <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-xl">
                We verify the vendor, hold your payment in escrow, and inspect
                the gadget before you approve payout. No more scams. No more fake
                phones. No more money lost.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Browse Verified Listings <ArrowRight size={18} />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-display font-700 px-8 py-4 rounded-xl hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  How Escrow Works
                </Link>
              </div>

              <div className="flex flex-wrap gap-6">
                {['✓ Vendor Verified', '✓ Escrow Protected', '✓ Dispute Resolved'].map((item) => (
                  <span key={item} className="text-white/70 text-sm font-500">{item}</span>
                ))}
              </div>
            </div>

            {/* Right — vendor checker form */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6">
                <p className="text-white font-display font-700 text-lg mb-1">Quick Vendor Check</p>
                <p className="text-white/60 text-sm mb-5">
                  Enter any vendor phone number or ID to verify instantly
                </p>
                <VendorCheckerInline />
                <p className="text-white/40 text-xs mt-4 text-center">
                  Free to use · No account required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-800">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-6 py-2">
                <p className="font-display text-3xl font-800 text-white">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY TOOLS — prominent section ─────────────────────────────── */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/10 text-white/80 text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              Free for Everyone — No Account Needed
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-white mb-4">
              Nigeria&apos;s Most Complete Gadget Safety Tools
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Before you buy any gadget — anywhere — use our free tools to protect yourself.
              Thousands of Nigerians check before they pay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative"
                >
                  {tool.badge && (
                    <span className="absolute top-4 right-4 bg-accent text-white text-xs font-700 px-2 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display font-700 text-white mb-2">{tool.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{tool.desc}</p>
                  <span className="text-primary-100 text-sm font-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Use Tool <ArrowRight size={13} />
                  </span>
                </Link>
              )
            })}

            {/* Mobile vendor checker card */}
            <div className="lg:hidden bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Shield size={18} className="text-primary" />
              </div>
              <h3 className="font-display font-700 text-white mb-2">Quick Vendor Check</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Enter any vendor phone number or ID to verify instantly.
              </p>
              <VendorCheckerInline compact />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BROWSE ───────────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every listing is from a verified vendor. Every transaction is escrow-protected.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group bg-white rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                  <Icon size={24} className="text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="font-display font-700 text-gray-900 group-hover:text-primary transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-1">View listings →</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/listings" className="inline-flex items-center gap-2 text-primary font-700 hover:gap-3 transition-all">
              See all verified listings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="trust-flow" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-light text-primary text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              The Operating Model
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              We Control the Money &amp; The Process
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We sit between you and the vendor. Funds are only released when every step below is completed.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-light via-primary to-primary-light" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="relative flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="relative z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-primary mb-4">
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-800 text-primary/40 mb-1 tracking-wider">STEP {step.number}</span>
                    <h3 className="font-display font-700 text-gray-900 mb-2 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center mt-14">
            <div className="inline-flex items-center gap-3 bg-gray-950 text-white px-6 py-3 rounded-xl text-sm font-500">
              <Lock size={15} className="text-accent" />
              <span>Your money stays locked until <strong>you</strong> confirm delivery and satisfaction.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO VIDEO ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary-light text-primary text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              See How It Works
            </span>
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              Watch: What is Zolarux?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A quick introduction to how Zolarux protects every gadget transaction in Nigeria.
            </p>
          </div>

          {/* Video placeholder — replace src with real YouTube embed URL */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-card-hover" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-primary cursor-pointer hover:scale-110 transition-transform">
                <Play size={30} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-gray-400 text-sm">Video coming soon</p>
              <p className="text-gray-500 text-xs">Replace with YouTube embed when ready</p>
            </div>
            {/* Uncomment and replace VIDEO_ID when ready:
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="What is Zolarux?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            */}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-4">
              Real People. Real Transactions.
            </h2>
            <p className="text-gray-500 text-lg">Every story here is from a real Zolarux transaction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-display font-700 text-sm">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-700 text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP PROMOTION ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-primary">
                <Smartphone size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-800 text-white mb-1">
                  Get the Zolarux App
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Browse verified listings, track orders, verify vendors, and check stolen devices —
                  all from your Android phone. Available on Google Drive now.
                </p>
              </div>
            </div>
            <Link
              href="/downloads"
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all animate-nav-pulse"
            >
              Download Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DUAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={22} className="text-white" />
              </div>
              <h3 className="font-display text-2xl font-800 text-white mb-3">Ready to buy safely?</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Browse verified gadget listings. Every seller is vetted. Every payment is protected until you confirm delivery.
              </p>
              <Link href="/listings" className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-all">
                Browse Listings <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-accent/20 border border-accent/30 rounded-3xl p-8">
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle size={22} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl font-800 text-white mb-3">Sell more. Sell safely.</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Get the Zolarux Verified badge. Buyers trust you instantly. No more &ldquo;send me a video first&rdquo; back-and-forth.
              </p>
              <Link href="/register/vendor" className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-6 py-3.5 rounded-xl hover:bg-accent-dark transition-all">
                Become a Vendor <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}