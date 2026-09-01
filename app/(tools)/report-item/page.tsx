'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Card, Field, Input, Textarea, Select, Button } from '@/components/ui'
import { buildWhatsAppUrl } from '@/lib/utils'
import { submitStolenReport } from '@/lib/safety'

const DEVICE_TYPES = [
  { value: 'Phone', label: 'Phone' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Other', label: 'Other' },
]

export default function ReportItemPage() {
  const [deviceType, setDeviceType] = useState(DEVICE_TYPES[0].value)
  const [model, setModel] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [dateStolen, setDateStolen] = useState('')
  const [location, setLocation] = useState('')
  const [policeRef, setPoliceRef] = useState('')
  const [contact, setContact] = useState('')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const next: Record<string, string> = {}
    if (!model.trim()) next.model = 'Enter the make and model'
    if (!identifier.trim()) next.identifier = 'Enter the IMEI or serial number'
    if (!contact.trim()) next.contact = 'Enter a way to reach you'
    const id = identifier.trim().replace(/[^a-zA-Z0-9]/g, '')
    if (identifier.trim() && (id.length < 5 || id.length > 20)) {
      next.identifier = "That doesn't look like a valid IMEI or serial number"
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const isImei = /^\d{14,16}$/.test(id)
    setLoading(true)
    const res = await submitStolenReport({
      item_name: `${deviceType} — ${model.trim()}`,
      imei: isImei ? id : undefined,
      serial_number: isImei ? undefined : id,
      date_stolen: dateStolen || undefined,
      location_stolen: location || undefined,
      police_report_ref: policeRef || undefined,
      owner_contact: contact,
      description: details || undefined,
    })
    setLoading(false)
    if (res.ok) setDone(true)
    else setFormError(res.error)
  }

  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="Safety tools"
        title="Report a stolen device"
        lede="Add a stolen phone or laptop to our registry so buyers are warned before they pay for it."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6 flex gap-3 rounded-md border border-line bg-surface p-4">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-action" />
            <p className="font-body text-sm text-ink-soft">
              This is Zolarux&apos;s own registry, not the police. Please still file a police report —
              you&apos;ll need it to blacklist the IMEI with the networks.
            </p>
          </div>

          {done ? (
            <Card>
              <div className="p-8 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-3 text-verified" />
                <h2 className="font-display text-xl font-extrabold text-ink">Report received</h2>
                {/* DRAFT: confirm the review window */}
                <p className="mx-auto mt-2 max-w-sm font-body text-sm text-ink-soft">
                  Our team reviews reports within 24 hours. Confirmed ones are added to the public
                  registry, and anyone who checks that IMEI or serial will see a warning.
                </p>
                <div className="mt-6">
                  <Link
                    href="/check-device"
                    className="font-body text-sm font-semibold text-primary hover:underline"
                  >
                    Check a device
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <form onSubmit={submit} className="space-y-4 p-6">
                <Field label="Device type" htmlFor="r-type">
                  <Select
                    aria-label="Device type"
                    value={deviceType}
                    onValueChange={setDeviceType}
                    options={DEVICE_TYPES}
                  />
                </Field>
                <Field label="Make & model" htmlFor="r-model" error={errors.model}>
                  <Input
                    id="r-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    invalid={!!errors.model}
                    placeholder="iPhone 14 Pro"
                  />
                </Field>
                <Field
                  label="IMEI or serial number"
                  htmlFor="r-id"
                  error={errors.identifier}
                  hint="Dial *#06# on a phone to find the IMEI."
                >
                  <Input
                    id="r-id"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    invalid={!!errors.identifier}
                    placeholder="352130213565996"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="When was it stolen?" htmlFor="r-date">
                    <Input
                      id="r-date"
                      type="date"
                      value={dateStolen}
                      onChange={(e) => setDateStolen(e.target.value)}
                    />
                  </Field>
                  <Field label="Where?" htmlFor="r-loc">
                    <Input
                      id="r-loc"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Port Harcourt"
                    />
                  </Field>
                </div>
                <Field label="Police report reference" htmlFor="r-police" hint="Optional">
                  <Input id="r-police" value={policeRef} onChange={(e) => setPoliceRef(e.target.value)} />
                </Field>
                <Field label="How can we reach you?" htmlFor="r-contact" error={errors.contact}>
                  <Input
                    id="r-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    invalid={!!errors.contact}
                    placeholder="Name — 08012345678"
                  />
                </Field>
                <Field label="Anything else" htmlFor="r-details">
                  <Textarea
                    id="r-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Colour, storage, distinguishing marks…"
                  />
                </Field>
                {formError && (
                  <p className="font-body text-sm text-danger">
                    {formError}{' '}
                    <a
                      href={buildWhatsAppUrl('Hi Zolarux, I want to report a stolen device.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Message us instead
                    </a>
                  </p>
                )}
                <Button type="submit" className="w-full" loading={loading}>
                  Submit report
                </Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
