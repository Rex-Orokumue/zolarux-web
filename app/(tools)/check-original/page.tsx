import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Card } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Verify a device is genuine',
  description:
    "How to confirm a phone or laptop is genuine — find the serial or IMEI, check it on the manufacturer's own site, and spot the signs of a clone.",
}

const STEPS = [
  {
    n: 1,
    title: 'Find the serial / IMEI',
    body: 'On a phone: Settings → About, or dial *#06#. On a laptop: the sticker underneath, or the BIOS/About screen.',
  },
  {
    n: 2,
    title: "Check it on the maker's own site",
    body: "Use the official checker (links below). Only the manufacturer's database is proof.",
  },
  {
    n: 3,
    title: 'Confirm the details match',
    body: 'Model, storage, colour and warranty status should match the listing. It should not show as lost or stolen.',
  },
]

// DRAFT — confirm this list.
const CHECKERS = [
  { name: 'Apple', url: 'https://checkcoverage.apple.com/' },
  { name: 'Samsung', url: 'https://www.samsung.com/us/support/warranty/' },
  { name: 'Google Pixel', url: 'https://store.google.com/us/repair' },
  { name: 'Xiaomi', url: 'https://buy.mi.com/global/verify' },
  { name: 'Dell', url: 'https://www.dell.com/support/home/en-us' },
  { name: 'HP', url: 'https://support.hp.com/us-en/checkwarranty' },
]

// DRAFT — confirm.
const CLONE_FLAGS = [
  'Serial on the device does not match the box or the About screen',
  'Sluggish, laggy interface on a "flagship" phone',
  'Wrong or missing app store; pre-installed apps you have never heard of',
  'Low-resolution logo, off-centre buttons, cheap-feeling casing',
  'Seller cannot or will not show you the serial',
]

export default function CheckOriginalPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="Safety tools"
        title="Verify a device is genuine"
        lede="Clones can look identical. The only real proof is the manufacturer's own database — here's how to check it yourself."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">How to check</h2>
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary-soft font-display text-sm font-bold text-primary">
                  {s.n}
                </span>
                <div>
                  <p className="font-display text-base font-bold text-ink">{s.title}</p>
                  <p className="font-body text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">Official checkers</h2>
          <p className="mb-6 font-body text-sm text-ink-soft">Draft list — confirm the correct URLs.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHECKERS.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3 font-body text-sm font-medium text-ink transition-micro hover:border-primary/40"
              >
                {c.name}
                <ExternalLink size={14} className="text-ink-soft" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">Signs of a clone</h2>
          <Card>
            <ul className="space-y-3 p-6">
              {CLONE_FLAGS.map((f) => (
                <li key={f} className="flex gap-3 font-body text-sm text-ink-soft">
                  <Check size={16} className="mt-0.5 shrink-0 text-danger" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-8 font-body text-sm text-ink-soft">
            Every Zolarux unit has already passed this check —{' '}
            <Link href="/how-it-works" className="font-semibold text-primary hover:underline">
              see how we inspect
            </Link>
            .
          </p>
          <div className="mt-6">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:gap-3"
            >
              Shop verified gadgets <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
