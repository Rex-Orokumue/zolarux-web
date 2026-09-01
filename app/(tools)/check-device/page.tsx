'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Card, Input, Button, Accordion } from '@/components/ui'
import { formatDate, buildWhatsAppUrl } from '@/lib/utils'
import { checkDevice, type DeviceCheckResult } from '@/lib/safety'

// DRAFT — confirm wording.
const RED_FLAGS = [
  'The price is far below the going rate — a "clean" flagship for a third of retail is bait.',
  'The seller will not give you the IMEI before you pay.',
  'The IMEI sticker on the device looks scratched or tampered with.',
  '"UK used" but the battery shows zero charge cycles — a used phone cannot.',
  'The seller wants to meet somewhere untraceable, in a hurry.',
  'No original box, no receipt, no charger, and a story for each.',
]

const FAQ = [
  {
    value: 'q1',
    trigger: 'Does a clean result mean the device is definitely not stolen?',
    content:
      'No. It means this device has not been reported to Zolarux. It could be reported to the police or another registry. Combine this with the originality check and buy from Zolarux for full cover.',
  },
  {
    value: 'q2',
    trigger: 'Is this a police database?',
    content:
      "No. This is Zolarux's own registry, built from reports submitted by theft victims in Nigeria. We are not a law-enforcement agency.",
  },
  {
    value: 'q3',
    trigger: 'What if the check shows the device is stolen?',
    content:
      'Do not buy it. Do not pay anything. If you already bought it, stop using it, keep all evidence, message us on WhatsApp and file a police report — do not confront the seller yourself.',
  },
]

const RESULT_META = {
  stolen: {
    Icon: ShieldX,
    ring: 'border-danger/40 bg-danger/10',
    accent: 'text-danger',
    head: 'This device is in our stolen registry',
  },
  reported: {
    Icon: ShieldAlert,
    ring: 'border-action/40 bg-action/10',
    accent: 'text-action',
    head: 'This device has been reported stolen',
  },
  clean: {
    Icon: ShieldCheck,
    ring: 'border-verified/40 bg-verified/10',
    accent: 'text-verified',
    head: 'Not in our registry',
  },
  error: { Icon: Info, ring: 'border-line bg-surface', accent: 'text-ink-soft', head: 'Something went wrong' },
} as const

export default function CheckDevicePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DeviceCheckResult | null>(null)

  const run = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    const r = await checkDevice(query)
    setResult(r)
    setLoading(false)
  }

  return (
    <div className="bg-background">
      <PageHeader
        tone="danger"
        eyebrow="Safety tools"
        title="Check if a device is stolen"
        lede="Buying a used phone or laptop? Check the IMEI or serial against our stolen-device registry before you pay a naira."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <form onSubmit={(e) => { e.preventDefault(); run() }} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter IMEI or serial number"
              aria-label="IMEI or serial number"
              className="flex-1"
            />
            <Button type="submit" loading={loading}>
              <Search size={16} />
              Check
            </Button>
          </form>

          {result && result.status === 'invalid' && (
            <p className="mt-4 font-body text-sm text-danger">
              That doesn&apos;t look like an IMEI or serial number. IMEIs are 15 digits; dial *#06# to
              find yours.
            </p>
          )}

          {result && result.status !== 'invalid' && (
            <div className={`mt-6 rounded-lg border p-6 ${RESULT_META[result.status].ring}`}>
              {(() => {
                const M = RESULT_META[result.status]
                return (
                  <>
                    <div className={`mb-2 flex items-center gap-2 ${M.accent}`}>
                      <M.Icon size={20} />
                      <p className="font-display text-base font-bold">{M.head}</p>
                    </div>
                    {result.status === 'stolen' || result.status === 'reported' ? (
                      <>
                        <p className="font-body text-sm text-ink-soft">
                          {result.status === 'stolen'
                            ? 'Do not buy this device. Do not pay anything.'
                            : 'A report exists and is under review. Treat with caution — ask us before you buy.'}
                        </p>
                        {result.record && (
                          <dl className="mt-3 space-y-1 font-body text-sm text-ink-soft">
                            {result.record.item_name && (
                              <div>
                                <dt className="inline font-semibold text-ink">Device: </dt>
                                {result.record.item_name}
                              </div>
                            )}
                            {result.record.location_stolen && (
                              <div>
                                <dt className="inline font-semibold text-ink">Reported from: </dt>
                                {result.record.location_stolen}
                              </div>
                            )}
                            {result.record.date_stolen && (
                              <div>
                                <dt className="inline font-semibold text-ink">Stolen on: </dt>
                                {formatDate(result.record.date_stolen)}
                              </div>
                            )}
                            <div>
                              <dt className="inline font-semibold text-ink">Logged: </dt>
                              {formatDate(result.record.created_at)}
                            </div>
                          </dl>
                        )}
                        <a
                          href={buildWhatsAppUrl(
                            `Hi Zolarux, I checked a device (${query.trim()}) and it came back as ${result.status}. What should I do?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block font-body text-sm font-semibold text-primary hover:underline"
                        >
                          Message us about this
                        </a>
                      </>
                    ) : result.status === 'clean' ? (
                      <p className="font-body text-sm text-ink-soft">
                        This isn&apos;t a guarantee — it may be reported elsewhere. Combine it with the{' '}
                        <Link href="/check-original" className="font-semibold text-primary hover:underline">
                          originality check
                        </Link>
                        , and for full cover, buy from Zolarux — guaranteed or refunded.
                      </p>
                    ) : (
                      <p className="font-body text-sm text-ink-soft">
                        Couldn&apos;t reach the registry. Try again in a moment, or{' '}
                        <a
                          href={buildWhatsAppUrl('Hi Zolarux, the device checker is not working for me.')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          message us
                        </a>
                        .
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            6 signs a used phone is stolen
          </h2>
          <Card>
            <ul className="space-y-3 p-6">
              {RED_FLAGS.map((f) => (
                <li key={f} className="flex gap-3 font-body text-sm text-ink-soft">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0 text-action" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">Questions</h2>
          <Accordion type="single" items={FAQ} />
        </div>
      </section>
    </div>
  )
}
