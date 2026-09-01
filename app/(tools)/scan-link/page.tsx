'use client'

import { useState } from 'react'
import { Search, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Input, Button } from '@/components/ui'
import { ProductCard } from '@/components/ui/ProductCard'
import { scanLink, type ScanOk } from '@/lib/safety'

const VERDICT = {
  safe: {
    Icon: ShieldCheck,
    label: 'Looks ok',
    ring: 'border-verified/40 bg-verified/10',
    accent: 'text-verified',
    bar: 'bg-verified',
  },
  caution: {
    Icon: ShieldAlert,
    label: 'Be careful',
    ring: 'border-action/40 bg-action/10',
    accent: 'text-action',
    bar: 'bg-action',
  },
  danger: {
    Icon: ShieldX,
    label: 'High risk',
    ring: 'border-danger/40 bg-danger/10',
    accent: 'text-danger',
    bar: 'bg-danger',
  },
} as const

export default function ScanLinkPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanOk | null>(null)
  const [error, setError] = useState('')

  const run = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    const r = await scanLink(url.trim())
    setLoading(false)
    if ('error' in r) setError(r.error)
    else setResult(r)
  }

  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="Safety tools"
        title="Scan a listing link"
        lede="Paste a product link from Jiji, Instagram, WhatsApp or anywhere. We check it for the signs of a scam."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <form onSubmit={(e) => { e.preventDefault(); run() }} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              aria-label="Listing URL"
              className="flex-1"
            />
            <Button type="submit" loading={loading}>
              <Search size={16} />
              Scan
            </Button>
          </form>

          {error && <p className="mt-4 font-body text-sm text-danger">{error}</p>}

          {result && (
            <>
              <div className={`mt-6 rounded-lg border p-6 ${VERDICT[result.riskLevel].ring}`}>
                {(() => {
                  const V = VERDICT[result.riskLevel]
                  return (
                    <>
                      <div className={`mb-3 flex items-center gap-2 ${V.accent}`}>
                        <V.Icon size={20} />
                        <p className="font-display text-base font-bold">{V.label}</p>
                        <span className="ml-auto font-body text-sm text-ink-soft">
                          Risk {result.riskScore}/100
                        </span>
                      </div>
                      <span className="block h-2 overflow-hidden rounded-pill bg-line">
                        <span
                          className={`block h-full rounded-pill ${V.bar}`}
                          style={{ width: `${result.riskScore}%` }}
                        />
                      </span>
                      <p className="mt-3 font-body text-sm text-ink-soft">{result.summary}</p>
                    </>
                  )
                })()}
              </div>

              {result.flags.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-display text-sm font-bold text-ink">Red flags</p>
                  <ul className="space-y-1.5">
                    {result.flags.map((f) => (
                      <li key={f} className="flex gap-2 font-body text-sm text-ink-soft">
                        <ShieldAlert size={14} className="mt-0.5 shrink-0 text-danger" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.positives.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-display text-sm font-bold text-ink">Good signs</p>
                  <ul className="space-y-1.5">
                    {result.positives.map((p) => (
                      <li key={p} className="flex gap-2 font-body text-sm text-ink-soft">
                        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-verified" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.similarProducts.length > 0 && (
                <div className="mt-8">
                  <p className="mb-4 font-display text-lg font-extrabold text-ink">
                    Buy it from Zolarux instead
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {result.similarProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
