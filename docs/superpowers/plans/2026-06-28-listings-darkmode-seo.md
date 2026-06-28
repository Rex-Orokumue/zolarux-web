# Listings Filter, Dark Mode, Supply Notice, Hero Refresh & SEO/AEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five storefront improvements — keyword-based category filtering, site-wide dark mode, a price/availability supply notice, photo-backdrop heroes with added imagery, and sitewide SEO/AEO (structured data, complete metadata).

**Architecture:** Next.js 16 App Router + React 19 + Tailwind v4 (`@theme` in `app/globals.css`) + Supabase. Pure logic (filter query builder, JSON-LD builders) is unit-tested with Vitest; visual/integration changes are verified via `npm run build`, `npm run lint`, and a manual checklist. Work is phased so each phase is independently shippable.

**Tech Stack:** TypeScript, Next 16, React 19, Tailwind CSS v4, Supabase (`@supabase/ssr`), lucide-react, Vitest (added in Phase 0).

## Global Constraints

- **Read before framework code:** consult `node_modules/next/dist/docs/` before writing App-Router metadata/layout/image code (per `AGENTS.md`; this Next version has breaking changes).
- **No new runtime deps** beyond Vitest (dev) unless a task explicitly adds one. Dark mode is custom (no `next-themes`).
- **Brand colors unchanged:** `--color-primary` `#4064D7`, `--color-accent` (CSS `#FF6600`).
- **Dark mode = class strategy:** `.dark` on `<html>`; default follows OS; toggle persists to `localStorage` key `zlx_theme` (`'light'|'dark'|'system'`). No flash on first paint.
- **Dark color mapping (verbatim, apply consistently):**
  `bg-white`→`dark:bg-gray-900`; `bg-gray-50`/`bg-surface`→`dark:bg-gray-950`; `bg-gray-100`→`dark:bg-gray-800`; `text-gray-900`→`dark:text-gray-100`; `text-gray-700`→`dark:text-gray-300`; `text-gray-600`/`text-gray-500`→`dark:text-gray-400`; `text-gray-400`→`dark:text-gray-500`; `border-gray-100`/`border-gray-200`→`dark:border-gray-800`; `bg-primary-light`→`dark:bg-primary-900/30`; status chips `bg-{green,amber,red}-50`→add `dark:bg-{c}-950/40 dark:text-{c}-300 dark:border-{c}-900`; `bg-primary`/`bg-accent` solid blocks unchanged.
- **Supply notice copy (verbatim):**
  Heading: `Live catalogue from verified partner vendors.`
  Body: `Prices and stock can change fast — we confirm the final price and availability with you before any payment.`
  Inline price note (verbatim): `Confirmed at checkout`
- **Listings hero photo (verbatim URL):** `https://images.unsplash.com/photo-1576814547952-f8531781d7ef?w=1600&q=70&auto=format&fit=crop`
- **Currency for structured data:** `NGN`.
- **Site base URL:** `process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'` (reuse existing pattern).
- **Commit after every task.** Branch is `feature/listings-darkmode-refresh` (already created).

---

## File Structure

New files:
- `vitest.config.ts`, `lib/__tests__/*.test.ts` — tests
- `lib/category-filter.ts` — keyword map + Supabase `.or()` string builder
- `lib/theme.ts` — theme get/set/apply helper (client)
- `lib/seo.ts` — JSON-LD builder functions (pure)
- `components/seo/JsonLd.tsx` — renders `<script type="application/ld+json">`
- `components/layout/ThemeToggle.tsx` — sun/moon button
- `components/layout/PageHero.tsx` — reusable photo-backdrop hero
- `components/listings/SupplyNotice.tsx` — dismissible banner + inline note
- `app/(tools)/{check-device,check-original,check-vendor,report-item,scan-link}/layout.tsx`
- `app/(marketing)/{contact,faq,verified-vendors}/layout.tsx`
- `public/og-default.png` (1200×630) — placeholder generated in-task
- `public/llms.txt`

Modified (high level): `lib/constants.ts`, `app/globals.css`, `app/layout.tsx`, `components/layout/Navbar.tsx`, `app/(marketing)/listings/page.tsx`, `app/(marketing)/listings/[id]/page.tsx`, `app/(marketing)/blog/[slug]/page.tsx`, `app/(marketing)/faq/page.tsx`, all hero-bearing pages, and the ~61 files using light-only colors.

---

## Phase 0 — Tooling

### Task 0: Add Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + devDeps)
- Test: `lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Install Vitest (dev)**

```bash
npm i -D vitest@^2
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: { environment: 'node', include: ['lib/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```

- [ ] **Step 3: Add test script to `package.json`** — add `"test": "vitest run"` and `"test:watch": "vitest"` to `scripts`.

- [ ] **Step 4: Write smoke test** `lib/__tests__/smoke.test.ts`

```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```

- [ ] **Step 5: Run** `npm test` → Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/__tests__/smoke.test.ts
git commit -m "chore: add vitest for unit tests"
```

---

## Phase 1 — Smarter category filter

### Task 1: Category keyword map + `.or()` builder

**Files:**
- Create: `lib/category-filter.ts`
- Test: `lib/__tests__/category-filter.test.ts`
- Modify: `lib/constants.ts` (export `CATEGORY_KEYWORDS`)

**Interfaces:**
- Produces:
  - `CATEGORY_KEYWORDS: Record<string, string[]>` (in `lib/constants.ts`)
  - `buildCategoryOrFilter(category: string): string | null` (in `lib/category-filter.ts`) — returns a Supabase `.or()` argument string, or `null` when the category is `'All'`/empty (caller then applies no category filter) — wait, see semantics below.

- [ ] **Step 1: Add `CATEGORY_KEYWORDS` to `lib/constants.ts`** (after `LISTING_CATEGORIES`)

```ts
// Keyword groups so a broad filter also matches sub-type products
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Phones: ['phone', 'smartphone', 'iphone', 'android', 'tablet', 'ipad', 'galaxy'],
  Laptops: ['laptop', 'computer', 'macbook', 'notebook', 'desktop', 'monitor'],
  Accessories: ['accessor', 'earpod', 'airpod', 'earphone', 'headphone', 'headset',
    'charger', 'cable', 'power bank', 'powerbank', 'selfie', 'tripod', 'case',
    'cover', 'screen protector', 'adapter', 'smartwatch', 'watch band',
    'memory card', 'flash drive', 'mouse', 'keyboard'],
  Electronics: ['electronic', 'iron', 'kettle', 'blender', 'fan', 'microwave',
    'appliance', 'speaker', 'soundbar', 'television', 'home theatre',
    'home theater', 'generator', 'stabilizer', 'inverter', 'camera',
    'projector', 'woofer'],
  Gaming: ['game', 'gaming', 'console', 'playstation', 'ps4', 'ps5', 'xbox',
    'nintendo', 'controller', 'joystick'],
}
```

- [ ] **Step 2: Write failing test** `lib/__tests__/category-filter.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { buildCategoryOrFilter } from '@/lib/category-filter'

describe('buildCategoryOrFilter', () => {
  it('returns null for All', () => {
    expect(buildCategoryOrFilter('All')).toBeNull()
  })
  it('matches keyword against category and name for Accessories', () => {
    const f = buildCategoryOrFilter('Accessories')!
    expect(f).toContain('category.ilike.%earpod%')
    expect(f).toContain('name.ilike.%earpod%')
    expect(f).toContain('category.ilike.%power bank%')
  })
  it('falls back to the raw label when no keyword group exists', () => {
    const f = buildCategoryOrFilter('Refurbished')!
    expect(f).toBe('category.ilike.%Refurbished%,name.ilike.%Refurbished%')
  })
})
```

- [ ] **Step 3: Run** `npx vitest run lib/__tests__/category-filter.test.ts` → Expected: FAIL (module not found).

- [ ] **Step 4: Implement** `lib/category-filter.ts`

```ts
import { CATEGORY_KEYWORDS } from '@/lib/constants'

/**
 * Build a Supabase `.or()` argument that matches a broad listing category
 * against both `category` and `name` columns, expanded by keyword synonyms.
 * Returns null for 'All'/empty (caller applies no category constraint).
 */
export function buildCategoryOrFilter(category: string): string | null {
  if (!category || category === 'All') return null
  const keywords = CATEGORY_KEYWORDS[category] ?? [category]
  return keywords
    .map((kw) => `category.ilike.%${kw}%,name.ilike.%${kw}%`)
    .join(',')
}
```

- [ ] **Step 5: Run** `npx vitest run lib/__tests__/category-filter.test.ts` → Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/constants.ts lib/category-filter.ts lib/__tests__/category-filter.test.ts
git commit -m "feat: keyword-based category filter builder"
```

### Task 2: Apply the filter in the listings queries

**Files:**
- Modify: `app/(marketing)/listings/page.tsx` (`getProducts` ~L35-37, `getFeaturedProducts` ~L70-72)

**Interfaces:**
- Consumes: `buildCategoryOrFilter` from `lib/category-filter.ts`.

- [ ] **Step 1: Import the builder** — add to the imports at top of `app/(marketing)/listings/page.tsx`:

```ts
import { buildCategoryOrFilter } from '@/lib/category-filter'
```

- [ ] **Step 2: Replace the `ilike` in `getProducts`** — change:

```ts
  if (category && category !== 'All') {
    query = query.ilike('category', `%${category}%`)
  }
```
to:
```ts
  const orFilter = buildCategoryOrFilter(category)
  if (orFilter) {
    query = query.or(orFilter)
  }
```

- [ ] **Step 3: Replace the `ilike` in `getFeaturedProducts`** — apply the identical change (it has the same `if (category && category !== 'All')` block).

- [ ] **Step 4: Verify build** `npm run build` → Expected: compiles. (Manual check after deploy: `/listings?category=Accessories` shows earpods/power banks; `/listings?category=Electronics` shows irons/appliances; `/listings` unchanged.)

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/listings/page.tsx"
git commit -m "feat: match sub-type products in category filter"
```

---

## Phase 2 — Supply notice (price/availability disclaimer)

### Task 3: SupplyNotice component (banner + inline note)

**Files:**
- Create: `components/listings/SupplyNotice.tsx`

**Interfaces:**
- Produces: default export `SupplyNotice` (dismissible banner); named export `PriceNote` (inline label).

- [ ] **Step 1: Implement** `components/listings/SupplyNotice.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Info, X } from 'lucide-react'

const KEY = 'zlx_supply_notice_dismissed'

export default function SupplyNotice() {
  const [hidden, setHidden] = useState(true)
  useEffect(() => { setHidden(localStorage.getItem(KEY) === '1') }, [])
  if (hidden) return null
  return (
    <div className="bg-primary-light dark:bg-primary-900/30 border-b border-primary-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-700 text-primary dark:text-primary-100">
            Live catalogue from verified partner vendors.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Prices and stock can change fast — we confirm the final price and availability with you before any payment.
          </p>
        </div>
        <button
          onClick={() => { localStorage.setItem(KEY, '1'); setHidden(true) }}
          className="ml-auto shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function PriceNote() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
      <Info size={10} /> Confirmed at checkout
    </span>
  )
}
```

- [ ] **Step 2: Verify** `npm run lint` → Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add components/listings/SupplyNotice.tsx
git commit -m "feat: supply notice banner + inline price note"
```

### Task 4: Wire SupplyNotice into listings + product detail

**Files:**
- Modify: `app/(marketing)/listings/page.tsx` (render banner after the category filter bar; add `<PriceNote/>` near the price in `ProductCard` ~L380-387)
- Modify: `app/(marketing)/listings/[id]/page.tsx` (add `<PriceNote/>` near the price block)

- [ ] **Step 1: Import** in `app/(marketing)/listings/page.tsx`:

```ts
import SupplyNotice, { PriceNote } from '@/components/listings/SupplyNotice'
```

- [ ] **Step 2: Render the banner** — directly after the closing `</div>` of the “Category Filter” block (`app/(marketing)/listings/page.tsx` ~L169), add:

```tsx
<SupplyNotice />
```

- [ ] **Step 3: Add inline note in `ProductCard`** — inside the price `<div>` (the block around L380-387), after the price `<span>`s and before the closing of that price `<div>`, add:

```tsx
<div className="mt-1"><PriceNote /></div>
```

- [ ] **Step 4: Add inline note on product detail** — in `app/(marketing)/listings/[id]/page.tsx`, import `PriceNote` from `@/components/listings/SupplyNotice` and render `<PriceNote />` immediately below the main price display.

- [ ] **Step 5: Verify** `npm run build` → Expected: compiles.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)/listings/page.tsx" "app/(marketing)/listings/[id]/page.tsx"
git commit -m "feat: show supply notice and per-price confirmation note"
```

---

## Phase 3 — SEO & AEO

### Task 5: JSON-LD builders (pure) + JsonLd component

**Files:**
- Create: `lib/seo.ts`
- Create: `components/seo/JsonLd.tsx`
- Test: `lib/__tests__/seo.test.ts`

**Interfaces:**
- Produces (in `lib/seo.ts`):
  - `SITE_URL: string`
  - `orgSchema(): object`
  - `websiteSchema(): object`
  - `productSchema(p: { id:string; name:string; description?:string; price:number; pricing_type:'fixed'|'quote'; image?:string|null; vendor_name?:string }): object`
  - `breadcrumbSchema(items: { name:string; path:string }[]): object`
  - `faqSchema(items: { q:string; a:string }[]): object`
  - `articleSchema(a: { title:string; slug:string; published_at:string; image?:string|null; author?:string }): object`
- Produces (in `components/seo/JsonLd.tsx`): default export `JsonLd({ data }: { data: object | object[] })`.

- [ ] **Step 1: Write failing test** `lib/__tests__/seo.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { productSchema, faqSchema, breadcrumbSchema } from '@/lib/seo'

describe('seo schemas', () => {
  it('builds a Product with offers for fixed price', () => {
    const s: any = productSchema({ id: '1', name: 'iPhone 12', price: 320000, pricing_type: 'fixed' })
    expect(s['@type']).toBe('Product')
    expect(s.offers.price).toBe(320000)
    expect(s.offers.priceCurrency).toBe('NGN')
    expect(s.offers.availability).toContain('schema.org')
  })
  it('omits price for quote items', () => {
    const s: any = productSchema({ id: '1', name: 'Generator', price: 0, pricing_type: 'quote' })
    expect(s.offers.price).toBeUndefined()
  })
  it('builds FAQPage with questions', () => {
    const s: any = faqSchema([{ q: 'Is it safe?', a: 'Yes, escrow.' }])
    expect(s['@type']).toBe('FAQPage')
    expect(s.mainEntity[0]['@type']).toBe('Question')
    expect(s.mainEntity[0].acceptedAnswer.text).toBe('Yes, escrow.')
  })
  it('builds breadcrumb positions', () => {
    const s: any = breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Listings', path: '/listings' }])
    expect(s.itemListElement[1].position).toBe(2)
  })
})
```

- [ ] **Step 2: Run** `npx vitest run lib/__tests__/seo.test.ts` → Expected: FAIL.

- [ ] **Step 3: Implement** `lib/seo.ts`

```ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'
const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zolarux',
    url: SITE_URL,
    logo: `${SITE_URL}/zolarux_logo.png`,
    description: "Nigeria's trust infrastructure for gadget commerce — verified vendors, escrow protection, product inspection.",
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zolarux',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/listings?category={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productSchema(p: {
  id: string; name: string; description?: string; price: number
  pricing_type: 'fixed' | 'quote'; image?: string | null; vendor_name?: string
}) {
  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
    url: abs(`/listings/${p.id}`),
  }
  if (p.pricing_type === 'fixed') offers.price = p.price
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.vendor_name ? { brand: { '@type': 'Brand', name: p.vendor_name } } : {}),
    offers,
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  }
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}

export function articleSchema(a: {
  title: string; slug: string; published_at: string; image?: string | null; author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.title,
    datePublished: a.published_at,
    url: abs(`/blog/${a.slug}`),
    ...(a.image ? { image: abs(a.image) } : {}),
    author: { '@type': 'Organization', name: a.author || 'Zolarux' },
  }
}
```

- [ ] **Step 4: Run** `npx vitest run lib/__tests__/seo.test.ts` → Expected: PASS.

- [ ] **Step 5: Implement** `components/seo/JsonLd.tsx`

```tsx
export default function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/seo.ts components/seo/JsonLd.tsx lib/__tests__/seo.test.ts
git commit -m "feat: JSON-LD schema builders + JsonLd component"
```

### Task 6: Sitewide Organization + WebSite JSON-LD, richer share cards

**Files:**
- Modify: `app/layout.tsx`
- Create: `public/og-default.png` (1200×630)

- [ ] **Step 1: Generate a placeholder OG image** `public/og-default.png`

```bash
# Requires ImageMagick; if unavailable, drop in any 1200x630 PNG named og-default.png
magick -size 1200x630 xc:#4064D7 -gravity center -fill white -pointsize 90 \
  -annotate +0+0 "Zolarux" public/og-default.png
```

- [ ] **Step 2: Add JSON-LD + default OG image to `app/layout.tsx`** — import and render in `<body>`:

```tsx
import JsonLd from '@/components/seo/JsonLd'
import { orgSchema, websiteSchema } from '@/lib/seo'
```
Render right after `<body ...>` opens (before `<PageLoader />`):
```tsx
<JsonLd data={[orgSchema(), websiteSchema()]} />
```
In the root `metadata`, change `twitter.card` from `'summary'` to `'summary_large_image'`, and set both `openGraph.images` and `twitter.images` to `['/og-default.png']` (keep alt text).

- [ ] **Step 3: Verify** `npm run build` → Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx public/og-default.png
git commit -m "feat: sitewide Organization/WebSite JSON-LD + large share card"
```

### Task 7: Product + Breadcrumb JSON-LD on detail; ItemList on listings

**Files:**
- Modify: `app/(marketing)/listings/[id]/page.tsx`
- Modify: `app/(marketing)/listings/page.tsx`

- [ ] **Step 1: Product + Breadcrumb on detail page** — import `JsonLd`, `productSchema`, `breadcrumbSchema`; in the page body render:

```tsx
<JsonLd data={[
  productSchema({
    id: product.id, name: product.name, description: product.description,
    price: product.price, pricing_type: product.pricing_type,
    image: product.main_image_url || product.image_url || product.image_urls?.[0] || null,
    vendor_name: product.vendor_name,
  }),
  breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: product.name, path: `/listings/${product.id}` },
  ]),
]} />
```

- [ ] **Step 2: ItemList on listings** — import `JsonLd` and build an inline ItemList from `products` (positions 1..n, each `item: ${SITE_URL}/listings/${p.id}`); render near the top of the returned JSX. Use `SITE_URL` from `@/lib/seo`.

```tsx
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: products.map((p, i) => ({
    '@type': 'ListItem', position: i + 1,
    url: `${SITE_URL}/listings/${p.id}`, name: p.name,
  })),
}} />
```

- [ ] **Step 3: Verify** `npm run build` → Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/listings/[id]/page.tsx" "app/(marketing)/listings/page.tsx"
git commit -m "feat: Product/Breadcrumb/ItemList structured data on listings"
```

### Task 8: FAQPage + BlogPosting JSON-LD

**Files:**
- Modify: `app/(marketing)/faq/page.tsx` (read its Q&A array; if it's a client component, see Task 9 — render JsonLd from the new `faq/layout.tsx` instead, or extract the Q&A to a shared module imported by the layout)
- Modify: `app/(marketing)/blog/[slug]/page.tsx`

- [ ] **Step 1: FAQ** — locate the existing Q&A data in `app/(marketing)/faq/page.tsx`. Move the Q&A array to `lib/faq-data.ts` (`export const FAQ_ITEMS: { q: string; a: string }[]`). Import it in both the page (for rendering) and the FAQ `layout.tsx` (Task 9) which emits `<JsonLd data={faqSchema(FAQ_ITEMS)} />`.

- [ ] **Step 2: Blog** — in `app/(marketing)/blog/[slug]/page.tsx`, after the post is fetched, render `<JsonLd data={articleSchema({ title: post.title, slug: post.slug, published_at: post.published_at, image: post.cover_image ?? null })} />`. (Confirm the actual field names against the fetched object.)

- [ ] **Step 3: Verify** `npm run build` → Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/faq/page.tsx" lib/faq-data.ts "app/(marketing)/blog/[slug]/page.tsx"
git commit -m "feat: FAQPage and BlogPosting structured data"
```

### Task 9: Metadata for the 8 bare client pages + canonicals

**Files:**
- Create: `app/(tools)/check-device/layout.tsx`, `app/(tools)/check-original/layout.tsx`, `app/(tools)/check-vendor/layout.tsx`, `app/(tools)/report-item/layout.tsx`, `app/(tools)/scan-link/layout.tsx`
- Create: `app/(marketing)/contact/layout.tsx`, `app/(marketing)/faq/layout.tsx`, `app/(marketing)/verified-vendors/layout.tsx`

**Interfaces:**
- Each layout is a server component that exports `metadata` and renders `{children}`.

- [ ] **Step 1: Confirm the pattern** — read `node_modules/next/dist/docs/` for attaching `metadata` via a route `layout.tsx` wrapping a client `page.tsx`.

- [ ] **Step 2: Create each layout** using this template (fill per-page `title`/`description`/`canonical`):

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check if a Device is Stolen',
  description: 'Check a phone or gadget against reported-stolen records before you buy — free on Zolarux.',
  alternates: { canonical: '/check-device' },
  openGraph: {
    title: 'Check if a Device is Stolen | Zolarux',
    description: 'Check a phone or gadget against reported-stolen records before you buy.',
    url: '/check-device',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Per-page values:
- `check-device` → as above.
- `check-original` → title "Verify a Product is Original", desc "Spot clones and fakes before you pay — Zolarux authenticity checks.", canonical `/check-original`.
- `check-vendor` → title "Check a Vendor's Verification", desc "Confirm a vendor is verified on Zolarux before you send money.", canonical `/check-vendor`.
- `report-item` → title "Report a Stolen Gadget", desc "Flag a stolen phone or gadget to help buyers stay safe.", canonical `/report-item`.
- `scan-link` → title "Scan a Link for Safety", desc "Paste a link and we'll check if it's safe before you pay.", canonical `/scan-link`.
- `contact` → title "Contact Zolarux", desc "Reach the Zolarux team — support, vendor onboarding, and enquiries.", canonical `/contact`.
- `faq` → title "Frequently Asked Questions", desc "Answers about buying safely, escrow, verification, and vendors on Zolarux.", canonical `/faq`. **Also** render `<JsonLd data={faqSchema(FAQ_ITEMS)} />` above `{children}` (imports from `@/components/seo/JsonLd`, `@/lib/seo`, `@/lib/faq-data`).
- `verified-vendors` → title "Verified Vendors", desc "Browse Zolarux's verified gadget vendors.", canonical `/verified-vendors`.

- [ ] **Step 3: Add canonicals to other public pages** — for each marketing/static page that already exports `metadata` but lacks `alternates.canonical` (e.g. `about`, `for-buyers`, `for-vendors`, `how-it-works`, `downloads`, `privacy`, `terms`, `refund-policy`, `blog`), add `alternates: { canonical: '/<path>' }`. (Home, listings, and listing-detail already have canonicals or get them via metadata.)

- [ ] **Step 4: Verify** `npm run build`; then `curl -s localhost:3000/check-device | grep -i '<title>'` after `npm run start` shows the new title. Expected: unique titles present.

- [ ] **Step 5: Commit**

```bash
git add app/\(tools\)/*/layout.tsx app/\(marketing\)/{contact,faq,verified-vendors}/layout.tsx
git add app/\(marketing\)/*/page.tsx
git commit -m "feat: metadata + canonicals for previously-bare public pages"
```

### Task 10: `next/image` in ProductCard + llms.txt

**Files:**
- Modify: `app/(marketing)/listings/page.tsx` (`ProductCard` image, ~L321-348)
- Create: `public/llms.txt`
- Modify: `next.config.ts` (allow Unsplash + Supabase image hosts if not already)

- [ ] **Step 1: Allow remote image hosts** — in `next.config.ts`, ensure `images.remotePatterns` includes the Supabase storage host and `images.unsplash.com`. Read the current file first; add only what's missing.

- [ ] **Step 2: Swap `<img>` → `next/image`** in `ProductCard` for the still-image branch only (leave the `<video>` thumbnail branch unchanged). Use `fill` with the existing aspect container and `sizes="(max-width:1024px) 50vw, 25vw"`; keep `alt={product.name}`.

```tsx
import Image from 'next/image'
// inside the image branch:
<Image src={imageUrl} alt={product.name} fill sizes="(max-width:1024px) 50vw, 25vw"
  className="object-cover group-hover:scale-105 transition-transform duration-500" />
```

- [ ] **Step 3: Create `public/llms.txt`**

```text
# Zolarux
Zolarux is Nigeria's trust infrastructure for gadget commerce. We verify vendors,
hold payments in escrow, and inspect products before payout so people can buy
phones, laptops, and electronics online without fear.

## Key pages
- Listings: /listings
- How it works: /how-it-works
- For vendors: /for-vendors
- Check a device (stolen): /check-device
- Check a vendor: /check-vendor
- FAQ: /faq

## Note on prices
Listings are a live catalogue from independent verified partner vendors. Final
price and availability are confirmed at the time of purchase.
```

- [ ] **Step 4: Verify** `npm run build` → Expected: compiles (no image-host errors).

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/listings/page.tsx" next.config.ts public/llms.txt
git commit -m "feat: next/image product cards + llms.txt for answer engines"
```

---

## Phase 4 — Hero & imagery refresh

### Task 11: Reusable PageHero component

**Files:**
- Create: `components/layout/PageHero.tsx`

**Interfaces:**
- Produces: default export `PageHero({ imageUrl, eyebrow, title, subtitle, chips }: { imageUrl: string; eyebrow?: string; title: string; subtitle?: string; chips?: string[] })`.

- [ ] **Step 1: Implement** `components/layout/PageHero.tsx`

```tsx
import { Shield } from 'lucide-react'

export default function PageHero({
  imageUrl, eyebrow, title, subtitle, chips = [],
}: {
  imageUrl: string; eyebrow?: string; title: string; subtitle?: string; chips?: string[]
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#121C42]/95 via-primary/75 to-primary/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm text-white/90 text-sm font-600 px-3 py-1.5 rounded-full">
            <Shield size={14} /> {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-800 text-white mt-4 mb-3 tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/80 text-lg max-w-2xl">{subtitle}</p>}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {chips.map((c) => (
              <span key={c} className="bg-white/14 border border-white/20 text-white text-xs font-600 px-3 py-1.5 rounded-lg">{c}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify** `npm run lint` → Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/layout/PageHero.tsx
git commit -m "feat: reusable photo-backdrop PageHero"
```

### Task 12: Adopt PageHero on listings + every page hero

**Files:**
- Modify: `app/(marketing)/listings/page.tsx` (replace the `<section className="bg-primary py-16">` header, ~L119-134)
- Modify: each page that has a plain hero (home `app/(marketing)/page.tsx`, `how-it-works`, `for-vendors`, `for-buyers`, `about`, `faq`, `verified-vendors`, `contact`, `downloads`, the tools pages, blog index)

**Interfaces:**
- Consumes: `PageHero` from `components/layout/PageHero.tsx`.

- [ ] **Step 1: Listings hero** — replace the existing header `<section>` with:

```tsx
<PageHero
  imageUrl="https://images.unsplash.com/photo-1576814547952-f8531781d7ef?w=1600&q=70&auto=format&fit=crop"
  eyebrow="Every listing is vendor-verified & escrow-protected"
  title="Verified Listings"
  subtitle="Browse our verified gadget catalogue"
  chips={['2,000+ checks done', 'Money-back escrow']}
/>
```

- [ ] **Step 2: Source one Unsplash photo per remaining page** — use Black/Nigerian-audience subjects matching each page's theme (home: shopping/gadgets lifestyle; how-it-works: person using phone/unboxing; for-vendors: seller with products; for-buyers: happy buyer with device; tools: relevant supporting photo). For each, fetch a verified direct `images.unsplash.com/photo-...` URL (search Unsplash, confirm subject), then replace that page's plain hero `<section>` with a `<PageHero ... />`. Record chosen URLs in a comment block at top of each page for easy swapping.

- [ ] **Step 3: Verify** `npm run build`; visually confirm each hero renders the photo with readable overlay text.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)" "app/(tools)"
git commit -m "feat: photo-backdrop heroes across all pages"
```

### Task 13: Added imagery on Home, How It Works, For Vendors, Product detail

**Files:**
- Modify: `app/(marketing)/page.tsx`, `app/(marketing)/how-it-works/page.tsx`, `app/(marketing)/for-vendors/page.tsx`, `app/(marketing)/listings/[id]/page.tsx`

- [ ] **Step 1: Home** — add product/lifestyle images (verified Unsplash, on-audience) to existing feature/benefit sections using `next/image` with explicit width/height or `fill`+aspect wrapper. Keep layout; don't introduce CLS.

- [ ] **Step 2: How It Works** — add one illustrative image per step row.

- [ ] **Step 3: For Vendors** — add imagery showing a seller/small business with products.

- [ ] **Step 4: Product detail** — polish the gallery framing/trust visuals (no data change).

- [ ] **Step 5: Verify** `npm run build`; confirm images load and pages don't shift on load.

- [ ] **Step 6: Commit**

```bash
git add "app/(marketing)"
git commit -m "feat: add imagery to home, how-it-works, for-vendors, product detail"
```

---

## Phase 5 — Site-wide dark mode

### Task 14: Theme infrastructure (CSS variant, no-flash, helper)

**Files:**
- Modify: `app/globals.css`
- Create: `lib/theme.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces (`lib/theme.ts`):
  - `type ThemeChoice = 'light' | 'dark' | 'system'`
  - `getStoredTheme(): ThemeChoice`
  - `applyTheme(choice: ThemeChoice): void` (toggles `.dark` on `<html>`, considering OS when `'system'`)
  - `setTheme(choice: ThemeChoice): void` (persists to `localStorage` key `zlx_theme` + applies)
  - `resolveIsDark(choice: ThemeChoice): boolean`

- [ ] **Step 1: Add dark variant + canvas vars to `app/globals.css`** — after `@import "tailwindcss";` add:

```css
@custom-variant dark (&:where(.dark, .dark *));
```
In the `@layer base` `body` rule, drive bg/text via vars and add a dark override:
```css
:root { --page-bg: #ffffff; --page-fg: #111827; }
.dark { --page-bg: #0a0f1e; --page-fg: #e5e7eb; }
body { background: var(--page-bg); color: var(--page-fg); }
```
Add `.dark` overrides for `.post-body` (text `#cbd5e1`, headings/strong `#f1f5f9`, `hr`/`img` borders `#1f2937`, `blockquote`/`code` bg `#1e293b` with lighter text, `aside`/`.highlight` darker tints). Keep light values as-is.

- [ ] **Step 2: Implement** `lib/theme.ts`

```ts
export type ThemeChoice = 'light' | 'dark' | 'system'
const KEY = 'zlx_theme'

export function getStoredTheme(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

export function resolveIsDark(choice: ThemeChoice): boolean {
  if (choice === 'dark') return true
  if (choice === 'light') return false
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(choice: ThemeChoice): void {
  document.documentElement.classList.toggle('dark', resolveIsDark(choice))
}

export function setTheme(choice: ThemeChoice): void {
  if (choice === 'system') localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, choice)
  applyTheme(choice)
}
```

- [ ] **Step 3: No-flash script + body classes in `app/layout.tsx`** — add `suppressHydrationWarning` to `<html lang="en">`. Add to `<head>` (create a `<head>` via the App-Router-correct approach; verify in `node_modules/next/dist/docs/`) an inline script:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  try {
    var t = localStorage.getItem('zlx_theme');
    var dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
`}} />
```
Update `<body className="antialiased bg-white text-gray-900">` → `"antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100"`.

- [ ] **Step 4: Verify** `npm run build`; load the site, run `localStorage.setItem('zlx_theme','dark')` + reload → page loads dark with no flash; set `'light'` → loads light.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css lib/theme.ts app/layout.tsx
git commit -m "feat: dark mode infrastructure (variant, no-flash, theme helper)"
```

### Task 15: ThemeToggle in Navbar

**Files:**
- Create: `components/layout/ThemeToggle.tsx`
- Modify: `components/layout/Navbar.tsx`

- [ ] **Step 1: Implement** `components/layout/ThemeToggle.tsx`

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getStoredTheme, resolveIsDark, setTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => { setIsDark(resolveIsDark(getStoredTheme())) }, [])
  const toggle = () => { const next = isDark ? 'light' : 'dark'; setTheme(next); setIsDark(next === 'dark') }
  return (
    <button onClick={toggle} aria-label="Toggle dark mode"
      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

- [ ] **Step 2: Mount it** in `components/layout/Navbar.tsx` — import and place `<ThemeToggle />` in the desktop CTA row (near the Cart link, ~L245) and in the mobile icon group (~L297).

- [ ] **Step 3: Verify** `npm run build`; toggle flips theme and persists across reload.

- [ ] **Step 4: Commit**

```bash
git add components/layout/ThemeToggle.tsx components/layout/Navbar.tsx
git commit -m "feat: theme toggle in navbar"
```

### Task 16: Dark styles — layout chrome (Navbar, Footer, FloatingActions, PageLoader, WhatsAppFloat)

**Files:**
- Modify: `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`, `components/layout/FloatingActions.tsx`, `components/layout/PageLoader.tsx`, `components/layout/WhatsAppFloat.tsx`

- [ ] **Step 1: Apply the dark mapping table** (Global Constraints) to each file — every `bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`, `bg-primary-light` gets its `dark:` counterpart. In `PageLoader.tsx` change `bg-white/80` → `bg-white/80 dark:bg-gray-950/80`.

- [ ] **Step 2: Verify** `npm run build`; toggle dark and confirm header/footer/overlays read correctly (no white-on-white).

- [ ] **Step 3: Commit**

```bash
git add components/layout
git commit -m "style: dark mode for layout chrome"
```

### Task 17: Dark styles — marketing + tools pages

**Files:**
- Modify: all `app/(marketing)/**/page.tsx` and `app/(tools)/**/page.tsx` (and any local sub-components like `ListingActions`, `ShareButton`), plus `app/(marketing)/listings/page.tsx`'s remaining static sections (e.g. the `bg-gray-950` scan promo already dark — leave; the `bg-white` CTA section → add dark).

- [ ] **Step 1: Apply the mapping table** file-by-file across marketing + tools pages. Pay attention to: card surfaces (`bg-white`→`dark:bg-gray-900`), section canvases (`bg-surface`/`bg-gray-50`→`dark:bg-gray-950`), body copy, borders, and status chips. Leave `PageHero` (already dark by design) and intentionally-dark sections.

- [ ] **Step 2: Verify** `npm run build`; spot-check listings, product detail, home, how-it-works, faq, a tools page in dark mode.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)" "app/(tools)"
git commit -m "style: dark mode for marketing and tools pages"
```

### Task 18: Dark styles — dashboard, auth, and shared components

**Files:**
- Modify: `app/(dashboard)/**/page.tsx` + local components, `app/(auth)/**/page.tsx`, `components/dashboard/*`, `components/reviews/*`, `components/trust/*`

- [ ] **Step 1: Apply the mapping table** across dashboard pages, auth pages, and the `reviews`/`dashboard`/`trust` components. These are behind login but should still respect the theme for consistency.

- [ ] **Step 2: Verify** `npm run build`; log in (or load a reachable dashboard/auth page) and confirm dark legibility; run a grep to catch stragglers:

```bash
grep -rlE "bg-white([^/]|$)|text-gray-900" "app/(dashboard)" "app/(auth)" components | \
  xargs grep -L "dark:" || echo "all touched files have dark variants"
```

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)" "app/(auth)" components/dashboard components/reviews components/trust
git commit -m "style: dark mode for dashboard, auth, and shared components"
```

### Task 19: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full suite**

```bash
npm test && npm run lint && npm run build
```
Expected: tests pass, lint clean, build succeeds.

- [ ] **Step 2: Manual checklist** — in `npm run start`:
  - Filter: `/listings?category=Accessories` surfaces earpods/power banks; `Electronics` surfaces irons/appliances; `All` unchanged.
  - Supply notice: banner shows, dismiss persists across reload; `Confirmed at checkout` note next to prices.
  - Dark mode: toggle flips + persists; no first-paint flash; key pages legible both themes; blog `.post-body` readable dark.
  - SEO: `curl` a few pages → unique `<title>` + canonical; paste a product URL and `/faq` into Google's Rich Results Test → Product/FAQPage/Breadcrumb/Organization detected; `summary_large_image` in source.
  - Heroes/imagery: photo heroes render with readable overlay both themes; images load without layout shift.

- [ ] **Step 3: Final commit (if any cleanups)**

```bash
git add -A && git commit -m "chore: final cleanups for listings/dark-mode/seo release"
```

---

## Self-Review notes
- **Spec coverage:** Feature 1 → Tasks 1-2; Feature 2 → Tasks 3-4; Feature 5 (SEO/AEO) → Tasks 5-10; Feature 4 (hero/imagery) → Tasks 11-13; Feature 2 (dark mode) → Tasks 14-18; verification → Task 19. All five spec features mapped.
- **Type consistency:** `buildCategoryOrFilter`, `productSchema`/`faqSchema`/`breadcrumbSchema`/`articleSchema`/`orgSchema`/`websiteSchema`, `JsonLd({data})`, theme helpers, and `PageHero` props are used with the same signatures wherever referenced.
- **Known follow-ups requiring in-task confirmation against the codebase:** exact field names for blog posts (Task 8), FAQ Q&A array location (Task 8), Supabase image host in `next.config.ts` (Task 10), and the App-Router head/metadata mechanics (Tasks 6, 9, 14) — each task says to verify before editing.
