'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scan, ExternalLink, AlertTriangle, CheckCircle, Shield, ChevronDown, ArrowRight, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRAND_LINKS = [
  { brand: 'Apple',   logo: '🍎', url: 'https://checkcoverage.apple.com',                         desc: 'Check iPhone/iPad serial number' },
  { brand: 'Samsung', logo: '📱', url: 'https://www.samsung.com/us/support/warranty',             desc: 'Samsung warranty & device check' },
  { brand: 'Dell',    logo: '💻', url: 'https://www.dell.com/support/home',                       desc: 'Dell service tag lookup' },
  { brand: 'HP',      logo: '🖥️', url: 'https://support.hp.com/us-en/checkwarranty',             desc: 'HP warranty & product check' },
  { brand: 'Lenovo',  logo: '💻', url: 'https://pcsupport.lenovo.com/warrantycheck',              desc: 'Lenovo warranty lookup' },
  { brand: 'Asus',    logo: '💻', url: 'https://www.asus.com/support/warranty-inquiry',           desc: 'Asus warranty status' },
  { brand: 'Xiaomi',  logo: '📱', url: 'https://www.mi.com/global/service/support',               desc: 'Xiaomi product verification' },
  { brand: 'Tecno',   logo: '📱', url: 'https://www.tecno-mobile.com/support',                    desc: 'Tecno support & warranty' },
  { brand: 'Infinix', logo: '📱', url: 'https://www.infinixmobility.com/support',                 desc: 'Infinix product support' },
]

const MANUAL_CHECKS = [
  {
    title: 'Check the Serial Number Online',
    steps: [
      "Go to the manufacturer's official website (links below).",
      'Find the "Check Coverage", "Warranty Check", or "Device Verification" section.',
      'Enter the serial number exactly as shown on the device.',
      'A genuine device will return warranty and purchase information.',
      'A clone or fake will show "not recognised" or return an error.',
    ],
    warning: 'High-quality clones sometimes use copied serial numbers from real devices. A passing serial check alone is not sufficient — combine with the physical checks below.',
    links: [],
  },
  {
    title: 'Battery Cycle Count (Laptops)',
    steps: [
      'On Windows: open PowerShell and run powercfg /batteryreport — check "Cycle Count".',
      'On Mac: hold Option → Apple menu → System Information → Power → Cycle Count.',
      'A brand new laptop should have 0–5 battery cycles.',
      'Anything above 20 cycles on a "new" laptop is a red flag.',
      'High cycle counts (100+) indicate heavy previous use.',
    ],
    warning: 'Some vendors reset battery cycle counters on refurbished laptops. Cross-reference with the manufacture date in the serial number lookup.',
  },
  {
    title: 'BIOS / Firmware Check (Laptops)',
    steps: [
      'Restart the laptop and press F2, F10, or Delete during startup (varies by brand).',
      'Enter the BIOS menu and check the "System Information" section.',
      'The serial number shown here should match the sticker on the bottom.',
      'If they do not match, the motherboard may have been replaced.',
      'Check the BIOS version and manufacture date — these cannot easily be faked.',
    ],
    warning: 'A mismatched BIOS serial vs physical serial strongly indicates the laptop has been repaired with a different motherboard.',
  },
  {
    title: 'Screen Authenticity (iPhones)',
    steps: [
      'Go to Settings → General → About on the iPhone.',
      'Scroll down to "Parts and Service History".',
      'Genuine display will show "Unknown Part" only if screen was replaced.',
      'Check display resolution: iPhone 13 is 2532 × 1170. A clone will show different numbers.',
      'Clone screens often have slightly yellow tints or lower brightness at maximum settings.',
    ],
    warning: 'iPhones with replaced screens by non-Apple service centres will show a warning in Settings. This is not necessarily a scam — but the price should reflect it.',
  },
  {
    title: 'Physical Inspection Checklist',
    steps: [
      'Weight: genuine devices are heavier than clones (clones use cheaper materials).',
      'Build quality: check for uneven gaps, rough edges, or plastic that feels hollow.',
      'Logo: Apple logos should be smooth metal flush with the back, not painted.',
      'Ports: USB-C and Lightning ports on clones are often slightly misaligned.',
      'Camera bump: genuine camera bumps are precision machined — clones have visible seams.',
    ],
    warning: 'High-quality clones can pass casual inspection. Always combine physical checks with software verification.',
  },
  {
    title: 'AnTuTu / CPU Benchmark Test',
    steps: [
      'Download AnTuTu Benchmark from the official app store.',
      'Run the full benchmark — takes about 5 minutes.',
      'A genuine iPhone 14 should score approximately 900,000+.',
      'A genuine Samsung S23 should score approximately 1,200,000+.',
      'Clone phones running MediaTek chips will score 100,000–300,000 at most.',
    ],
    warning: 'Some vendors will refuse to let you run benchmark tests before purchase. That refusal itself is a red flag.',
  },
]

function CheckItem({ title, steps, warning, links }: {
  title: string; steps: string[]; warning: string; links?: { label: string; url: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-surface transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Scan size={15} className="text-primary" />
          </div>
          <span className="font-display font-700 text-gray-900">{title}</span>
        </div>
        <ChevronDown size={16} className={cn('text-gray-400 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <ol className="mt-4 space-y-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-700 flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">{warning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckOriginalPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-green-700 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scan size={26} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">Verify If a Gadget is Original</h1>
          <p className="text-white/75 text-lg">
            Nigeria&apos;s gadget market is flooded with clones, refurbished items sold as new, and screen replacements passed off as genuine. Use these checks before paying anything.
          </p>
        </div>
      </section>

      {/* Clone warning */}
      <div className="bg-amber-50 border-b border-amber-200 py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Warning about copied serial numbers:</strong> High-quality clones often copy serial numbers from genuine devices. A serial number search alone may show as &ldquo;genuine&rdquo; when the device is not. Always combine multiple checks.
            </p>
          </div>
        </div>
      </div>

      {/* Official manufacturer links */}
      <section className="py-12 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">
            Verify Directly on the Manufacturer&apos;s Website
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            The most reliable way to verify any device is to check with the brand directly.
            Tap a brand below to go straight to their official verification page.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BRAND_LINKS.map(({ brand, logo, url, desc }) => (
              <a
                key={brand}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card hover:border-primary hover:shadow-card-hover transition-all group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{logo}</span>
                    <span className="font-display font-700 text-gray-900 text-sm group-hover:text-primary transition-colors">{brand}</span>
                  </div>
                  <ExternalLink size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </a>
            ))}
          </div>
          <p className="text-gray-400 text-xs text-center mt-4">
            These links open official brand websites in a new tab. Zolarux is not affiliated with these brands.
          </p>
        </div>
      </section>

      {/* Manual checks */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">Six Checks to Verify Any Gadget Yourself</h2>
          <p className="text-gray-500 text-sm mb-6">Tap each method to see the full step-by-step instructions.</p>
          <div className="space-y-3">
            {MANUAL_CHECKS.map((check) => (
              <CheckItem key={check.title} {...check} />
            ))}
          </div>

          {/* Summary checklist */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-600" />
              <h3 className="font-display font-700 text-green-800">Quick Verification Checklist</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Serial number verified on manufacturer website',
                'BIOS/firmware serial matches physical sticker',
                'Battery cycle count appropriate for condition',
                'Benchmark score matches expected performance',
                'Physical build quality passes inspection',
                'No screen replacement warning in device settings',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Link to check device */}
      <section className="py-10 bg-surface border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-red-600" />
              </div>
              <div>
                <p className="font-display font-700 text-gray-900">Also check if it&apos;s stolen</p>
                <p className="text-gray-500 text-sm">Verify the IMEI against our national stolen device registry.</p>
              </div>
            </div>
            <Link href="/check-device" className="shrink-0 inline-flex items-center gap-2 bg-red-600 text-white font-700 px-5 py-3 rounded-xl hover:bg-red-700 transition-all text-sm">
              Check Stolen Status <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Safe buy CTA */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Shield size={24} className="text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-800 text-gray-900 mb-2">Skip the Stress. Buy Through Zolarux.</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-lg mx-auto">
            Every gadget on Zolarux has already passed these checks before listing. We do the verification so you do not have to.
          </p>
          <Link href="/listings" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all">
            Browse Pre-Verified Listings <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}