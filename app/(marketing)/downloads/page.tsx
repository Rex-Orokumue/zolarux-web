import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import Link from 'next/link'
import { Download, Smartphone, Shield, CheckCircle, AlertTriangle, Star, ArrowRight, Package, Search, Flag, Link2 } from 'lucide-react'

export const metadata: Metadata = pageMeta({
  title: 'Download the App',
  description: 'Download the Zolarux Android app. Browse verified gadget listings, track escrow orders, verify vendors and check stolen devices — all in one place.',
  path: '/downloads',
})

const APP_FEATURES = [
  {
    icon: Package,
    title: 'Browse Verified Listings',
    desc: 'Browse hundreds of phones, laptops, and accessories — every single one from a vendor who has passed Zolarux identity and business verification. Filter by category, price, and condition.',
  },
  {
    icon: Shield,
    title: 'Track Your Escrow Orders',
    desc: 'See real-time order status as it moves through the pipeline — from payment confirmed, through pre-shipment verification, in transit, awaiting your confirmation, and completed. Every stage visible.',
  },
  {
    icon: Search,
    title: 'Check Any Vendor Instantly',
    desc: 'Scan any vendor ID or phone number directly from the app. Get instant verification status — verified, pending, or flagged — before you commit to any transaction.',
  },
  {
    icon: Flag,
    title: 'Report Stolen Devices',
    desc: 'Lost your phone or laptop? Report it immediately from the app. Your device is added to the national registry within minutes so no one can unknowingly buy it from a thief.',
  },
  {
    icon: AlertTriangle,
    title: 'Dispute Management',
    desc: 'Raise and track disputes directly from the app without needing to open WhatsApp. See dispute status, evidence submission deadlines, and resolution outcomes in real time.',
  },
  {
    icon: Link2,
    title: 'Scan Product Links',
    desc: 'See a gadget listed on Instagram or Jiji? Copy the link, paste it into the app, and get a safety score before you send any money. Scam signals detected instantly.',
  },
]

const INSTALL_STEPS = [
  {
    step: '1',
    title: 'Open the Google Drive Link',
    desc: 'Tap the download button above. It will open Google Drive in your browser.',
    note: null,
  },
  {
    step: '2',
    title: 'Download the APK from Google Drive',
    desc: 'Tap the download icon (⬇) at the top right of the Google Drive page. The APK file will save to your Downloads folder.',
    note: null,
  },
  {
    step: '3',
    title: 'Allow Installation from Unknown Sources',
    desc: 'Go to Settings → Security (or Privacy) → Install Unknown Apps. Find your file manager or browser and enable it.',
    note: 'Android blocks apps from outside the Play Store by default. This one-time setting is required.',
  },
  {
    step: '4',
    title: 'Open the Downloaded APK',
    desc: 'Go to your Downloads folder, tap the Zolarux APK file, and tap Install when prompted.',
    note: null,
  },
  {
    step: '5',
    title: 'Launch Zolarux',
    desc: 'Find the Zolarux icon on your home screen or app drawer and open it. You are ready to go.',
    note: null,
  },
]

const APP_INFO = [
  { label: 'Version',      value: '1.0.0' },
  { label: 'Platform',     value: 'Android 6.0+' },
  { label: 'File Size',    value: '~18 MB' },
  { label: 'Updated',      value: 'May 2026' },
]

export default function DownloadsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                Mobile App — Android
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
                Zolarux in Your Pocket
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8">
                Browse verified listings, track escrow orders, verify vendors,
                and check stolen devices — all from your phone. The complete
                Zolarux trust platform, offline-friendly and fast.
              </p>

              {/* Download CTA */}
              <a
                href="https://drive.google.com/file/d/1S1aeJG5OM_zcyoTtSfBJ8DMhUnBeIN93/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-primary font-display font-700 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4"
              >
                <Download size={22} />
                <div className="text-left">
                  <p className="text-xs text-primary/60 font-500">Download via</p>
                  <p className="text-base">Google Drive</p>
                </div>
              </a>

              <div className="flex items-center gap-2 mt-3">
                <AlertTriangle size={13} className="text-white/50" />
                <p className="text-white/50 text-xs">
                  Not yet on Google Play Store — coming soon.
                </p>
              </div>

              {/* App info pills */}
              <div className="flex flex-wrap gap-3 mt-8">
                {APP_INFO.map(({ label, value }) => (
                  <div key={label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-2">
                    <p className="text-white/50 text-xs">{label}</p>
                    <p className="text-white font-700 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup — hidden on mobile to avoid clutter */}
            <div className="hidden lg:flex justify-center">
              <div className="w-56 h-[460px] bg-white/10 border-2 border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 relative shrink-0">
                <div className="w-20 h-2 bg-white/20 rounded-full absolute top-5" />
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Smartphone size={28} className="text-white" />
                </div>
                <p className="text-white/60 text-sm font-600">Zolarux App</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-white/40 text-xs">Android</p>
                <div className="w-20 h-1 bg-white/20 rounded-full absolute bottom-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — deep descriptions */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-3">
              Everything in One App
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The Zolarux app is a complete trust platform — not just a listing browser.
              Here is what you can do:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {APP_FEATURES.map(({ icon: Icon, title, desc }) => (
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

      {/* Install guide */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-3">
              How to Install
            </h2>
            <p className="text-gray-500">
              The app is distributed via Google Drive. Follow these steps — it takes under 2 minutes.
            </p>
          </div>

          <div className="space-y-4">
            {INSTALL_STEPS.map(({ step, title, desc, note }) => (
              <div key={step} className="flex items-start gap-4 bg-surface rounded-2xl p-5 border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="font-display font-800 text-white text-sm">{step}</span>
                </div>
                <div>
                  <p className="font-display font-700 text-gray-900 mb-1">{title}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  {note && (
                    <p className="text-amber-600 text-xs mt-2 flex items-start gap-1.5">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      {note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="mt-6 bg-primary-light border border-primary-100 rounded-2xl p-5 flex items-start gap-3">
            <Shield size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-700 text-primary mb-1 text-sm">Is this safe?</p>
              <p className="text-primary/80 text-xs leading-relaxed">
                Yes. The Zolarux APK is built and signed by Zolarux Limited and hosted on
                our official Google Drive. Only download from this page or our official
                WhatsApp. Do not install APKs from other sources claiming to be Zolarux.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://drive.google.com/file/d/1S1aeJG5OM_zcyoTtSfBJ8DMhUnBeIN93/view?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary text-white font-display font-700 px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary"
            >
              <Download size={20} />
              Download from Google Drive
            </a>
          </div>
        </div>
      </section>

      {/* iOS note */}
      <section className="py-10 bg-surface border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Looking for iOS?</p>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
            The Zolarux iOS app is currently in development. iPhone users can access all features
            through our website or reach us via WhatsApp.
          </p>
          <Link
            href="https://wa.me/2347063107314?text=I use iPhone — how can I use Zolarux?"
            target="_blank"
            className="inline-flex items-center gap-2 text-primary font-700 text-sm hover:underline"
          >
            Contact us about iOS <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  )
}