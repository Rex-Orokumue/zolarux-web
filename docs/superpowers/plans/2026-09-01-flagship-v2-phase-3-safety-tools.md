# Flagship v2 — Phase 3 (Safety Tools) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship four safety tools — stolen-device IMEI check (wired), originality guide, stolen-device report form (wired), link scanner (wired) — on the Phase 0 kit, discoverable from a "Safety tools" nav dropdown; delete the orphaned `check-vendor` and the last of the compat shim.

**Architecture:** Four pages under `app/(tools)/`, each with `PageHeader`. Three touch data: `check-device` and `report-item` via the anon browser Supabase client through a thin `lib/safety.ts`; `scan-link` via a new `app/api/scan-link/route.ts` (rule-based analysis, SSRF-guarded, no external key). `check-original` is static content.

**Tech Stack:** Next.js 16.2.6 (App Router, RSC + route handler), React 19.2, Tailwind v4, Radix + CVA, `lucide-react`, `@supabase/ssr`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-31-flagship-v2-phase-3-safety-tools-design.md` — read it first.

## Global Constraints

- **Branch:** `flagship-v2` (Phase 2 done, tip `3f9f987`). Never touch `main` / `flagship-redesign`.
- **Narrative:** single trusted retailer. No "vendor", no "escrow / protection fee". `main`'s tool copy is full of both — **reframe every string**: "buy through Zolarux escrow" → "buy from Zolarux", "verified vendor" → "us", keep "guaranteed or refunded". Contact channel = WhatsApp (`buildWhatsAppUrl`, `WHATSAPP_NUMBER = '2347063107314'`).
- **Content is draft** where guessed — visible "Draft — confirm" notes or `{/* DRAFT */}` comments. Facts to reuse: 5 yrs, ₦2M+ orders, 0 confirmed scams, nationwide, gadgets only.
- **Supabase (`ugieujaerhfqomvhqoie`), RLS verified 2026-08-31:** anon `SELECT` on `stolen_registry` (0 rows), `stolen_reports` (1 real row IMEI `352130213565996` "iPhone 14 Pro" + 1 junk row `f7c56f5a…` the user must delete), `flagged_entities` (unused). Anon `INSERT` on `stolen_reports` → 201. Anon `INSERT` on `stolen_registry` → 401.
- **Next 16** (`AGENTS.md`): read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` before writing `app/api/scan-link/route.ts`; `03-layouts-and-pages.md` for the pages.
- **Lint rule:** no `setState` synchronously in an effect. The tool pages use event handlers — fine.
- **Motion:** Phase 0 system — `Reveal` on sections, `transition-micro` on result panels, `Button` `loading` / `Skeleton` for pending. Reduced-motion respected (global guard).
- **No test runner.** "Verify" = the Standard Verification Cycle below.
- **Out of scope:** `/safety` landing page · Grok wiring (env-gated stub only) · rate-limiting (drop `main`'s `@/lib/rate-limit` import — that module doesn't exist here) · `stolen_reports`→`stolen_registry` promotion · `flagged_entities` · Download App / Blog / legal · Phase 0–2 surfaces beyond Navbar/Footer.
- **Commits** end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Conventional prefixes. `@/` → repo root.

### Standard Verification Cycle

End of every task:

```bash
npx tsc --noEmit          # no errors
npm run lint              # no new errors (pre-existing <img>/unused-var warnings tolerated)
npm run build             # succeeds
```

Then `npm run dev` + `curl -s http://localhost:3000/<route> | grep -oE "<distinctive strings>"` — 200, real content, no "vendor"/"escrow" leak. Dark-mode + mobile eyeball is a human step (Chrome screenshot tool intermittent) — note, don't block.

---

## File Structure

**Created:**
- `lib/safety.ts` — `submitStolenReport`, `checkDevice`, `scanLink` (client-safe).
- `app/(tools)/check-original/page.tsx`
- `app/(tools)/report-item/page.tsx`
- `app/(tools)/check-device/page.tsx`
- `app/(tools)/scan-link/page.tsx`
- `app/api/scan-link/route.ts`

**Modified:**
- `lib/constants.ts` — add `SAFETY_TOOLS`; delete `VENDOR_STATUS_MAP` (Task 7).
- `components/marketing/PageHeader.tsx` — add `tone?: 'primary' | 'danger'`.
- `components/layout/Navbar.tsx` — "Safety tools" dropdown (desktop + Sheet).
- `components/layout/Footer.tsx` — "Safety" column.
- `app/globals.css` — remove `@utility font-700/800/shadow-card/shadow-card-hover` (Task 7).

**Deleted:**
- `app/(tools)/check-vendor/` (Task 7).

---

## Task 1: `SAFETY_TOOLS` constant + PageHeader `tone` + Navbar dropdown + Footer column

**Files:** Modify `lib/constants.ts`, `components/marketing/PageHeader.tsx`, `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`.

**Interfaces produced:**
- `SAFETY_TOOLS` (`@/lib/constants`) — `readonly { label: string; href: string; icon: 'smartphone' | 'scan-search' | 'flag' | 'link'; desc: string }[]`.
- `PageHeader` — now `{ eyebrow?: string; title: string; lede?: string; tone?: 'primary' | 'danger' }` (`tone` default `'primary'`; `'danger'` swaps `bg-primary`→`bg-danger`).

- [ ] **Step 1: `lib/constants.ts` — add `SAFETY_TOOLS`** (after `HELP_LINKS`)

```ts
export const SAFETY_TOOLS = [
  { label: 'Check a device',       href: '/check-device',   icon: 'smartphone',  desc: 'Is this used phone stolen? Check the IMEI.' },
  { label: "Verify it's genuine",  href: '/check-original', icon: 'scan-search', desc: "Confirm a serial number on the maker's own site." },
  { label: 'Report a stolen device', href: '/report-item',  icon: 'flag',        desc: 'Add a stolen phone or laptop to the registry.' },
  { label: 'Scan a link',          href: '/scan-link',      icon: 'link',        desc: 'Paste a listing link — we check it for scam signs.' },
] as const
```

- [ ] **Step 2: `components/marketing/PageHeader.tsx` — add `tone`**

```tsx
import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  lede,
  tone = 'primary',
}: {
  eyebrow?: string
  title: string
  lede?: string
  tone?: 'primary' | 'danger'
}) {
  return (
    <section
      className={cn(
        'py-16 text-on-primary sm:py-20',
        tone === 'danger' ? 'bg-danger' : 'bg-primary'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-on-primary/70">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {title}
          </h1>
          {lede && (
            <p className="mt-4 font-body text-lg leading-relaxed text-on-primary/80">{lede}</p>
          )}
        </div>
      </div>
    </section>
  )
}
```

> `text-on-primary` on a `bg-danger` band: `--color-on-primary` is white (light) / near-black (dark). `--color-danger` is `#D64545` (light) / `#F87171` (dark). White-on-`#D64545` passes AA; near-black-on-`#F87171` passes AA. OK. If a review finds the dark case weak, hardcode `text-white` for the `danger` tone.

- [ ] **Step 3: `components/layout/Navbar.tsx` — add the "Safety tools" dropdown**

Add `SAFETY_TOOLS` to the `@/lib/constants` import and `Smartphone, ScanSearch, Flag, Link2` to the `lucide-react` import. Add an icon map near the top of the module:

```tsx
const TOOL_ICON = { smartphone: Smartphone, 'scan-search': ScanSearch, flag: Flag, link: Link2 } as const
```

In the desktop `<nav>`, after the existing `NAV_LINKS.map(...)`, add a second dropdown mirroring the "Shop" one:

```tsx
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-md px-3.5 py-2 font-body text-sm font-medium text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Safety tools <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-72">
              {SAFETY_TOOLS.map((tool) => {
                const Icon = TOOL_ICON[tool.icon]
                return (
                  <DropdownMenuItem key={tool.href}>
                    <Link href={tool.href} className="flex w-full items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                        <Icon size={14} />
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{tool.label}</span>
                        <span className="block font-body text-xs text-ink-soft">{tool.desc}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
```

In the mobile `Sheet`, after the "More" group, add:

```tsx
                <p className="px-1 pt-4 font-body text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Safety tools
                </p>
                {SAFETY_TOOLS.map((tool) => (
                  <SheetClose asChild key={tool.href}>
                    <Link href={tool.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {tool.label}
                    </Link>
                  </SheetClose>
                ))}
```

- [ ] **Step 4: `components/layout/Footer.tsx` — add the "Safety" column**

Add `SAFETY_TOOLS` to the `@/lib/constants` import. Change the grid:

```tsx
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
```

After the "Help" column add:

```tsx
        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Safety</h4>
          <ul className="space-y-2.5">
            {SAFETY_TOOLS.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
                >
                  {tool.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
```

- [ ] **Step 5: Verify** — `tsc`/`lint`/`build` clean. `/` shows a "Safety tools" nav item (targets 404 until Tasks 2–6) and a Footer "Safety" column. Footer wraps sanely on `sm`/mobile.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(phase-3): SAFETY_TOOLS constant + nav dropdown + Footer column + PageHeader tone

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `/check-original` — verification guide

**Files:** Create `app/(tools)/check-original/page.tsx`.

**Interfaces:** consumes `PageHeader`, `Card`, `Reveal`, `Link`, `lucide-react`. Produces `CheckOriginalPage` (server component) + `metadata`.

- [ ] **Step 1: Create `app/(tools)/check-original/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Card } from '@/components/ui'

export const metadata: Metadata = {
  title: "Verify a device is genuine",
  description:
    "How to confirm a phone or laptop is genuine — find the serial or IMEI, check it on the manufacturer's own site, and spot the signs of a clone.",
}

const STEPS = [
  { n: 1, title: 'Find the serial / IMEI', body: 'On a phone: Settings → About, or dial *#06#. On a laptop: the sticker underneath, or the BIOS/About screen.' },
  { n: 2, title: "Check it on the maker's own site", body: 'Use the official checker (links below). Only the manufacturer’s database is proof.' },
  { n: 3, title: 'Confirm the details match', body: 'Model, storage, colour and warranty status should match the listing. It should not show as lost or stolen.' },
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
```

- [ ] **Step 2: Verify** — `/check-original` 200; `curl | grep -oE "Verify a device is genuine|How to check|Official checkers|Signs of a clone"`. `○` static in the route table. Both themes.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(check-original): originality verification guide

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `lib/safety.ts` (report helper) + `/report-item`

**Files:** Create `lib/safety.ts`, `app/(tools)/report-item/page.tsx`.

**Interfaces produced:**
- `lib/safety.ts` — `StolenReportInput = { item_name: string; imei?: string; serial_number?: string; date_stolen?: string; location_stolen?: string; police_report_ref?: string; owner_contact: string; description?: string }`; `submitStolenReport(input: StolenReportInput): Promise<{ ok: true } | { ok: false; error: string }>` — inserts into `stolen_reports` with `status: 'pending'` via `@/lib/supabase/client`.

- [ ] **Step 1: Create `lib/safety.ts`**

```ts
import { createClient } from '@/lib/supabase/client'

export interface StolenReportInput {
  item_name: string
  imei?: string
  serial_number?: string
  date_stolen?: string
  location_stolen?: string
  police_report_ref?: string
  owner_contact: string
  description?: string
}

export async function submitStolenReport(
  input: StolenReportInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('stolen_reports').insert({
    item_name: input.item_name.trim(),
    imei: input.imei?.trim() || null,
    serial_number: input.serial_number?.trim() || null,
    date_stolen: input.date_stolen || null,
    location_stolen: input.location_stolen?.trim() || null,
    police_report_ref: input.police_report_ref?.trim() || null,
    owner_contact: input.owner_contact.trim(),
    description: input.description?.trim() || null,
    status: 'pending',
  })
  if (error) {
    console.error('submitStolenReport error:', error)
    return { ok: false, error: 'Could not submit the report. Please try again or message us on WhatsApp.' }
  }
  return { ok: true }
}
```

- [ ] **Step 2: Create `app/(tools)/report-item/page.tsx`**

```tsx
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
      next.identifier = 'That doesn’t look like a valid IMEI or serial number'
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
                  <Link href="/check-device" className="font-body text-sm font-semibold text-primary hover:underline">
                    Check a device
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <form onSubmit={submit} className="space-y-4 p-6">
                <Field label="Device type" htmlFor="r-type">
                  <Select aria-label="Device type" value={deviceType} onValueChange={setDeviceType} options={DEVICE_TYPES} />
                </Field>
                <Field label="Make & model" htmlFor="r-model" error={errors.model}>
                  <Input id="r-model" value={model} onChange={(e) => setModel(e.target.value)} invalid={!!errors.model} placeholder="iPhone 14 Pro" />
                </Field>
                <Field label="IMEI or serial number" htmlFor="r-id" error={errors.identifier} hint="Dial *#06# on a phone to find the IMEI.">
                  <Input id="r-id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} invalid={!!errors.identifier} placeholder="352130213565996" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="When was it stolen?" htmlFor="r-date">
                    <Input id="r-date" type="date" value={dateStolen} onChange={(e) => setDateStolen(e.target.value)} />
                  </Field>
                  <Field label="Where?" htmlFor="r-loc">
                    <Input id="r-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Port Harcourt" />
                  </Field>
                </div>
                <Field label="Police report reference" htmlFor="r-police" hint="Optional">
                  <Input id="r-police" value={policeRef} onChange={(e) => setPoliceRef(e.target.value)} />
                </Field>
                <Field label="How can we reach you?" htmlFor="r-contact" error={errors.contact}>
                  <Input id="r-contact" value={contact} onChange={(e) => setContact(e.target.value)} invalid={!!errors.contact} placeholder="Name — 08012345678" />
                </Field>
                <Field label="Anything else" htmlFor="r-details">
                  <Textarea id="r-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Colour, storage, distinguishing marks…" />
                </Field>
                {formError && (
                  <p className="font-body text-sm text-danger">
                    {formError}{' '}
                    <a href={buildWhatsAppUrl('Hi Zolarux, I want to report a stolen device.')} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
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
```

- [ ] **Step 3: Verify** — `tsc`/`lint`/`build` clean. `/report-item` 200. In the browser: submit with empty model/identifier/contact → inline errors; fill valid values + submit → success panel. Confirm a new `pending` row in `stolen_reports` (via curl with the anon key), then **delete that test row** (note it for the user if the anon key can't).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(report-item): stolen-device report form → registry insert

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `/check-device` — stolen-device lookup

**Files:** Create `app/(tools)/check-device/page.tsx`. Modify `lib/safety.ts` (add `checkDevice`).

**Interfaces produced:**
- `lib/safety.ts` — `DeviceCheckResult = { status: 'stolen' | 'reported' | 'clean' | 'error' | 'invalid'; record?: { item_name: string | null; imei: string | null; serial_number: string | null; date_stolen?: string | null; location_stolen?: string | null; created_at: string } }`; `checkDevice(query: string): Promise<DeviceCheckResult>`.

- [ ] **Step 1: Add `checkDevice` to `lib/safety.ts`**

```ts
export interface StolenRecord {
  item_name: string | null
  imei: string | null
  serial_number: string | null
  date_stolen?: string | null
  location_stolen?: string | null
  created_at: string
}

export interface DeviceCheckResult {
  status: 'stolen' | 'reported' | 'clean' | 'error' | 'invalid'
  record?: StolenRecord
}

export async function checkDevice(query: string): Promise<DeviceCheckResult> {
  const q = query.trim().replace(/[^a-zA-Z0-9]/g, '')
  if (q.length < 5 || q.length > 20) return { status: 'invalid' }

  const supabase = createClient()

  // 1. Confirmed registry
  const reg = await supabase
    .from('stolen_registry')
    .select('item_name, imei, serial_number, created_at')
    .or(`imei.eq.${q},serial_number.eq.${q}`)
    .limit(1)
  if (reg.error) return { status: 'error' }
  if (reg.data && reg.data.length > 0) return { status: 'stolen', record: reg.data[0] as StolenRecord }

  // 2. Pending reports
  const rep = await supabase
    .from('stolen_reports')
    .select('item_name, imei, serial_number, date_stolen, location_stolen, created_at')
    .eq('status', 'pending')
    .or(`imei.eq.${q},serial_number.eq.${q}`)
    .limit(1)
  if (rep.error) return { status: 'error' }
  if (rep.data && rep.data.length > 0) return { status: 'reported', record: rep.data[0] as StolenRecord }

  return { status: 'clean' }
}
```

> `.or(\`imei.eq.${q},serial_number.eq.${q}\`)` — `q` is already stripped to `[a-zA-Z0-9]`, so it's safe to interpolate into the PostgREST filter. Do not remove the sanitisation.

- [ ] **Step 2: Create `app/(tools)/check-device/page.tsx`**

```tsx
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
  { value: 'q1', trigger: 'Does a clean result mean the device is definitely not stolen?', content: 'No. It means this device has not been reported to Zolarux. It could be reported to the police or another registry. Combine this with the originality check and buy from Zolarux for full cover.' },
  { value: 'q2', trigger: 'Is this a police database?', content: 'No. This is Zolarux’s own registry, built from reports submitted by theft victims in Nigeria. We are not a law-enforcement agency.' },
  { value: 'q3', trigger: 'What if the check shows the device is stolen?', content: 'Do not buy it. Do not pay anything. If you already bought it, stop using it, keep all evidence, message us on WhatsApp and file a police report — do not confront the seller yourself.' },
]

const RESULT_META = {
  stolen: { Icon: ShieldX, ring: 'border-danger/40 bg-danger/10', accent: 'text-danger', head: 'This device is in our stolen registry' },
  reported: { Icon: ShieldAlert, ring: 'border-action/40 bg-action/10', accent: 'text-action', head: 'This device has been reported stolen' },
  clean: { Icon: ShieldCheck, ring: 'border-verified/40 bg-verified/10', accent: 'text-verified', head: 'Not in our registry' },
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
          <form
            onSubmit={(e) => { e.preventDefault(); run() }}
            className="flex flex-col gap-3 sm:flex-row"
          >
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
              That doesn&apos;t look like an IMEI or serial number. IMEIs are 15 digits; dial *#06# to find yours.
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
                            {result.record.item_name && <div><dt className="inline font-semibold text-ink">Device: </dt>{result.record.item_name}</div>}
                            {result.record.location_stolen && <div><dt className="inline font-semibold text-ink">Reported from: </dt>{result.record.location_stolen}</div>}
                            {result.record.date_stolen && <div><dt className="inline font-semibold text-ink">Stolen on: </dt>{formatDate(result.record.date_stolen)}</div>}
                            <div><dt className="inline font-semibold text-ink">Logged: </dt>{formatDate(result.record.created_at)}</div>
                          </dl>
                        )}
                        <a
                          href={buildWhatsAppUrl(`Hi Zolarux, I checked a device (${query.trim()}) and it came back as ${result.status}. What should I do?`)}
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
                        <Link href="/check-original" className="font-semibold text-primary hover:underline">originality check</Link>, and
                        for full cover, buy from Zolarux — guaranteed or refunded.
                      </p>
                    ) : (
                      <p className="font-body text-sm text-ink-soft">
                        Couldn&apos;t reach the registry. Try again in a moment, or{' '}
                        <a href={buildWhatsAppUrl('Hi Zolarux, the device checker is not working for me.')} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">message us</a>.
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
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">6 signs a used phone is stolen</h2>
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
```

- [ ] **Step 3: Verify** — `tsc`/`lint`/`build` clean. `/check-device` 200. In the browser: `352130213565996` → **"reported"** state with the iPhone 14 Pro details; a random 15-digit number → **"clean"**; `abc` → **"invalid"** message. The "stolen" (registry) path is structurally verified only — `stolen_registry` is empty (§15 of the spec). Both themes; the danger-tone `PageHeader` is red.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(check-device): stolen-registry + pending-report IMEI lookup, 4 states

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `app/api/scan-link/route.ts`

**Files:** Create `app/api/scan-link/route.ts`.

**Interfaces produced:** `POST /api/scan-link` — body `{ url: string }` → `200 { riskLevel: 'safe' | 'caution' | 'danger'; riskScore: number; summary: string; flags: string[]; positives: string[]; detectedCategory: string; similarProducts: Product[]; analysedBy: 'rule-based' | 'grok-ai' | 'zolarux' }` or `4xx { error: string }`.

- [ ] **Step 1: Read `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`** — confirm the `export async function POST(request: Request)` signature and `NextResponse.json` in Next 16.

- [ ] **Step 2: Create `app/api/scan-link/route.ts`** — port `main`'s route with these changes: (a) **remove** the `@/lib/rate-limit` import and its block (module absent here); (b) reframe the Zolarux-model copy in the strings; (c) keep SSRF guard, `ruleBasedAnalysis`, `fetchPageContent`, `grokAnalysis` (env-gated), `findSimilarProducts` (rename key `similarProducts`); (d) `createClient` from `@/lib/supabase/server`.

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'

const ZOLARUX_DOMAINS = ['zolarux.com.ng', 'zolarux.com', 'zolarux.vercel.app']
const TRUSTED_PLATFORMS = ['jumia.com', 'konga.com', 'paystack.com', 'flutterwave.com', 'apple.com', 'samsung.com', 'dell.com', 'hp.com', 'lenovo.com']
const CAUTION_PLATFORMS = ['jiji.ng', 'olx.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com']
const SHORTENERS = ['bit.ly', 'tinyurl', 'rb.gy', 'short.io', 'ow.ly', 'buff.ly', 'cutt.ly']
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.online', '.site', '.tk', '.ml', '.ga', '.cf']

function ruleBasedAnalysis(url: string): { riskScore: number; flags: string[]; positives: string[]; detectedCategory: string } {
  const flags: string[] = []
  const positives: string[] = []
  let riskScore = 30
  const lower = url.toLowerCase()

  const GADGET_KEYWORDS = ['iphone', 'samsung', 'phone', 'laptop', 'macbook', 'airpods', 'headphone', 'tablet', 'ipad', 'android', 'xiaomi', 'tecno', 'infinix', 'itel', 'huawei', 'dell', 'hp', 'lenovo', 'asus', 'accessories', 'charger', 'cable', 'earbuds', 'smartwatch', 'gaming', 'console', 'ps5', 'xbox', 'nintendo']
  const detectedCategory = GADGET_KEYWORDS.find((k) => lower.includes(k)) || 'gadget'

  if (ZOLARUX_DOMAINS.some((d) => lower.includes(d))) {
    return { riskScore: 0, flags: [], positives: ['This is a Zolarux listing — guaranteed or refunded'], detectedCategory }
  }
  if (TRUSTED_PLATFORMS.some((p) => lower.includes(p))) {
    positives.push('Link is from a well-known platform with buyer protection')
    riskScore -= 20
  } else if (CAUTION_PLATFORMS.some((p) => lower.includes(p))) {
    riskScore += 20
    flags.push('This is a social platform — payments happen off-platform with no protection')
  } else {
    riskScore += 25
    flags.push('Unfamiliar platform — verify it carefully before sending money')
  }
  if (lower.includes('wa.me') || lower.includes('t.me')) {
    riskScore += 30
    flags.push('Link goes straight to a messaging app — no oversight on the sale')
  }
  if (SUSPICIOUS_TLDS.some((t) => lower.includes(t))) {
    riskScore += 35
    flags.push('Domain uses a TLD commonly seen on scam sites')
  }
  if (SHORTENERS.some((s) => lower.includes(s))) {
    riskScore += 25
    flags.push('URL is shortened — the real destination is hidden')
  }
  if (lower.startsWith('https://')) positives.push('Uses HTTPS (secure connection)')
  else {
    riskScore += 15
    flags.push('Not HTTPS — the connection is not encrypted')
  }
  return { riskScore: Math.max(0, Math.min(100, riskScore)), flags, positives, detectedCategory }
}

function isPrivateUrl(urlStr: string): boolean {
  try {
    const p = new URL(urlStr)
    const h = p.hostname.toLowerCase()
    return (
      h === 'localhost' || h === '0.0.0.0' || h.startsWith('127.') || h.startsWith('10.') ||
      h.startsWith('192.168.') || h.startsWith('172.') || h === '169.254.169.254' ||
      h.endsWith('.local') || h.endsWith('.internal') || p.protocol === 'file:' || p.protocol === 'ftp:'
    )
  } catch {
    return true
  }
}

function isValidScanUrl(url: string): boolean {
  if (url.length > 2048) return false
  try {
    const p = new URL(url)
    return p.protocol === 'http:' || p.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchPageContent(url: string): Promise<string | null> {
  if (isPrivateUrl(url)) return null
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Zolarux SafeCheck/1.0)', Accept: 'text/html' },
    })
    clearTimeout(t)
    if (!res.ok) return null
    if (res.url && isPrivateUrl(res.url)) return null
    const html = await res.text()
    return (
      html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000) || null
    )
  } catch {
    return null
  }
}

async function grokAnalysis(url: string, pageContent: string | null) {
  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return null
  const context = pageContent ? `URL: ${url}\n\nPage snippet:\n${pageContent}` : `URL: ${url}\n\n(Page content unavailable.)`
  const prompt = `You are a Nigerian e-commerce safety analyst. Return ONLY valid JSON.\n\n${context}\n\nAssess scam signals (low price, vague description, pressure tactics, off-platform payment, misrepresented condition). Return exactly:\n{"productName":"","detectedCategory":"one of phones|laptops|accessories|electronics|gaming|other","riskScore":0,"flags":["max 5"],"positives":["max 3"],"summary":"2-3 sentences for a Nigerian buyer"}`
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'grok-2-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 600, temperature: 0.1 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null
    const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    return {
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 30)),
      flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [],
      positives: Array.isArray(parsed.positives) ? parsed.positives.slice(0, 3) : [],
      detectedCategory: parsed.detectedCategory || 'gadget',
      productName: parsed.productName || '',
      summary: parsed.summary || '',
    }
  } catch {
    return null
  }
}

async function findSimilarProducts(productName: string, category: string): Promise<Product[]> {
  const supabase = await createClient()
  if (productName) {
    for (const kw of productName.toLowerCase().split(' ').filter((w) => w.length > 3)) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${kw}%,description.ilike.%${kw}%`)
        .order('is_featured', { ascending: false })
        .limit(4)
      if (data && data.length > 0) return data as Product[]
    }
  }
  const { data: cat } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${category.split(' ')[0]}%`)
    .order('is_featured', { ascending: false })
    .limit(4)
  if (cat && cat.length > 0) return cat as Product[]
  const { data: feat } = await supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).limit(4)
  return (feat as Product[]) || []
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    if (!isValidScanUrl(url)) return NextResponse.json({ error: 'Enter a valid http:// or https:// URL.' }, { status: 400 })
    if (isPrivateUrl(url)) return NextResponse.json({ error: 'That URL points to a private network and cannot be scanned.' }, { status: 400 })

    const lower = url.toLowerCase()
    if (ZOLARUX_DOMAINS.some((d) => lower.includes(d))) {
      return NextResponse.json({
        riskLevel: 'safe',
        riskScore: 0,
        summary: 'This is a Zolarux listing. Every unit is inspected before dispatch and every order is guaranteed or refunded.',
        flags: [],
        positives: ['This is a Zolarux listing — guaranteed or refunded'],
        detectedCategory: 'gadget',
        analysedBy: 'zolarux',
        similarProducts: await findSimilarProducts('', 'gadget'),
      })
    }

    const isPublic = !['wa.me', 't.me', 'instagram.com', 'tiktok.com'].some((d) => lower.includes(d))
    const pageContent = isPublic ? await fetchPageContent(url) : null
    const grok = await grokAnalysis(url, pageContent)

    let riskScore: number, flags: string[], positives: string[], detectedCategory: string, productName: string, summary: string, analysedBy: string
    if (grok) {
      ;({ riskScore, flags, positives, detectedCategory, productName, summary } = grok)
      analysedBy = 'grok-ai'
    } else {
      const r = ruleBasedAnalysis(url)
      riskScore = r.riskScore
      flags = r.flags
      positives = r.positives
      detectedCategory = r.detectedCategory
      productName = ''
      analysedBy = 'rule-based'
      summary =
        riskScore < 25
          ? 'This link looks like it comes from a relatively trustworthy source. Still, only pay for a gadget you have been able to inspect.'
          : riskScore < 60
          ? 'This link has some risk signals. It might be fine, but consider buying from Zolarux instead — guaranteed or refunded.'
          : 'This link shows several high-risk signals. We strongly advise against sending any payment. See safer options below.'
    }

    const riskLevel = riskScore < 25 ? 'safe' : riskScore < 60 ? 'caution' : 'danger'
    return NextResponse.json({
      riskLevel,
      riskScore,
      summary,
      flags,
      positives,
      detectedCategory,
      analysedBy,
      similarProducts: await findSimilarProducts(productName, detectedCategory),
    })
  } catch (e) {
    console.error('scan-link error:', e)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Verify** — `tsc`/`lint`/`build` clean; route table shows `ƒ /api/scan-link`.

```bash
curl -s -XPOST localhost:3000/api/scan-link -H 'content-type: application/json' -d '{"url":"https://bit.ly/x"}' | grep -oE '"riskLevel":"[a-z]+"|shortened'
curl -s -XPOST localhost:3000/api/scan-link -H 'content-type: application/json' -d '{"url":"https://apple.com/iphone"}' | grep -oE '"riskLevel":"safe"|HTTPS'
curl -s -XPOST localhost:3000/api/scan-link -H 'content-type: application/json' -d '{"url":"http://127.0.0.1/"}' -w ' [%{http_code}]'
```

Expect: `bit.ly` → `caution`/`danger` + shortener flag; `apple.com` → `safe`; `127.0.0.1` → `400`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(api): /api/scan-link — rule-based URL risk analysis (ported, reframed, no rate-limit)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: `/scan-link` page

**Files:** Create `app/(tools)/scan-link/page.tsx`. Modify `lib/safety.ts` (add `scanLink`).

**Interfaces produced:**
- `lib/safety.ts` — `ScanResult = { riskLevel: 'safe' | 'caution' | 'danger'; riskScore: number; summary: string; flags: string[]; positives: string[]; similarProducts: Product[] } | { error: string }`; `scanLink(url: string): Promise<ScanResult>`.

- [ ] **Step 1: Add `scanLink` to `lib/safety.ts`**

```ts
import type { Product } from '@/types/product'

export interface ScanOk {
  riskLevel: 'safe' | 'caution' | 'danger'
  riskScore: number
  summary: string
  flags: string[]
  positives: string[]
  similarProducts: Product[]
}

export async function scanLink(url: string): Promise<ScanOk | { error: string }> {
  try {
    const res = await fetch('/api/scan-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error || 'Scan failed. Try again.' }
    return data as ScanOk
  } catch {
    return { error: 'Could not run the scan. Check your connection and try again.' }
  }
}
```

- [ ] **Step 2: Create `app/(tools)/scan-link/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Search, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Input, Button } from '@/components/ui'
import { ProductCard } from '@/components/ui/ProductCard'
import { scanLink, type ScanOk } from '@/lib/safety'

const VERDICT = {
  safe: { Icon: ShieldCheck, label: 'Looks ok', ring: 'border-verified/40 bg-verified/10', accent: 'text-verified', bar: 'bg-verified' },
  caution: { Icon: ShieldAlert, label: 'Be careful', ring: 'border-action/40 bg-action/10', accent: 'text-action', bar: 'bg-action' },
  danger: { Icon: ShieldX, label: 'High risk', ring: 'border-danger/40 bg-danger/10', accent: 'text-danger', bar: 'bg-danger' },
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
                        <span className="ml-auto font-body text-sm text-ink-soft">Risk {result.riskScore}/100</span>
                      </div>
                      <span className="block h-2 overflow-hidden rounded-pill bg-line">
                        <span className={`block h-full rounded-pill ${V.bar}`} style={{ width: `${result.riskScore}%` }} />
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
                  <p className="mb-4 font-display text-lg font-extrabold text-ink">Buy it from Zolarux instead</p>
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
```

- [ ] **Step 3: Verify** — `tsc`/`lint`/`build` clean. `/scan-link` 200. In the browser: scan `https://bit.ly/x` → "Be careful"/"High risk" + shortener flag + a "Buy it from Zolarux instead" rail of real products; scan `not a url` → inline error. Both themes.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(scan-link): URL scanner page — risk meter + Zolarux alternatives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Delete `check-vendor` + kill the compat shim

**Files:** Delete `app/(tools)/check-vendor/`. Modify `lib/constants.ts`, `app/globals.css`, and `app/robots.ts` / `app/sitemap.ts` if they reference `/check-vendor`.

- [ ] **Step 1: Delete the page**

```bash
git rm -r "app/(tools)/check-vendor"
```

- [ ] **Step 2: Remove `VENDOR_STATUS_MAP`**

```bash
grep -rn "VENDOR_STATUS_MAP" app components lib   # expect: only lib/constants.ts
```

Delete the `VENDOR_STATUS_MAP` block and its "Kept only for the unlinked check-vendor page" comment from `lib/constants.ts`.

- [ ] **Step 3: Crawler files**

`grep -rn "check-vendor" app/robots.ts app/sitemap.ts` — remove any hit (the Phase 0 `robots.ts` disallows `/dev/`, not `/check-vendor`, so likely nothing).

- [ ] **Step 4: Kill the shim**

```bash
grep -rnE "font-700|font-800|shadow-card|shadow-card-hover|bg-accent|text-accent" app components --include="*.tsx" | grep -v "app/dev/"
```

Expect **zero**. Then in `app/globals.css` delete these four blocks:

```css
@utility font-700 { font-weight: 700; }
@utility font-800 { font-weight: 800; }
@utility shadow-card       { box-shadow: var(--elevation-md); }
@utility shadow-card-hover { box-shadow: var(--elevation-lg); }
```

Keep `@utility font-500` and `@utility font-600` (still used by `components/ui/*`). Update the shim comment to: `font-500/600: used by the Phase 0 components/ui/* library. Everything else was removed by Phase 3.`

- [ ] **Step 5: Verify** — `rm -rf .next && npm run build`. Route table **loses** `/check-vendor`. `tsc`/`lint` clean. `npm run dev`, spot-check `/`, `/about`, `/listings`, `/how-it-works`, `/dev/ui` — nothing regressed from the shim removal (grep proved no consumers, so this is a formality).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore(phase-3): delete orphaned check-vendor + remove the last compat-shim entries

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Phase 3 verification pass + push

**Files:** Modify the spec (completion note).

- [ ] **Step 1: Full static check**

```bash
rm -rf .next
npx tsc --noEmit     # clean
npm run lint         # 0 errors
npm run build        # succeeds
```

Paste the route table. Confirm: **added** `○ /check-device`, `○ /check-original`, `○ /report-item`, `○ /scan-link` (note: the three client tool pages are `○` static shells that hydrate; `/api/scan-link` is `ƒ`); **removed** `/check-vendor`.

- [ ] **Step 2: Wired-path + content sweep** (`npm run dev`)

- `check-device`: `352130213565996` → reported; random → clean; `abc` → invalid.
- `report-item`: valid submit → success panel; a new `pending` row appears; **delete the test row** (curl DELETE with the anon key — if it 204s without removing, add it to the list for the user).
- `scan-link`: `bit.ly` → caution/danger; `apple.com` → safe; internal IP → 400; a real gadget URL → alternatives rail populated.
- All four pages + Navbar dropdown + Footer "Safety" column: 200, real content, links resolve, **no "vendor"/"escrow"** (`curl | grep -oiE "\bvendor\b|\bescrow\b"` → empty).
- Record dark-mode + mobile eyeball as the outstanding human step.

- [ ] **Step 3: Spec completion note** — append "## Phase 3 completion (…)" with the verification result, the test rows to delete, and the remaining §15 DRAFT content.

- [ ] **Step 4: Commit + push**

```bash
git add -A
git commit -m "chore(phase-3): verification pass — safety tools complete

Route table: <paste>
QA: 4 tools wired/verified; check-vendor + compat shim gone; no vendor/escrow leak.
Test rows to delete: <ids>. Deferred: dark/mobile eyeball. §15 content pending.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin flagship-v2
```

---

## Self-Review

**1. Spec coverage:**

| Spec § | Task |
|---|---|
| §6 `SAFETY_TOOLS` + Navbar dropdown + Footer column + PageHeader `tone` | Task 1 |
| §7 `/check-original` guide | Task 2 |
| §8 `/report-item` + `lib/safety.ts` (`submitStolenReport`) | Task 3 |
| §9 `/check-device` 4-state lookup (`checkDevice`, danger PageHeader) | Task 4 |
| §10 `/api/scan-link` (port, no rate-limit, env-gated Grok, reframed) | Task 5 |
| §10 `/scan-link` page (`scanLink`, risk meter, alternatives rail) | Task 6 |
| §11 delete `check-vendor` + `VENDOR_STATUS_MAP` + shim | Task 7 |
| §12 motion (Reveal/transition-micro/Skeleton, reduced-motion) | Tasks 2–6 |
| §13 verification (wired-path checks, route table, no-leak) | Standard cycle + Task 8 |
| §15 open items (junk row, DRAFT content, registry row) | Task 3/8 notes |

No gaps.

**2. Placeholder scan:** DRAFT markers are the approved content approach (visible notes or `{/* DRAFT */}`). No "TBD" / "handle edge cases" / "similar to Task N". Every page, the route handler, and every `lib/safety.ts` function has full source.

**3. Type consistency:**
- `lib/safety.ts` is built across Tasks 3 (`submitStolenReport`, `StolenReportInput`), 4 (`checkDevice`, `StolenRecord`, `DeviceCheckResult`), 6 (`scanLink`, `ScanOk`) — each task's Interfaces block names exactly what the next consumes. `createClient` imported once at top (browser client) — Task 4's addition doesn't re-import; Task 6 adds `import type { Product }`.
- `DeviceCheckResult.status` union (`'stolen'|'reported'|'clean'|'error'|'invalid'`) — Task 4 page's `RESULT_META` keys 4 of them and handles `'invalid'` separately. Consistent.
- `/api/scan-link` response keys (`riskLevel`, `riskScore`, `summary`, `flags`, `positives`, `similarProducts`, `analysedBy`) — Task 5 returns them, Task 6's `ScanOk` consumes a subset (drops `analysedBy`, `detectedCategory` — fine, the page doesn't need them). `riskLevel` values `'safe'|'caution'|'danger'` match `VERDICT` keys.
- `PageHeader` `tone` prop — added Task 1, used `tone="danger"` in Task 4 only.
- `SAFETY_TOOLS` `icon` union `'smartphone'|'scan-search'|'flag'|'link'` — Task 1 `TOOL_ICON` map keys exactly those; lucide exports `Smartphone`, `ScanSearch`, `Flag`, `Link2`. Consistent.
- `Product` type — `lib/products` / `types/product`; `findSimilarProducts` returns `Product[]`, `ProductCard` (Task 6) consumes `Product`. Consistent.

Fixed inline during review: Task 5 originally kept `main`'s `NextRequest` import + rate-limit; changed to `Request` and dropped the rate-limit block per the Global Constraints (module absent).

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-01-flagship-v2-phase-3-safety-tools.md`.**

The user has chosen **inline execution** — proceed with `superpowers:executing-plans`, batch execution with checkpoints.
