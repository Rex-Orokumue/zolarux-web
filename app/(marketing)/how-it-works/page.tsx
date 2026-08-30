import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { GuaranteeSteps } from '@/components/marketing/GuaranteeSteps'
import { Card, Reveal, Button } from '@/components/ui'

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How buying from Zolarux works: we source and inspect every unit, you see the real thing, you order on WhatsApp, and you inspect it on delivery — guaranteed or refunded.',
}

// DRAFT — confirm the real inspection checklist with the user.
const INSPECTION = [
  'Powers on and every function works — camera, speakers, mic, ports, buttons',
  'Battery health checked and stated (phones and laptops)',
  'IMEI / serial number checked and clean — no blacklist, no activation lock',
  'Screen and body graded honestly, with photos of any marks',
  'Charger and accessories confirmed — we tell you exactly what is in the box',
]

// DRAFT — confirm the grade definitions.
const GRADES = [
  { label: 'New', body: 'Sealed or genuinely unused. Full manufacturer condition.' },
  {
    label: 'UK Used',
    body: 'Pre-owned abroad, typically light use, clean cosmetics. We state any marks.',
  },
  {
    label: 'Refurbished',
    body: 'Restored to full working order. Some parts may have been replaced — we say which.',
  },
  {
    label: 'Used',
    body: 'Local pre-owned. Fully working, more visible wear. Priced accordingly.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="How it works"
        title="How buying from Zolarux works"
        lede="No cart, no surprises. Here is every step between you finding something and you being happy with it."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <GuaranteeSteps />
          </Reveal>
        </div>
      </section>

      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="mb-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                What &ldquo;inspected&rdquo; actually means
              </h2>
              <p className="font-body text-ink-soft">
                Every unit goes through the same checks before it is listed or shipped.
              </p>
            </div>
            <Card>
              <ul className="space-y-3 p-6">
                {INSPECTION.map((item) => (
                  <li key={item} className="flex gap-3 font-body text-sm text-ink-soft">
                    <Check size={16} className="mt-0.5 shrink-0 text-verified" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Condition grades, in plain terms
          </h2>
          <dl className="divide-y divide-line overflow-hidden rounded-md border border-line">
            {GRADES.map((g) => (
              <div key={g.label} className="grid gap-1 p-5 sm:grid-cols-[160px_1fr] sm:gap-6">
                <dt className="font-display text-sm font-bold text-ink">{g.label}</dt>
                <dd className="font-body text-sm text-ink-soft">{g.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Ordering, delivery &amp; payment
          </h2>
          <div className="space-y-4 font-body text-sm leading-relaxed text-ink-soft">
            <p>
              <strong className="text-ink">Order on WhatsApp.</strong> Tap &ldquo;Order on
              WhatsApp&rdquo; on any product. We reply to confirm it&apos;s in stock, the exact
              condition, the final price and delivery to your area.
            </p>
            {/* DRAFT: list the real payment methods */}
            <p>
              <strong className="text-ink">Pay.</strong> Bank transfer once you&apos;re happy with
              the details.
            </p>
            {/* DRAFT: confirm delivery timeframe + cost */}
            <p>
              <strong className="text-ink">We dispatch.</strong> Your inspected unit ships the
              same or next day. Delivery is nationwide — Lagos, Abuja, Port Harcourt and beyond —
              and usually takes 1&ndash;5 business days.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            If it&apos;s not right — the refund process
          </h2>
          {/* DRAFT: confirm the refund window and who pays return shipping */}
          <ol className="space-y-3 font-body text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">1. Inspect it on delivery.</strong> Check it fully
              before you pay the delivery rider, or right after it arrives.
            </li>
            <li>
              <strong className="text-ink">2. Tell us within 48 hours.</strong> Message us on
              WhatsApp with what&apos;s wrong and a photo or video.
            </li>
            <li>
              <strong className="text-ink">3. Send it back.</strong> We arrange the return.
            </li>
            <li>
              <strong className="text-ink">4. Full refund.</strong> You get back everything you
              paid, to the account you paid from.
            </li>
          </ol>
          <p className="mt-6 font-body text-sm text-ink-soft">
            Questions?{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-primary py-16 text-on-primary sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Ready to shop?</h2>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings">
                Browse gadgets <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
