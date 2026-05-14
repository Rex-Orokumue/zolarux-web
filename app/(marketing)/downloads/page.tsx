import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Smartphone, Download, Shield, CheckCircle,
  AlertTriangle, ArrowRight, Star
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Download the App',
  description: 'Download the Zolarux app for Android. Browse verified gadget listings, track escrow orders, check vendors, and report stolen devices — all in one place.',
}

const APP_FEATURES = [
  { title: 'Browse Verified Listings',    desc: 'Phones, laptops, accessories — all from verified vendors' },
  { title: 'Track Your Escrow Orders',    desc: 'Real-time order status from payment to delivery confirmation' },
  { title: 'Check Vendor Instantly',      desc: 'Scan any vendor ID or phone number for verification status' },
  { title: 'Report Stolen Devices',       desc: 'Add a stolen device to the national registry from your phone' },
  { title: 'Dispute Management',          desc: 'Raise and track disputes directly from the app' },
  { title: 'App Update Notifications',    desc: 'Always stay on the latest version with forced update alerts' },
]

const INSTALL_STEPS = [
  {
    step: '1',
    title: 'Download the APK',
    desc: 'Tap the download button above. The APK file will save to your Downloads folder.',
  },
  {
    step: '2',
    title: 'Allow Unknown Sources',
    desc: 'Go to Settings → Security (or Privacy) → Install Unknown Apps. Enable for your file manager or browser.',
    note: 'This is required because Zolarux is not yet on the Google Play Store. We are working on it.',
  },
  {
    step: '3',
    title: 'Open the APK File',
    desc: 'Go to your Downloads folder and tap the Zolarux APK file to begin installation.',
  },
  {
    step: '4',
    title: 'Tap Install',
    desc: 'Follow the on-screen prompts. The installation takes about 10 seconds.',
  },
  {
    step: '5',
    title: 'Open Zolarux',
    desc: 'Find the Zolarux icon on your home screen or app drawer and launch it.',
  },
]

const APP_INFO = [
  { label: 'Version',       value: '1.0.0' },
  { label: 'Platform',      value: 'Android 6.0+' },
  { label: 'File Size',     value: '~18 MB' },
  { label: 'Last Updated',  value: 'May 2026' },
]

export default function DownloadsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                Mobile App
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
                Zolarux in Your Pocket
              </h1>
              <p className="text-white/75 text-lg leading-relaxed mb-8">
                Browse verified listings, track your escrow orders, verify vendors,
                and check stolen devices — all from the Zolarux Android app.
              </p>

              {/* Download button */}
              <a
                href="/downloads/zolarux.apk"
                className="inline-flex items-center gap-3 bg-white text-primary font-display font-700 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4"
              >
                <Download size={22} />
                <div className="text-left">
                  <p className="text-xs text-primary/60 font-500">Download for</p>
                  <p className="text-base">Android APK</p>
                </div>
              </a>

              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle size={13} className="text-white/50" />
                <p className="text-white/50 text-xs">
                  Not yet on Google Play Store. See installation guide below.
                </p>
              </div>

              {/* App info */}
              <div className="flex flex-wrap gap-4 mt-8">
                {APP_INFO.map(({ label, value }) => (
                  <div key={label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-white/50 text-xs">{label}</p>
                    <p className="text-white font-700 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup placeholder */}
            <div className="hidden lg:flex justify-center">
              <div className="w-64 h-[500px] bg-white/10 border-2 border-white/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 relative">
                <div className="w-24 h-2 bg-white/20 rounded-full absolute top-6" />
                <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Smartphone size={32} className="text-white" />
                </div>
                <p className="text-white/60 text-sm font-600">Zolarux App</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-accent fill-accent" />
                  ))}
                </div>
                <div className="w-24 h-1 bg-white/20 rounded-full absolute bottom-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-3">
              What You Can Do in the App
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_FEATURES.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={15} className="text-primary" />
                </div>
                <div>
                  <p className="font-display font-700 text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
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
              How to Install the APK
            </h2>
            <p className="text-gray-500">
              Android blocks unknown apps by default for security. Follow these steps to install safely.
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
              <p className="font-700 text-primary mb-1 text-sm">Is this safe to install?</p>
              <p className="text-primary/80 text-xs leading-relaxed">
                Yes. The Zolarux APK is built and distributed directly by Zolarux Limited.
                We recommend only downloading from this official page (zolarux.com.ng/downloads)
                to avoid tampered versions. The app does not request unnecessary permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* iOS note */}
      <section className="py-10 bg-surface border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Looking for iOS?</p>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
            The Zolarux iOS app is currently in development. In the meantime,
            iPhone users can access all features through our website at zolarux.com.ng
            or via WhatsApp.
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