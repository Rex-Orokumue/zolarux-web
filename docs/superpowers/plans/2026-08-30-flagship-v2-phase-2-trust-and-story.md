# Flagship v2 — Phase 2 (Trust & Story) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the four trust/story pages a single trusted gadget retailer needs — a founder-first About (redesign), a full How It Works, an FAQ, and a Contact page whose form opens WhatsApp — all on the Phase 0 kit, plus the Navbar/Footer wiring.

**Architecture:** Four static pages (no Supabase) built with the Phase 0 component library and semantic tokens. A small shared `PageHeader` gives the three new pages a consistent hero band. Content is drafted in the retailer voice with guessed specifics marked as draft. Contact's form is client-side only and composes a `wa.me` URL from its fields.

**Tech Stack:** Next.js 16.2.6 (App Router, RSC), React 19.2, TypeScript 5, Tailwind v4, Radix + CVA, `lucide-react`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-30-flagship-v2-phase-2-trust-and-story-design.md` — read it first. Plan and spec travel together.

## Global Constraints

- **Branch:** all work on `flagship-v2` (Phase 1 done, tip `18431a8`). Never touch `main` / `flagship-redesign`.
- **Narrative:** single trusted retailer. No "vendor", no "escrow / protection fee" anywhere. Trust promise = **"guaranteed or refunded"**. Purchase / contact channel = **WhatsApp** (`buildWhatsAppUrl(message)`, `WHATSAPP_NUMBER = '2347063107314'`).
- **Voice:** brand-first "we" everywhere **except** About, which is narrated first-person by **Rex** (the founder).
- **Content is draft.** Write real retailer copy; mark anything guessed (delivery times, coverage, refund window, payment methods, team bios, exact stats) inline as `{/* DRAFT: confirm */}` or a visible "Draft — confirm" note where a reviewer must see it. Reusable real facts: ~5 years operating, ₦2M+ in orders, 0 confirmed scams, nationwide (Lagos / Abuja / Port Harcourt named), gadgets only, ~1–5 business days delivery.
- **Next 16 is not the Next.js you know** (`AGENTS.md`). Before creating a route or editing `generateMetadata`, read `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` (and `14-metadata-and-og-images.md` for metadata).
- **Lint rule enforced:** no `setState` synchronously in an effect. The Contact form uses ordinary event handlers — fine.
- **No test runner.** "Verify" = the Standard Verification Cycle below.
- **Motion:** Phase 0 system only — `Reveal` on section entrances (once), `hover-lift` on cards. **No cinematic sequence** (Home-only). Everything degrades under `prefers-reduced-motion` (Phase 0 global guard already in `globals.css`).
- **Out of scope:** Blog, legal pages, any vendor page, a Contact-form backend, changes to the six Phase 1 surfaces beyond the Navbar/Footer link updates, `(tools)` pages.
- **Commit messages** end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Conventional prefixes.
- **Path alias:** `@/` → repo root.

### Standard Verification Cycle

End of every task, in order — any failure blocks the commit:

```bash
npx tsc --noEmit          # no errors
npm run lint              # no new errors (pre-existing <img> / unused-var warnings tolerated)
npm run build             # succeeds; new routes appear as ○ (static)
```

Then `npm run dev` and, for the changed page(s):

```bash
curl -s http://localhost:3000/<route> | grep -oE "<distinctive strings from the page>"
```

Confirm the page returns 200 with its real content, links resolve, and no "vendor"/"escrow" leaked in. Dark-mode + mobile visual eyeball is a **human step** (the Chrome screenshot tool is currently broken) — note it in the commit, don't block on it.

---

## File Structure

**Created:**
- `components/marketing/PageHeader.tsx` — shared `bg-primary` hero band for How It Works / FAQ / Contact.
- `components/marketing/ContactForm.tsx` — client form that opens a `wa.me` URL.
- `app/(marketing)/how-it-works/page.tsx`
- `app/(marketing)/faq/page.tsx`
- `app/(marketing)/contact/page.tsx`

**Modified:**
- `lib/constants.ts` — `NAV_LINKS` ("The Guarantee" → "How it works" / `/how-it-works`), add `HELP_LINKS`.
- `components/layout/Footer.tsx` — add a "Help" column.
- `app/(marketing)/about/page.tsx` — full redesign, founder-first, token migration.
- `app/globals.css` — re-grep + trim compat-shim entries that drop to zero use after About migrates (Task 6).

---

## Task 1: Constants, Footer "Help" column, shared `PageHeader`

**Files:**
- Modify: `lib/constants.ts`, `components/layout/Footer.tsx`
- Create: `components/marketing/PageHeader.tsx`

**Interfaces:**
- Consumes: `Link` (`next/link`), `Reveal` optional.
- Produces:
  - `NAV_LINKS` (`@/lib/constants`) — `[{ label: 'How it works', href: '/how-it-works' }, { label: 'Reviews', href: '/#reviews' }, { label: 'About', href: '/about' }] as const`.
  - `HELP_LINKS` (`@/lib/constants`) — `[{ label: 'How it works', href: '/how-it-works' }, { label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }] as const`.
  - `PageHeader` (`components/marketing/PageHeader.tsx`) — `{ eyebrow?: string; title: string; lede?: string }`, server component. Renders a `bg-primary text-on-primary` band with an optional uppercase eyebrow, an `h1`, and an optional lede paragraph, inside `max-w-7xl` padding matching the other marketing sections.

- [ ] **Step 1: `lib/constants.ts`**

Replace `NAV_LINKS`:

```ts
export const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Reviews',      href: '/#reviews' },
  { label: 'About',        href: '/about' },
] as const

export const HELP_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'FAQ',          href: '/faq' },
  { label: 'Contact',      href: '/contact' },
] as const
```

- [ ] **Step 2: `components/marketing/PageHeader.tsx`**

```tsx
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string
  title: string
  lede?: string
}) {
  return (
    <section className="bg-primary py-16 text-on-primary sm:py-20">
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

- [ ] **Step 3: `components/layout/Footer.tsx` — add the "Help" column**

Import `HELP_LINKS` alongside `SHOP_MENU`, `NAV_LINKS`. Change the grid to fit four columns:

```tsx
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
```

After the "Zolarux" column, add:

```tsx
        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Help</h4>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
```

The "Zolarux" column still lists `NAV_LINKS` + Sign in — that now includes "How it works" too, which also appears under Help. That duplication is acceptable (nav vs. help framing); if you'd rather not, drop "How it works" from the Help column and keep FAQ + Contact only. **Decision:** keep all three in Help (it reads as a complete help set) and leave `NAV_LINKS` in the Zolarux column as-is.

- [ ] **Step 4: Standard Verification Cycle**

`npm run dev`, open `/` — the Navbar now shows "How it works" (pointing at `/how-it-works`, which 404s until Task 3 — expected this task). Footer shows four columns including Help. Both themes, mobile stacks 2×2 then 1-col.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(phase-2): nav 'How it works' + Footer Help column + PageHeader

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: About — founder-first redesign

**Files:**
- Rewrite: `app/(marketing)/about/page.tsx`

**Interfaces:**
- Consumes: `StatTile` / `Card` / `Avatar` / `Reveal` (Phase 0), `lucide-react`.
- Produces: `AboutPage` (default export, server component) + its `metadata`.

- [ ] **Step 1: Rewrite `app/(marketing)/about/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Search, Camera, MessageCircle, RotateCcw } from 'lucide-react'
import { StatTile, Card, Avatar, Reveal } from '@/components/ui'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Zolarux is a small Nigerian gadget store built on one rule: you get exactly what you ordered, or your money back. Meet the people behind it.',
}

const VALUES = [
  {
    icon: Search,
    title: 'We inspect everything',
    body: "Nothing ships that we haven't powered on, tested and graded ourselves.",
  },
  {
    icon: Camera,
    title: "We're honest about condition",
    body: 'Real photos of the real unit, real notes. No "as good as new" when it isn\'t.',
  },
  {
    icon: MessageCircle,
    title: "We're easy to reach",
    body: 'A person on WhatsApp who knows your order — not a ticket queue.',
  },
  {
    icon: RotateCcw,
    title: 'Guaranteed or refunded',
    body: "If it's not exactly as described when it reaches you, you get your money back.",
  },
]

// DRAFT — confirm names, roles and bios with the user.
const TEAM = [
  {
    name: 'Rex Orokumue',
    role: 'Founder',
    bio: 'Started Zolarux after one too many friends lost money to fake phones online. Handles what gets bought and how it gets checked.',
  },
  {
    name: 'Karen',
    role: 'Sourcing & Inspection',
    bio: 'Runs the bench — every device through her hands before it is listed or shipped.',
  },
  {
    name: 'Precious',
    role: 'Customer Care',
    bio: 'The voice on WhatsApp. Keeps every order moving and every buyer in the loop.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero — founder voice */}
      <section className="bg-primary py-16 text-on-primary sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-on-primary/70">
              Our story
            </p>
            {/* DRAFT headline — confirm */}
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
              I started Zolarux because I was tired of watching people get burned.
            </h1>
            <p className="mt-5 font-body text-lg leading-relaxed text-on-primary/80">
              I&apos;m Rex. I&apos;ve been buying and selling gadgets in Nigeria for about five
              years — and for most of that time I watched people lose real money to fake phones,
              swapped parts and &ldquo;vendors&rdquo; who vanished the moment the transfer landed.
            </p>
          </div>
        </div>
      </section>

      {/* The story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4 font-body leading-relaxed text-ink-soft">
            {/* DRAFT story — confirm the specifics */}
            <p>
              The demand was never the problem. Everyone wants a clean iPhone or a solid work
              laptop at a fair price. The problem was trust — you send money to a stranger and
              hope.
            </p>
            <p>
              So I decided to be the seller people didn&apos;t have to hope about. Buy the stock
              myself. Test every unit properly — not a glance, a real check. Be honest about what
              it is, down to the scratch on the corner. And if I get it wrong, refund it, no
              argument.
            </p>
            <p>
              That&apos;s the whole business. Five years, {`₦`}2M+ in orders, and nobody has
              ever lost money buying from us.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* DRAFT numbers — same placeholders as Home; confirm once */}
            {[
              { value: '₦2M+', label: 'In orders' },
              { value: '100+', label: 'Gadgets delivered' },
              { value: '5 yrs', label: 'Doing this' },
              { value: '0', label: 'Confirmed scams' },
            ].map((s) => (
              <div key={s.label} className="rounded-md border border-line bg-surface py-2">
                <StatTile value={s.value} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            What we stand for
          </h2>
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => {
                const Icon = v.icon
                return (
                  <div key={v.title} className="rounded-md border border-line bg-surface p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="mb-2 font-display text-base font-bold text-ink">{v.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-ink-soft">{v.body}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            The people behind it
          </h2>
          <p className="mb-10 font-body text-ink-soft">
            Small team. Every order has a real person watching it.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((m) => (
              <Card key={m.name}>
                <div className="p-6">
                  <Avatar name={m.name} size="lg" />
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{m.name}</h3>
                  <p className="font-body text-sm font-semibold text-primary">{m.role}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">{m.bio}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-6 font-body text-xs text-ink-soft">
            Draft — confirm team names, roles and bios.
          </p>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Standard Verification Cycle**

`curl -s http://localhost:3000/about | grep -oE "I started Zolarux|What we stand for|The people behind it|We inspect everything"`. No `vendor` / `escrow` / `trust infrastructure` / `Buyer Money is Sacred` in the output. `grep -nE "bg-white|text-gray-|shadow-card|font-700|font-800|bg-primary-light" app/(marketing)/about/page.tsx` → zero hits. Both themes; hero stays blue (committed color).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(about): founder-first redesign on tokens — drop escrow narrative

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: How It Works (`/how-it-works` — new)

**Files:**
- Create: `app/(marketing)/how-it-works/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 1), `GuaranteeSteps` (`components/marketing/GuaranteeSteps.tsx`, unchanged), `Card` / `Reveal` / `Button` (Phase 0), `Link`, `lucide-react`.
- Produces: `HowItWorksPage` (default export, server component) + `metadata`.

- [ ] **Step 1: Read the Next.js layouts/pages doc** — confirm a new `app/(marketing)/how-it-works/page.tsx` picks up the marketing layout (Navbar/Footer) automatically. It does.

- [ ] **Step 2: Create `app/(marketing)/how-it-works/page.tsx`**

```tsx
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

const GRADES = [
  { label: 'New', body: 'Sealed or genuinely unused. Full manufacturer condition.' },
  { label: 'UK Used', body: 'Pre-owned abroad, typically light use, clean cosmetics. We state any marks.' },
  { label: 'Refurbished', body: 'Restored to full working order. Some parts may have been replaced — we say which.' },
  { label: 'Used', body: 'Local pre-owned. Fully working, more visible wear. Priced accordingly.' },
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
          {/* DRAFT — confirm payment methods, delivery timeframe/cost, coverage */}
          <div className="space-y-4 font-body text-sm leading-relaxed text-ink-soft">
            <p>
              <strong className="text-ink">Order on WhatsApp.</strong> Tap &ldquo;Order on
              WhatsApp&rdquo; on any product. We reply to confirm it&apos;s in stock, the exact
              condition, the final price and delivery to your area.
            </p>
            <p>
              <strong className="text-ink">Pay.</strong> Bank transfer once you&apos;re happy with
              the details. {`{/* DRAFT: list the real payment methods */}`}
            </p>
            <p>
              <strong className="text-ink">We dispatch.</strong> Your inspected unit ships the
              same or next day. Delivery is nationwide — Lagos, Abuja, Port Harcourt and beyond —
              and usually takes 1–5 business days. {`{/* DRAFT: confirm timeframe + cost */}`}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            If it&apos;s not right — the refund process
          </h2>
          {/* DRAFT — confirm the refund window and who pays return shipping */}
          <ol className="space-y-3 font-body text-sm leading-relaxed text-ink-soft">
            <li>
              <strong className="text-ink">1. Inspect it on delivery.</strong> Check it fully
              before you pay the delivery rider, or right after it arrives.
            </li>
            <li>
              <strong className="text-ink">2. Tell us within 48 hours.</strong> Message us on
              WhatsApp with what&apos;s wrong and a photo or video. {`{/* DRAFT: confirm window */}`}
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
            Questions? <Link href="/contact" className="font-semibold text-primary hover:underline">Talk to us</Link>.
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
```

> Note: the `{`{/* DRAFT... */}`}` bits above are literal on-page text intentionally — a reviewer sees them and knows what to replace. If you prefer them invisible, move each into a real JSX comment `{/* DRAFT: ... */}` next to the paragraph instead. Either is fine; keep them discoverable.

- [ ] **Step 3: Standard Verification Cycle**

`/how-it-works` returns 200; `curl | grep -oE "How buying from Zolarux works|What .inspected. actually means|Condition grades|the refund process"`. Navbar "How it works" now resolves. `GuaranteeSteps` renders. Route table shows `○ /how-it-works`. Both themes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(how-it-works): standalone page expanding the guarantee

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: FAQ (`/faq` — new)

**Files:**
- Create: `app/(marketing)/faq/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 1), `Accordion` (Phase 0 — `{ items: AccordionItemData[]; type?: 'single' | 'multiple'; defaultValue?: string }`, `AccordionItemData = { value, trigger, content }`), `Link`.
- Produces: `FaqPage` (default export, server component) + `metadata`.

- [ ] **Step 1: Create `app/(marketing)/faq/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Accordion } from '@/components/ui'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about buying from Zolarux — ordering, payment, delivery, condition grades and refunds.',
}

// DRAFT — every answer. Confirm specifics (coverage, timeframes, warranty, refund window).
const GROUPS = [
  {
    heading: 'Ordering & payment',
    items: [
      {
        value: 'order',
        trigger: 'How do I place an order?',
        content:
          'Find what you want in the shop and tap "Order on WhatsApp". That opens a chat with your item pre-filled. We confirm stock, condition, final price and delivery, then you pay.',
      },
      {
        value: 'pay',
        trigger: 'How do I pay?',
        content:
          'Bank transfer, once you are happy with the details we send you. We do not ask for payment before confirming your order.',
      },
      {
        value: 'pod',
        trigger: 'Can I pay on delivery?',
        content:
          'In some areas, yes — ask us on WhatsApp for your location. Where pay-on-delivery is available you inspect the unit first, then pay the rider.',
      },
      {
        value: 'account',
        trigger: 'Do I need an account?',
        content:
          'No. You can order entirely over WhatsApp. An account just lets you keep track of past orders.',
      },
    ],
  },
  {
    heading: 'Delivery',
    items: [
      {
        value: 'where',
        trigger: 'Where do you deliver?',
        content:
          'Nationwide. We deliver across Lagos, Abuja, Port Harcourt and other cities — tell us your area and we will confirm.',
      },
      {
        value: 'how-long',
        trigger: 'How long does delivery take?',
        content: 'Usually 1–5 business days depending on your location.',
      },
      {
        value: 'cost',
        trigger: 'How much is delivery?',
        content:
          'It depends on your location and the item. We tell you the exact delivery fee before you pay — no surprises.',
      },
    ],
  },
  {
    heading: 'Condition & warranty',
    items: [
      {
        value: 'grades',
        trigger: 'What do the condition grades mean?',
        content:
          'New, UK Used, Refurbished and Used — each is defined on our How It Works page, with an honest sentence about what to expect.',
      },
      {
        value: 'warranty',
        trigger: 'Do devices come with a warranty?',
        content:
          'Every order is covered by our guarantee: if it is not as described when it reaches you, you get a full refund. Longer hardware warranty depends on the item — ask us before ordering.',
      },
      {
        value: 'photos',
        trigger: 'Are the photos of the actual unit?',
        content:
          'Yes. The photos on a listing are the actual unit you would receive, including any marks. We never use stock images.',
      },
    ],
  },
  {
    heading: 'Refunds',
    items: [
      {
        value: 'not-as-described',
        trigger: "What if it's not as described?",
        content:
          'Tell us within 48 hours with a photo or video. We arrange the return and refund everything you paid.',
      },
      {
        value: 'refund-time',
        trigger: 'How long do refunds take?',
        content:
          'Once we have the unit back and confirm the issue, your refund goes out within a few business days to the account you paid from.',
      },
      {
        value: 'change-mind',
        trigger: 'Can I return it if I just change my mind?',
        content:
          'The guarantee covers items that are not as described. For change-of-mind returns, message us — we handle these case by case.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        lede="If your question isn't here, message us on WhatsApp — we reply fast."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6">
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-4 font-display text-xl font-extrabold text-ink">{group.heading}</h2>
              <Accordion type="single" items={group.items} />
            </div>
          ))}

          <p className="font-body text-sm text-ink-soft">
            Draft answers — confirm the specifics. Still stuck?{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Standard Verification Cycle**

`/faq` returns 200; `curl | grep -oE "Questions, answered|Ordering . payment|How do I place an order|What if it's not as described"`. `Accordion` items expand/collapse (keyboard too). Route table shows `○ /faq`. Both themes.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(faq): grouped FAQ on the Accordion — draft retailer answers

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Contact (`/contact` — new) + `ContactForm`

**Files:**
- Create: `components/marketing/ContactForm.tsx`, `app/(marketing)/contact/page.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 1), `Field` / `Input` / `Textarea` / `Select` / `Button` (Phase 0), `buildWhatsAppUrl` (`@/lib/utils`), `lucide-react`.
- Produces:
  - `ContactForm` (`components/marketing/ContactForm.tsx`) — `"use client"`, no props. Fields: name (`Input`), subject (`Select` — Order help / Product question / Refund / Something else), message (`Textarea`). Validates name + message non-empty on submit, then `window.open(buildWhatsAppUrl(composed), '_blank')` with `composed = "Hi Zolarux — {subject}\n\nFrom: {name}\n\n{message}"`.
  - `ContactPage` (default export, server component) + `metadata`.

- [ ] **Step 1: `components/marketing/ContactForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'
import { Field, Input, Textarea, Select, Button } from '@/components/ui'

const SUBJECTS = [
  { value: 'Order help', label: 'Order help' },
  { value: 'Product question', label: 'Product question' },
  { value: 'Refund', label: 'Refund' },
  { value: 'Something else', label: 'Something else' },
]

export function ContactForm() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0].value)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: { name?: string; message?: string } = {}
    if (!name.trim()) next.name = 'Tell us your name'
    if (!message.trim()) next.message = 'Add a short message'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const composed = `Hi Zolarux — ${subject}\n\nFrom: ${name.trim()}\n\n${message.trim()}`
    window.open(buildWhatsAppUrl(composed), '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name" htmlFor="c-name" error={errors.name}>
        <Input
          id="c-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          invalid={!!errors.name}
          placeholder="Ada Obi"
        />
      </Field>

      <Field label="What's it about?" htmlFor="c-subject">
        <Select
          aria-label="What's it about?"
          value={subject}
          onValueChange={setSubject}
          options={SUBJECTS}
        />
      </Field>

      <Field label="Message" htmlFor="c-message" error={errors.message}>
        <Textarea
          id="c-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          invalid={!!errors.message}
          placeholder="How can we help?"
          className="min-h-32"
        />
      </Field>

      <Button type="submit" className="w-full">
        <MessageCircle size={16} />
        Send on WhatsApp
      </Button>
      <p className="font-body text-xs text-ink-soft">
        This opens WhatsApp with your message ready to send.
      </p>
    </form>
  )
}
```

- [ ] **Step 2: `app/(marketing)/contact/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { ContactForm } from '@/components/marketing/ContactForm'
import { buildWhatsAppUrl } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to a real person at Zolarux. Message us on WhatsApp — we reply fast.',
}

const WA_HREF = buildWhatsAppUrl("Hi Zolarux, I'd like to ask a question.")

export default function ContactPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="Contact"
        title="Talk to a human"
        // DRAFT — confirm hours / response time
        lede="We're on WhatsApp most of the day and reply quickly — usually within an hour."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
              WhatsApp is fastest
            </h2>
            <p className="mb-6 font-body text-sm leading-relaxed text-ink-soft">
              For anything about a specific order or product, message us directly — it&apos;s the
              quickest way to get a real answer.
            </p>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-verified px-6 py-3.5 font-display text-base font-bold text-white transition-micro hover:brightness-110"
            >
              <MessageCircle size={18} />
              Message us on WhatsApp
            </a>
            <p className="mt-6 font-body text-sm text-ink-soft">
              Looking for a quick answer? Check the{' '}
              <Link href="/faq" className="font-semibold text-primary hover:underline">
                FAQ
              </Link>{' '}
              first.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Or send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Standard Verification Cycle**

`/contact` returns 200; `curl | grep -oE "Talk to a human|Message us on WhatsApp|Or send a message"`. In the browser: submitting the form with an empty name/message shows the inline errors; filling them and submitting opens a `wa.me/2347063107314?text=...` tab with the composed message (name, subject, message all present). Route table `○ /contact`. Both themes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(contact): WhatsApp-first page + form that composes a wa.me message

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Compat-shim re-grep + Phase 2 verification pass + push

**Files:**
- Modify: `app/globals.css` (only if a shim entry drops to zero use)
- Modify: `docs/superpowers/specs/2026-08-30-flagship-v2-phase-2-trust-and-story-design.md` (completion note)

- [ ] **Step 1: Re-grep the compat shim**

```bash
grep -rnE "font-700|font-800|shadow-card|shadow-card-hover" app components --include="*.tsx" | grep -v "app/dev/"
```

The shim comment says `font-700/800` + `shadow-card(-hover)` are kept "for the unlinked check-vendor + the not-yet-redesigned about page." About is redesigned now — so if the only remaining hits are in `app/(tools)/check-vendor/page.tsx`, update the comment to say "check-vendor only". If `check-vendor` no longer uses one of them (it uses `font-700`, `shadow-card`, `shadow-card-hover` per the Phase 1 grep — re-confirm), delete that entry. Delete any entry with **zero** hits.

- [ ] **Step 2: Full static check**

```bash
npx tsc --noEmit     # clean
npm run lint         # 0 errors
npm run build        # succeeds
```

Paste the route table into the commit. Confirm the new statics: `○ /about`, `○ /how-it-works`, `○ /faq`, `○ /contact`. Everything else unchanged from the Phase 1 baseline.

- [ ] **Step 3: Content + link sweep**

`npm run dev`. For `/about`, `/how-it-works`, `/faq`, `/contact` and the updated Navbar/Footer:
- Each returns 200 with its real content (grep the distinctive strings).
- No `vendor` / `escrow` / `trust infrastructure` in any of them.
- Every Navbar + Footer link resolves (no 404) — especially the new "How it works", "FAQ", "Contact".
- `Accordion` on `/faq` and the `Select` on `/contact` keyboard-operate.
- Contact form: empty-submit shows errors; valid submit opens the right `wa.me` URL.
- Record: dark-mode + mobile eyeball is the outstanding human step (Chrome screenshot tool broken).

- [ ] **Step 4: Spec completion note**

Append to the spec a "Phase 2 completion (2026-08-30)" section: tasks done, verification result, and that all §14 content items are still placeholders pending the user.

- [ ] **Step 5: Commit + push**

```bash
git add -A
git commit -m "chore(phase-2): verification pass — trust & story pages complete

Route table:
<paste>

QA: 4 pages + nav/footer wiring; content-verified; no vendor/escrow leakage.
Contact form composes a wa.me message from its fields. Deferred: dark-mode +
mobile eyeball. Content placeholders per spec §14 pending user.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin flagship-v2
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task |
|---|---|
| §3 four pages | Tasks 2–5 |
| §6 About — founder-first hero, reframed story, 4 values, team reframed, token migration | Task 2 |
| §7 How It Works — PageHeader, GuaranteeSteps unchanged, inspection checklist, condition grades, ordering/delivery/payment, refund process, CTA | Task 3 |
| §8 FAQ — grouped Accordion, 4 groups, ~12 Q&As, contact link | Task 4 |
| §9 Contact — PageHeader, WhatsApp CTA, form (name/subject/message) → wa.me, FAQ pointer | Task 5 |
| §10 NAV_LINKS "How it works", HELP_LINKS, Footer Help column | Task 1 |
| §11 restrained motion (Reveal, hover-lift, no cinematic) | Tasks 2–5 (Reveal used on About/HIW; FAQ/Contact are short — Reveal optional) |
| §12 verification | Standard Verification Cycle + Task 6 |
| §13 out of scope | enforced in Global Constraints |
| §14 content open items | drafted with visible "Draft — confirm" markers; Task 6 Step 4 records them |

No gaps. (Spec §7's "PageHeader" for About: the plan gives About a bespoke founder-voice hero instead — noted in §6 of the spec as "About bespoke", consistent.)

**2. Placeholder scan:** All "DRAFT" markers are the approved content approach (spec §3), and each is either a visible on-page "Draft — confirm" line a reviewer sees or a `{/* DRAFT */}` comment beside the copy. No "TBD" / "implement later" / "add error handling" / "similar to Task N". Every page and component has complete source.

**3. Type consistency:**
- `PageHeader` props `{ eyebrow?, title, lede? }` — defined Task 1, used identically in Tasks 3, 4, 5.
- `NAV_LINKS` / `HELP_LINKS` shape `{ label, href }[]` — Task 1; `Navbar` already maps `NAV_LINKS` (no change needed), `Footer` maps both in Task 1.
- `Accordion` — `{ items: {value,trigger,content}[]; type }` — matches the Phase 0 component; Task 4 passes exactly that.
- `Select` `onValueChange` + `options: {value,label}[]` — matches Phase 0; Task 5 `ContactForm` uses it correctly.
- `Field` `error` prop + `Input`/`Textarea` `invalid` prop — matches Phase 0 (`Field` renders `error` below; `invalid` swaps the border) — Task 5 uses both consistently.
- `buildWhatsAppUrl(message)` — one arg, `@/lib/utils` — used in Tasks 5 (form + page) matching Phase 1 usage.
- `Button` `asChild` (Task 3 CTA) — the Phase 1 bug fix means `asChild` passes children through; wrapping a single `<Link>` is fine.

Fixed inline during review: Task 3's "ordering/delivery/payment" and "refund process" originally embedded `{`{/* DRAFT */}`}` as rendered text via template literals — kept, but the plan note now says a real `{/* */}` comment is equally acceptable and the reviewer must be able to find them either way.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-30-flagship-v2-phase-2-trust-and-story.md`.**

The user has already chosen **inline execution** — proceed with the `superpowers:executing-plans` skill, batch execution with checkpoints.
