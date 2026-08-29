# Flagship v2 — Phase 1 (Shopping Spine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the six buyer-facing surfaces (Navbar, Footer, Home, Listings, Listing Detail, Login) as one coherent **single-retailer** experience on the Phase 0 kit, migrate them fully off legacy compat classes onto semantic tokens, and add a read-only reviews display layer.

**Architecture:** Every surface is rebuilt with the Phase 0 component library (`components/ui/`) and semantic tokens; no page keeps hardcoded `bg-white` / `text-gray-*` / `shadow-card` / `font-700`. The retailer narrative ("guaranteed or refunded", no vendors, WhatsApp order) drives copy and structure. Reviews are read-only (`lib/reviews.ts` → `reviews` table, currently empty → empty states everywhere). One choreographed Home hero; all other motion is Phase 0's restrained system.

**Tech Stack:** Next.js 16.2.6 (App Router, RSC), React 19.2, TypeScript 5, Tailwind v4, Radix + CVA, `lucide-react`, Supabase (`@supabase/ssr`), `next-themes`, `sonner`. Optionally `motion` (npm) for the hero only.

**Spec:** `docs/superpowers/specs/2026-08-29-flagship-v2-phase-1-shopping-spine-design.md` — read it before starting. Plan and spec travel together.

## Global Constraints

- **Branch:** all work on `flagship-v2` (Phase 0 done, tip `706ecf3`). Never touch `main` / `flagship-redesign`.
- **Narrative:** Zolarux is a **single trusted retailer**. No "vendor" anywhere in buyer-facing copy or UI. Trust promise = **"guaranteed or refunded"** (we inspect before dispatch → you inspect on delivery → full refund if not as described). **No escrow / protection fee** on the consumer site. Purchase = **WhatsApp** via `buildWhatsAppUrl(message)` (`WHATSAPP_NUMBER = '2347063107314'`).
- **Voice:** brand-first ("we", "Zolarux"). A single first-person founder accent on Home is allowed.
- **Supabase:** `.env.local` points at project `ugieujaerhfqomvhqoie` ("Zolarux"). Real data: 214 active products, but **0 have brand/condition/specs**, only **4** are `is_featured`, **3** have `null` price, categories are messy free text. `reviews` table exists, **0 rows**, anon can `SELECT` where `status='published'`.
- **Never render `formatPrice(null)`** → shows "₦0"/"NaN". Use the null-safe helper from Task 1.
- **Next 16 is not the Next.js you know** (`AGENTS.md`). Before editing routing / `generateMetadata` / `searchParams` / fonts, read the matching file under `node_modules/next/dist/docs/01-app/`.
- **Lint rule enforced:** "Calling setState synchronously within an effect". For scroll/observer-driven state use `useSyncExternalStore` or a DOM-dataset ref pattern (see Phase 0 `ThemeToggle.tsx` / `Reveal.tsx`), never `useEffect(() => setX(...))`.
- **No test runner.** "Verify" = the Standard Verification Cycle below.
- **Compat shim** (`app/globals.css` lines ~223–233 + `--color-accent` line ~127): trim only entries with **zero** repo-wide usage after Phase 1 (Task 14).
- **Out of scope:** Check Vendor redesign (stays, unlinked), all unbuilt pages, review submission, cart/checkout/payment, middleware, `about` / `(tools)` restyling, new identity, test framework.
- **Commit messages** end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Conventional prefixes.
- **Path alias:** `@/` → repo root.

### Standard Verification Cycle

At the end of every task, in order — any failure blocks the commit:

```bash
npx tsc --noEmit          # no errors
npm run lint              # no new errors (pre-existing <img> / unused-var warnings tolerated)
npm run build             # succeeds; sanity-check the route table
```

Then for any task with rendered UI, `npm run dev` and, at **375 / 768 / 1280 px** in **light and dark**:
- The changed surface renders with **real data** (products load — no "table not found").
- No hardcoded-class leftovers: no element visibly stuck light-on-dark or vice-versa.
- Keyboard: `Tab` reaches every control, focus ring visible.
- Empty / error / `null`-price states render sanely.
- Any animation degrades to end-state under OS "reduce motion".

---

## File Structure

**Created:**
- `types/review.ts` — `Review` type.
- `lib/reviews.ts` — read-only review helpers.
- `components/ui/StarRating.tsx`, `ReviewCard.tsx`, `ReviewSummary.tsx`.
- `components/ui/ProductReviews.tsx` — server component, Listing-Detail reviews section.
- `components/marketing/HeroSequence.tsx` — client, choreographed Home hero.
- `components/marketing/GuaranteeSteps.tsx` — the "how the guarantee works" beats (shared shape, used on Home).

**Modified:**
- `lib/constants.ts` — nav restructure, prune vendor/tool constants, real categories.
- `lib/utils.ts` — add `formatPriceMaybe`.
- `lib/products.ts` — add `getNewArrivals`.
- `types/product.ts` — nullability fixes.
- `components/ui/ProductCard.tsx` — retailer refit.
- `components/ui/index.ts` — barrel: add reviews components.
- `components/layout/Navbar.tsx` — full rebuild.
- `components/layout/Footer.tsx` — full rebuild.
- `app/(marketing)/page.tsx` — full restructure.
- `app/(marketing)/listings/page.tsx` — redesign.
- `app/(marketing)/listings/[id]/page.tsx` — redesign.
- `app/(auth)/login/page.tsx` — redesign.
- `app/(auth)/layout.tsx` — token migration.
- `app/globals.css` — trim compat shim (Task 14).

---

## Task 1: Data types, constants prune, price helper, `getNewArrivals`

**Files:**
- Modify: `types/product.ts`, `lib/utils.ts`, `lib/products.ts`, `lib/constants.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `formatPriceMaybe(price: number | null | undefined): string | null` (`@/lib/utils`) — `formatPrice(price)` when `price` is a finite number `> 0`, else `null`.
  - `getNewArrivals(limit?: number): Promise<Product[]>` (`@/lib/products`) — `is_active` products ordered by `created_at` desc, default limit 8.
  - `LISTING_CATEGORIES` (`@/lib/constants`) — updated to real categories: `['All', 'Phones & Tablets', 'Laptops & Computers', 'Accessories', 'Home & Kitchen', 'Gaming', 'Cameras & Photography'] as const`.
  - `SHOP_MENU` (`@/lib/constants`) — `{ label: string; href: string }[]` for the Navbar/Footer Shop menu (categories minus "All", plus "New arrivals" → `/listings?sort=newest`, "Under ₦200k" → `/listings?maxPrice=200000`).
  - `NAV_LINKS` (`@/lib/constants`) — replaced: `[{ label: 'The Guarantee', href: '/#the-guarantee' }, { label: 'Reviews', href: '/#reviews' }, { label: 'About', href: '/about' }] as const`.
  - `Product` type: `price: number | null`, `description: string | null`, `image_url: string | null`, `vendor_id: string | null`, `vendor_name: string | null`, `is_featured: boolean | null`.
- Removed: `TRUST_TOOLS`, `VENDOR_CATEGORIES` from `lib/constants.ts`. `VENDOR_STATUS_MAP` **kept** with a comment (still used by the unlinked `check-vendor` page).

- [ ] **Step 1: `types/product.ts` — nullability**

```ts
export type PricingType = 'fixed' | 'quote'
export type ProductCondition = 'new' | 'uk_used' | 'refurbished' | 'used'

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  pricing_type: PricingType
  image_url: string | null
  main_image_url: string | null
  image_urls: string[]
  video_urls: string[]
  category: string
  brand: string | null
  condition: ProductCondition | null
  specs: ProductSpec[] | null
  vendor_id: string | null
  vendor_name: string | null
  is_active: boolean
  is_featured: boolean | null
  created_at?: string
}
```

- [ ] **Step 2: `lib/utils.ts` — add `formatPriceMaybe` after `formatPrice`**

```ts
export function formatPriceMaybe(price: number | null | undefined): string | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null
  return formatPrice(price)
}
```

- [ ] **Step 3: `lib/products.ts` — add `getNewArrivals`** (after `getFeaturedProducts`)

```ts
export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('New arrivals fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}
```

- [ ] **Step 4: `lib/constants.ts` — nav + categories + prune**

Replace `LISTING_CATEGORIES`:

```ts
export const LISTING_CATEGORIES = [
  'All',
  'Phones & Tablets',
  'Laptops & Computers',
  'Accessories',
  'Home & Kitchen',
  'Gaming',
  'Cameras & Photography',
] as const
export type ListingCategory = typeof LISTING_CATEGORIES[number]
```

Replace `NAV_LINKS` and add `SHOP_MENU`:

```ts
export const NAV_LINKS = [
  { label: 'The Guarantee', href: '/#the-guarantee' },
  { label: 'Reviews',       href: '/#reviews' },
  { label: 'About',         href: '/about' },
] as const

export const SHOP_MENU = [
  { label: 'Phones & Tablets',     href: '/listings?category=Phones+%26+Tablets' },
  { label: 'Laptops & Computers',  href: '/listings?category=Laptops+%26+Computers' },
  { label: 'Accessories',          href: '/listings?category=Accessories' },
  { label: 'Home & Kitchen',       href: '/listings?category=Home+%26+Kitchen' },
  { label: 'Gaming',               href: '/listings?category=Gaming' },
  { label: 'New arrivals',         href: '/listings?sort=newest' },
  { label: 'Under ₦200k',          href: '/listings?maxPrice=200000' },
] as const
```

Delete the `TRUST_TOOLS` and `VENDOR_CATEGORIES` exports. Above `VENDOR_STATUS_MAP` add:

```ts
// Kept only for the unlinked app/(tools)/check-vendor page (out of Phase 1 scope).
export const VENDOR_STATUS_MAP = { /* ...unchanged... */ } as const
```

Leave `CONDITION_MAP`, `LISTING_SORT_OPTIONS`, `PRODUCT_CONDITIONS`, `ORDER_PIPELINE`, `WHATSAPP_NUMBER`, `SITE_*` untouched.

- [ ] **Step 5: Fix fallout**

`npx tsc --noEmit` will flag every remaining `TRUST_TOOLS` / `VENDOR_CATEGORIES` importer and every `NAV_LINKS` shape mismatch. Expected hits: `components/layout/Navbar.tsx`, `components/layout/Footer.tsx` (both fully rebuilt in Tasks 5–6 — for now just make them compile: comment out the broken blocks or leave them; the rebuild replaces the files entirely). If `check-vendor/page.tsx` imports `TRUST_TOOLS`, it does not — verify with `grep -rn "TRUST_TOOLS\|VENDOR_CATEGORIES" app components`.

To keep this task green without rebuilding Navbar/Footer yet: in `Navbar.tsx` and `Footer.tsx`, replace the now-broken `SAFETY_TOOLS`/`FOOTER_LINKS` constant references with minimal stubs so `tsc`/`build` pass. These files are thrown away in Tasks 5–6.

- [ ] **Step 6: Verify**

`npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeds. `npm run dev`, open `/listings` — real products still load (the category strip may show new labels; filtering still works via `ilike`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(phase-1): retailer constants, nullable Product fields, price helper, getNewArrivals

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Reviews data layer — `types/review.ts` + `lib/reviews.ts`

**Files:**
- Create: `types/review.ts`, `lib/reviews.ts`

**Interfaces:**
- Consumes: `@/lib/supabase/server` (`createClient`, async).
- Produces:
  - `Review` (`@/types/review`) — `{ id: string; rating: 1 | 2 | 3 | 4 | 5; body: string | null; created_at: string }`.
  - `ReviewBundle` — `{ reviews: Review[]; average: number; count: number; distribution: Record<1|2|3|4|5, number> }`.
  - `getProductReviews(productId: string): Promise<ReviewBundle>` (`@/lib/reviews`).
  - `getReviewSummary(): Promise<{ average: number; count: number }>` (`@/lib/reviews`).

- [ ] **Step 1: `types/review.ts`**

```ts
export type ReviewRating = 1 | 2 | 3 | 4 | 5

export interface Review {
  id: string
  rating: ReviewRating
  body: string | null
  created_at: string
}
```

- [ ] **Step 2: `lib/reviews.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import type { Review, ReviewRating } from '@/types/review'

export interface ReviewBundle {
  reviews: Review[]
  average: number
  count: number
  distribution: Record<ReviewRating, number>
}

const EMPTY_DISTRIBUTION: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

interface RawReviewRow {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

function toReview(row: RawReviewRow): Review {
  const rating = Math.min(5, Math.max(1, Math.round(row.rating))) as ReviewRating
  return { id: row.id, rating, body: row.comment, created_at: row.created_at }
}

/** Published reviews for one product (listing_id === productId). Empty on any error. */
export async function getProductReviews(productId: string): Promise<ReviewBundle> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('listing_id', productId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error || !data) {
    if (error) console.error('Product reviews fetch error:', error)
    return { reviews: [], average: 0, count: 0, distribution: { ...EMPTY_DISTRIBUTION } }
  }

  const reviews = (data as RawReviewRow[]).map(toReview)
  const distribution = { ...EMPTY_DISTRIBUTION }
  let sum = 0
  for (const r of reviews) {
    distribution[r.rating] += 1
    sum += r.rating
  }
  const count = reviews.length
  const average = count > 0 ? sum / count : 0
  return { reviews, average, count, distribution }
}

/** Site-wide published-review summary for the Home proof section. */
export async function getReviewSummary(): Promise<{ average: number; count: number }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'published')

  if (error || !data) {
    if (error) console.error('Review summary fetch error:', error)
    return { average: 0, count: 0 }
  }
  const rows = data as { rating: number }[]
  const count = rows.length
  if (count === 0) return { average: 0, count: 0 }
  const average = rows.reduce((a, r) => a + r.rating, 0) / count
  return { average, count }
}
```

- [ ] **Step 3: Verify the query shape against the real (empty) table**

`npm run dev`, then in a scratch route or via the Supabase MCP confirm the select compiles server-side. Minimal check: temporarily add to `app/(marketing)/page.tsx` a `const s = await getReviewSummary(); console.log('review summary', s)` — reload `/`, expect `{ average: 0, count: 0 }` in the dev server log, **no error**. Remove the console line.

- [ ] **Step 4: Standard Verification Cycle** (tsc/lint/build).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(reviews): read-only lib/reviews.ts + Review type

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Review display components — `StarRating`, `ReviewCard`, `ReviewSummary`

**Files:**
- Create: `components/ui/StarRating.tsx`, `components/ui/ReviewCard.tsx`, `components/ui/ReviewSummary.tsx`
- Modify: `components/ui/index.ts`

**Interfaces:**
- Consumes: `cn`, `lucide-react` (`Star`), `@/types/review`, `formatDate` (`@/lib/utils`), `ReviewBundle` (`@/lib/reviews`).
- Produces:
  - `StarRating` — `{ value: number; size?: number; className?: string; 'aria-hidden'?: boolean }`. Renders 5 stars, partial fill for the fractional star via a clipped overlay. Decorative by default; if a label is needed the parent adds it.
  - `ReviewCard` — `{ review: Review }`. "Verified buyer" + relative-ish date + `StarRating` + body.
  - `ReviewSummary` — `{ average: number; count: number; distribution?: Record<1|2|3|4|5, number>; compact?: boolean }`. `compact` = one-line (avg + stars + "(N reviews)"); full = big number + stars + distribution bars. Renders `null` if `count === 0`.

- [ ] **Step 1: `components/ui/StarRating.tsx`**

```tsx
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  value,
  size = 16,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  const clamped = Math.min(5, Math.max(0, value))
  const pct = (clamped / 5) * 100
  return (
    <span className={cn('relative inline-flex', className)} role="img" aria-label={`${clamped.toFixed(1)} out of 5 stars`}>
      <span className="inline-flex text-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="fill-current" aria-hidden />
        ))}
      </span>
      <span
        className="absolute inset-0 inline-flex overflow-hidden text-action"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} className="shrink-0 fill-current" />
        ))}
      </span>
    </span>
  )
}
```

- [ ] **Step 2: `components/ui/ReviewCard.tsx`**

```tsx
import { BadgeCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StarRating } from './StarRating'
import type { Review } from '@/types/review'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="border-b border-line py-5 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <StarRating value={review.rating} size={15} />
        <span className="inline-flex items-center gap-1 font-body text-xs text-verified">
          <BadgeCheck size={13} />
          Verified buyer
        </span>
        <span className="ml-auto font-body text-xs text-ink-soft">{formatDate(review.created_at)}</span>
      </div>
      {review.body && <p className="font-body text-sm leading-relaxed text-ink-soft">{review.body}</p>}
    </article>
  )
}
```

- [ ] **Step 3: `components/ui/ReviewSummary.tsx`**

```tsx
import type { ReviewRating } from '@/types/review'
import { StarRating } from './StarRating'
import { cn } from '@/lib/utils'

export function ReviewSummary({
  average,
  count,
  distribution,
  compact = false,
}: {
  average: number
  count: number
  distribution?: Record<ReviewRating, number>
  compact?: boolean
}) {
  if (count === 0) return null

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 font-body text-sm text-ink">
        <span className="font-600">{average.toFixed(1)}</span>
        <StarRating value={average} size={15} />
        <span className="text-ink-soft">({count} review{count === 1 ? '' : 's'})</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="text-center sm:text-left">
        <p className="font-display text-5xl font-extrabold text-ink [font-variant-numeric:tabular-nums]">
          {average.toFixed(1)}
        </p>
        <StarRating value={average} size={18} className="mt-1" />
        <p className="mt-1 font-body text-sm text-ink-soft">{count} review{count === 1 ? '' : 's'}</p>
      </div>
      {distribution && (
        <div className="flex-1 space-y-1.5">
          {([5, 4, 3, 2, 1] as ReviewRating[]).map((star) => {
            const n = distribution[star] ?? 0
            const pct = count > 0 ? (n / count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 font-body text-xs text-ink-soft">
                <span className="w-3 tabular-nums">{star}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-pill bg-line">
                  <span className={cn('block h-full rounded-pill bg-action')} style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Barrel — append to `components/ui/index.ts`**

```ts
export { StarRating } from './StarRating'
export { ReviewCard } from './ReviewCard'
export { ReviewSummary } from './ReviewSummary'
```

- [ ] **Step 5: Add a `/dev/ui` section** (`app/dev/ui/page.tsx`; import `{ StarRating, ReviewCard, ReviewSummary }`)

```tsx
        <section id="reviews-ui">
          <h2 className="mb-4 text-xl">Reviews (display)</h2>
          <div className="space-y-4">
            <StarRating value={4.3} size={20} />
            <ReviewSummary average={4.6} count={87} distribution={{ 1: 2, 2: 3, 3: 6, 4: 20, 5: 56 }} />
            <ReviewSummary average={4.6} count={87} compact />
            <div className="max-w-lg">
              <ReviewCard review={{ id: 'x', rating: 5, body: 'Exactly as described. Fast delivery to Lagos.', created_at: '2026-07-14T10:00:00Z' }} />
              <ReviewCard review={{ id: 'y', rating: 4, body: null, created_at: '2026-06-02T10:00:00Z' }} />
            </div>
          </div>
        </section>
```

- [ ] **Step 6: Standard Verification Cycle** — partial star clip renders correctly in both themes; `ReviewSummary count={0}` renders nothing (test by temporarily passing 0).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(reviews): StarRating, ReviewCard, ReviewSummary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `ProductCard` — retailer refit

**Files:**
- Modify: `components/ui/ProductCard.tsx`

**Interfaces:**
- Consumes: `Card` (Phase 0), `Badge` (Phase 0), `formatPriceMaybe` (Task 1), `buildWhatsAppUrl`, `cn`, `Product`.
- Produces: `ProductCard` — unchanged signature `{ product: Product }`.

- [ ] **Step 1: Rewrite `components/ui/ProductCard.tsx`**

```tsx
import Link from 'next/link'
import { MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react'
import { formatPriceMaybe, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const price = formatPriceMaybe(product.price)
  const whatsappMsg = `Hi Zolarux, I'd like to order: ${product.name}${price ? ` (${price})` : ''}. Is it available?`

  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <Link
        href={`/listings/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-primary-soft"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={32} className="text-ink-soft" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_featured && <Badge variant="featured" />}
          {product.condition && <Badge variant="condition" condition={product.condition} />}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 font-display text-sm font-bold text-ink transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 inline-flex items-center gap-1 text-xs text-ink-soft">
          <ShieldCheck size={12} className="text-verified" />
          Inspected by Zolarux
        </p>

        <div className="mt-auto flex items-center justify-between">
          {price ? (
            <span className="font-display text-base font-extrabold text-ink [font-variant-numeric:tabular-nums]">
              {price}
            </span>
          ) : (
            <span className="text-sm font-bold text-primary">Price on request</span>
          )}
          <Link
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            title="Order on WhatsApp"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-verified text-white transition-micro hover:brightness-110"
          >
            <MessageCircle size={14} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Standard Verification Cycle** — on `/listings` and `/` (featured rail): cards show real products, "Inspected by Zolarux" line, no "Verified Vendor" badge, `null`-price products show "Price on request", long names clamp to 2 lines. Both themes.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "refactor(ui): ProductCard retailer refit — drop vendor badge, null-safe price

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Navbar rebuild

**Files:**
- Rewrite: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS`, `SHOP_MENU` (Task 1), `Button` / `IconButton` / `Sheet` / `SheetTrigger` / `SheetContent` / `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` / `ThemeToggle` (Phase 0), `buildWhatsAppUrl`, `cn`, `usePathname`.
- Produces: default-exported `Navbar` (client component), height **`h-16`** (the `(marketing)/layout.tsx` `pt-16` depends on this — keep it).

- [ ] **Step 1: Read the Next.js linking doc**

Read `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — confirm `<Link>` usage and hash-anchor behaviour (`/#the-guarantee` from another route scrolls after navigation).

- [ ] **Step 2: Rewrite `components/layout/Navbar.tsx`**

```tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown, MessageCircle } from 'lucide-react'
import { cn, buildWhatsAppUrl } from '@/lib/utils'
import { NAV_LINKS, SHOP_MENU } from '@/lib/constants'
import {
  Button,
  IconButton,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ThemeToggle,
} from '@/components/ui'

const emptySubscribe = () => () => {}
function useMounted() {
  return React.useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const WA_HREF = buildWhatsAppUrl("Hi Zolarux, I'd like to order a gadget.")

export default function Navbar() {
  const pathname = usePathname()
  const mounted = useMounted()

  // Close the mobile sheet on route change — render-time adjustment, no effect setState.
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [prevPath, setPrevPath] = React.useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    if (sheetOpen) setSheetOpen(false)
  }

  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-16 border-b transition-micro',
        // On the home hero the bar is subtle; elsewhere it's a solid elevated surface.
        mounted && isHome
          ? 'border-transparent bg-background/70 backdrop-blur-md'
          : 'border-line bg-surface-raised/90 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-extrabold text-on-primary">
            Z
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">Zolarux</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-md px-3.5 py-2 font-body text-sm font-500 text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Shop <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56">
              {SHOP_MENU.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 font-body text-sm font-500 text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md px-3 py-2 font-body text-sm font-500 text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              Order on WhatsApp
            </a>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <IconButton label="Open menu" variant="ghost">
                <Menu size={20} />
              </IconButton>
            </SheetTrigger>
            <SheetContent side="right" title="Menu">
              <nav className="flex flex-col gap-1">
                <p className="px-1 pt-2 font-body text-xs font-600 uppercase tracking-wider text-ink-soft">Shop</p>
                {SHOP_MENU.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <p className="px-1 pt-4 font-body text-xs font-600 uppercase tracking-wider text-ink-soft">More</p>
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link href="/login" className="rounded-md px-1 py-2.5 font-body text-sm text-ink">Sign in</Link>
                </SheetClose>
                <Button asChild className="mt-4">
                  <a href={WA_HREF} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} />
                    Order on WhatsApp
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
```

> Note: the "transparent over hero" effect here is simplified to *mounted && isHome* rather than a scroll observer — the home hero is dark/blue so a translucent bar reads fine at any scroll position, and this avoids a scroll listener entirely. If a scroll-aware variant is wanted later it uses an `IntersectionObserver` on a hero sentinel with `useSyncExternalStore`, never `useEffect` setState.

- [ ] **Step 3: Standard Verification Cycle** — desktop: Shop dropdown opens (keyboard + click), links go to the right filtered `/listings`, "Order on WhatsApp" opens `wa.me`. Mobile: Sheet opens from the right, closes on nav, theme toggle works. On `/` the bar is translucent; on `/about` / `/listings` it's solid. Both themes, no hardcoded-class leftovers.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(layout): rebuild Navbar on the kit — Shop menu, WhatsApp CTA, no vendors

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Footer rebuild

**Files:**
- Rewrite: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `SHOP_MENU`, `NAV_LINKS` (Task 1), `buildWhatsAppUrl`, `lucide-react`.
- Produces: default-exported `Footer` (server component).

**Note:** only these routes exist on `flagship-v2`: `/`, `/about`, `/listings`, `/listings/[id]`, `/login`, `/check-vendor` (unlinked). **Do not link to `/privacy`, `/terms`, `/refund-policy`, `/faq`, `/blog`, `/contact`, `/how-it-works`, `/downloads`, `/for-*` — they 404.**

- [ ] **Step 1: Rewrite `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'
import { SHOP_MENU, NAV_LINKS } from '@/lib/constants'

const WA_HREF = buildWhatsAppUrl("Hi Zolarux, I have a question about an order.")

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-extrabold text-on-primary">Z</span>
            <span className="font-display text-lg font-bold text-ink">Zolarux</span>
          </Link>
          <p className="mb-5 max-w-xs font-body text-sm leading-relaxed text-ink-soft">
            Phones, laptops and gadgets you can trust. We inspect every unit before it ships —
            you inspect it on delivery. Not as described? Full refund.
          </p>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-500 text-verified transition-micro hover:brightness-110"
          >
            <MessageCircle size={16} />
            Chat with us on WhatsApp
          </a>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Shop</h4>
          <ul className="space-y-2.5">
            {SHOP_MENU.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-body text-sm text-ink-soft transition-micro hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Zolarux</h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-body text-sm text-ink-soft transition-micro hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="font-body text-sm text-ink-soft transition-micro hover:text-ink">Sign in</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="font-body text-sm text-ink-soft">© {year} Zolarux. All rights reserved.</p>
          <p className="inline-flex items-center gap-2 font-body text-sm text-ink-soft">
            <ShieldCheck size={14} className="text-verified" />
            Inspected before dispatch · Guaranteed or refunded
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Standard Verification Cycle** — every footer link resolves (no 404s), both themes, mobile stack.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(layout): rebuild Footer on tokens — retailer links only, no dead routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Home — hero + page skeleton

**Files:**
- Create: `components/marketing/HeroSequence.tsx`
- Rewrite: `app/(marketing)/page.tsx` (skeleton + hero; sections 2–6 land in Tasks 8–9)

**Interfaces:**
- Consumes: `getFeaturedProducts`, `getNewArrivals` (Task 1), `getReviewSummary` (Task 2), `formatPriceMaybe`, `Button`, `Reveal`.
- Produces:
  - `HeroSequence` (`components/marketing/HeroSequence.tsx`) — `{ product: { id: string; name: string; imageUrl: string | null; price: string | null } | null }`, `"use client"`. Renders the hero headline / copy / CTAs / hero product card with a choreographed entrance.
  - `app/(marketing)/page.tsx` — `export default async function HomePage()`, fetches `featured`, `newArrivals`, `reviewSummary` once at the top; renders `<HeroSequence>` + placeholder `<section>`s with the final `id`s (`the-guarantee`, `reviews`).

- [ ] **Step 1: Read the Next.js fonts + CSS docs if touching either** — the hero uses existing tokens/fonts only; no change needed. Skip if so.

- [ ] **Step 2: Decide the motion approach**

Try CSS-only first (keyframe classes + `animation-delay`). Build Step 3's `HeroSequence` with CSS animations defined inline in the component via a `<style>`-free approach — use Tailwind arbitrary animation or add three keyframes to `globals.css` under `@layer utilities`:

```css
  @keyframes heroRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  .hero-rise { animation: heroRise .7s var(--ease-out) both; }
```

If the staggered sequence (headline → product → proof) reads well with `animation-delay` alone, **do not add `motion`**. Only if you need spring physics or scroll-linked control: `npm install motion` and import `{ motion }` from `'motion/react'` **only** in `HeroSequence.tsx`. Record the decision in the commit message.

- [ ] **Step 3: `components/marketing/HeroSequence.tsx`** (CSS-first version)

```tsx
'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'

interface HeroProduct {
  id: string
  name: string
  imageUrl: string | null
  price: string | null
}

export function HeroSequence({ product }: { product: HeroProduct | null }) {
  return (
    <section className="relative overflow-hidden bg-primary text-on-primary">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <div className="absolute -right-24 -top-24 h-[36rem] w-[36rem] rounded-pill bg-on-primary/30 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-[24rem] w-[24rem] rounded-pill bg-action/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-32">
        <div>
          <p className="hero-rise mb-6 inline-flex items-center gap-2 rounded-pill border border-on-primary/20 bg-on-primary/10 px-3 py-1.5 font-body text-xs font-500">
            <ShieldCheck size={13} />
            Guaranteed or refunded — every order
          </p>
          <h1
            className="hero-rise font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            Buy the gadget.<br />Skip the gamble.
          </h1>
          <p
            className="hero-rise mt-5 max-w-lg font-body text-lg leading-relaxed text-on-primary/80"
            style={{ animationDelay: '160ms' }}
          >
            We source and inspect every phone, laptop and accessory before it ships.
            You check it on delivery. If it&apos;s not exactly as described, you get a full refund.
          </p>
          <div className="hero-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings">Shop gadgets <ArrowRight size={18} /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-on-primary hover:bg-on-primary/10">
              <Link href="/#the-guarantee">How the guarantee works</Link>
            </Button>
          </div>
        </div>

        {product && (
          <Link
            href={`/listings/${product.id}`}
            className="hero-rise group block overflow-hidden rounded-lg border border-on-primary/15 bg-on-primary/5 backdrop-blur-sm"
            style={{ animationDelay: '200ms' }}
          >
            <div className="aspect-[4/3] overflow-hidden bg-on-primary/10">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <span className="line-clamp-1 font-display text-sm font-bold">{product.name}</span>
              {product.price && (
                <span className="shrink-0 font-display text-sm font-extrabold [font-variant-numeric:tabular-nums]">
                  {product.price}
                </span>
              )}
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Add the reduced-motion guard for `.hero-rise`**

The Phase 0 global `@media (prefers-reduced-motion: reduce)` block already zeroes `animation-duration` — confirm `.hero-rise` elements are visible (not stuck at `opacity: 0`) under reduce-motion. The `both` fill-mode + zeroed duration lands them at the end state. Verify in Step 7.

- [ ] **Step 5: `app/(marketing)/page.tsx` — skeleton + hero**

```tsx
import type { Metadata } from 'next'
import { getFeaturedProducts, getNewArrivals } from '@/lib/products'
import { getReviewSummary } from '@/lib/reviews'
import { formatPriceMaybe } from '@/lib/utils'
import { HeroSequence } from '@/components/marketing/HeroSequence'

export const metadata: Metadata = {
  title: 'Zolarux — Buy phones, laptops & gadgets you can trust',
  description:
    'We source and inspect every gadget before it ships. You inspect it on delivery. Not as described? Full refund. Order on WhatsApp.',
}

export default async function HomePage() {
  const [featured, newArrivals, reviewSummary] = await Promise.all([
    getFeaturedProducts(4),
    getNewArrivals(8),
    getReviewSummary(),
  ])

  const heroProduct = (featured[0] ?? newArrivals[0]) || null
  const hero = heroProduct
    ? {
        id: heroProduct.id,
        name: heroProduct.name,
        imageUrl: heroProduct.main_image_url || heroProduct.image_url || heroProduct.image_urls?.[0] || null,
        price: formatPriceMaybe(heroProduct.price),
      }
    : null

  return (
    <div className="overflow-x-hidden">
      <HeroSequence product={hero} />

      {/* Task 8: new-arrivals rail */}
      {/* Task 8: <section id="the-guarantee"> */}
      {/* Task 9: <section id="reviews"> proof */}
      {/* Task 9: shop by category */}
      {/* Task 9: CTA band */}
    </div>
  )
}
```

- [ ] **Step 6: Standard Verification Cycle** — `/` loads, hero renders with a real featured product, the staggered entrance plays once on load, CTAs link correctly, translucent Navbar sits over it. Dark theme: hero stays blue (it's a committed-color section — `bg-primary` + `text-on-primary`), legible. Reduce-motion: content visible immediately.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(home): cinematic hero + page skeleton (CSS-only motion)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Home — new-arrivals rail + "The Guarantee" section

**Files:**
- Create: `components/marketing/GuaranteeSteps.tsx`
- Modify: `app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `ProductCard`, `Reveal`, `Button`, `lucide-react`; `newArrivals: Product[]` from the page.
- Produces: `GuaranteeSteps` (`components/marketing/GuaranteeSteps.tsx`) — no props, renders the 4 guarantee beats. Server component.

- [ ] **Step 1: `components/marketing/GuaranteeSteps.tsx`**

```tsx
import { PackageSearch, Camera, MessageCircle, BadgeCheck } from 'lucide-react'

const BEATS = [
  {
    icon: PackageSearch,
    title: 'We source & inspect every unit',
    body: 'Function, battery health, IMEI and cosmetic grade — checked before anything is listed for you.',
  },
  {
    icon: Camera,
    title: 'You see the real thing',
    body: 'Actual photos of the actual unit, honest condition notes, and full specs. No stock images.',
  },
  {
    icon: MessageCircle,
    title: 'Order on WhatsApp, then we ship',
    body: 'Message us to confirm stock and details. Pay, and your gadget is on its way.',
  },
  {
    icon: BadgeCheck,
    title: "Inspect on delivery — refund if it's wrong",
    body: 'Check it in hand. If it is not exactly as described, you get a full refund. No argument.',
  },
] as const

export function GuaranteeSteps() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {BEATS.map((beat) => {
        const Icon = beat.icon
        return (
          <div key={beat.title} className="rounded-md border border-line bg-surface p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Icon size={20} />
            </div>
            <h3 className="mb-2 font-display text-base font-bold text-ink">{beat.title}</h3>
            <p className="font-body text-sm leading-relaxed text-ink-soft">{beat.body}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Insert the two sections into `app/(marketing)/page.tsx`** (after `<HeroSequence>`, add imports for `ProductCard`, `Reveal`, `GuaranteeSteps`, `Link`, `ArrowRight`)

```tsx
      {newArrivals.length > 0 && (
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">New arrivals</h2>
                <p className="mt-1 font-body text-ink-soft">Fresh stock, inspected and ready to ship.</p>
              </div>
              <Link href="/listings" className="hidden shrink-0 items-center gap-1 font-body text-sm font-600 text-primary transition-micro hover:gap-2 sm:inline-flex">
                Shop all <ArrowRight size={15} />
              </Link>
            </div>
            <Reveal>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newArrivals.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section id="the-guarantee" className="scroll-mt-20 bg-section py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-body text-xs font-600 uppercase tracking-[0.16em] text-primary">The Zolarux guarantee</p>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              You should never have to gamble on a gadget.
            </h2>
            <p className="mt-3 font-body text-lg text-ink-soft">
              Here is exactly what happens between you finding something and you being happy with it.
            </p>
          </div>
          <Reveal><GuaranteeSteps /></Reveal>
          <p className="mt-10 font-display text-xl font-bold text-ink">
            If it is not exactly as described, you get a full refund. Every time.
          </p>
        </div>
      </section>
```

- [ ] **Step 3: Standard Verification Cycle** — rail shows 4 real products; guarantee section on `--color-section` band reads in both themes; `/#the-guarantee` from the Navbar scrolls here with `scroll-mt-20` offset clear of the fixed Navbar; `Reveal` fires once.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(home): new-arrivals rail + The Guarantee section

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Home — proof, shop-by-category, CTA band, remove cut sections

**Files:**
- Modify: `app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `StatTile`, `ReviewSummary` (Task 3), `Reveal`, `Card`, `Link`; `reviewSummary` from the page.
- Produces: the finished Home page. Placeholder stats + testimonials (spec §17 — real content dropped in later).

- [ ] **Step 1: Add the proof section** (`id="reviews"`), after the guarantee section. Import `StatTile`, `ReviewSummary`.

```tsx
      <section id="reviews" className="scroll-mt-20 bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-lg bg-primary p-8 sm:grid-cols-4 sm:p-10">
            <StatTile value="₦2M+" label="Protected in orders" variant="dark" />
            <StatTile value="100+" label="Gadgets delivered" variant="dark" />
            <StatTile value="0" label="Confirmed scams" variant="dark" />
            <StatTile value="5 yrs" label="Doing this" variant="dark" />
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">What buyers say</h2>
            {reviewSummary.count > 0 && (
              <div className="mt-3">
                <ReviewSummary average={reviewSummary.average} count={reviewSummary.count} compact />
              </div>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                { quote: 'Ordered a UK-used MacBook. It arrived exactly as described — I checked it fully before paying the delivery guy. Smooth.', name: 'Adebayo O.', city: 'Abuja' },
                { quote: 'I was nervous buying a phone online after being scammed once. Zolarux let me inspect first. That changed everything.', name: 'Chioma N.', city: 'Lagos' },
                { quote: 'Fast replies on WhatsApp, honest about a small scratch before I ordered. Will buy again.', name: 'Tunde M.', city: 'Port Harcourt' },
              ].map((t, i) => (
                <Card key={i}>
                  <div className="p-6">
                    <p className="font-body text-sm leading-relaxed text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-4 font-body text-sm font-600 text-ink">{t.name} · {t.city}</p>
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-4 font-body text-xs text-ink-soft">Placeholder — replace with real buyer quotes (spec §17).</p>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Add shop-by-category** (import `LISTING_CATEGORIES` from `@/lib/constants`, `lucide-react` icons)

```tsx
      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 font-display text-2xl font-extrabold text-ink sm:text-3xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {LISTING_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <Link
                key={cat}
                href={`/listings?category=${encodeURIComponent(cat)}`}
                className="rounded-md border border-line bg-surface p-5 text-center font-display text-sm font-bold text-ink transition-lift hover-lift"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
```

- [ ] **Step 3: Add the CTA band**

```tsx
      <section className="bg-primary py-16 text-on-primary sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Ready to buy without the anxiety?</h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-lg text-on-primary/80">
            Browse the catalogue. Every unit is inspected. Every order is guaranteed or refunded.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings">Shop gadgets <ArrowRight size={18} /></Link>
            </Button>
          </div>
        </div>
      </section>
```

- [ ] **Step 4: Delete the placeholder comments; confirm nothing from the old Home survived** — grep `app/(marketing)/page.tsx` for `vendor`, `escrow`, `check-vendor`, `for-vendors`, `bg-gray-950`, `bg-white`, `text-gray-`, `shadow-card`, `font-800`, `SAFETY_TOOLS`, `TESTIMONIALS` (the old vendor ones), `Get the App`. Zero hits.

- [ ] **Step 5: Standard Verification Cycle** — full Home scroll in both themes at 3 widths: hero → new arrivals → guarantee → proof (stats band + 3 testimonial cards) → categories → CTA. `/#reviews` scrolls to the proof section. No dead links, no untokenised elements. `reviewSummary.count === 0` → the compact `ReviewSummary` is absent (correct).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(home): proof, shop-by-category, CTA band — Home restructure complete

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Listings redesign

**Files:**
- Rewrite: `app/(marketing)/listings/page.tsx`

**Interfaces:**
- Consumes: `getListings`, `LISTINGS_PAGE_SIZE` (existing), `LISTING_CATEGORIES` (Task 1), `FilterBar` / `ProductCard` / `Pagination` / `Reveal` / `Button` (Phase 0 + Task 4), `buildWhatsAppUrl`, `ListingSort`.
- Produces: the redesigned Listings page. Server component, `searchParams` Promise (Next 16).

- [ ] **Step 1: Read `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`** for the `searchParams` Promise shape in Next 16 (already used in the current file — confirm unchanged).

- [ ] **Step 2: Rewrite `app/(marketing)/listings/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageCircle } from 'lucide-react'
import { getListings, LISTINGS_PAGE_SIZE } from '@/lib/products'
import { buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES, type ListingSort } from '@/lib/constants'
import { FilterBar } from '@/components/ui/FilterBar'
import { ProductCard } from '@/components/ui/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Shop all gadgets',
  description:
    'Browse phones, laptops and gadgets from Zolarux. Every unit is inspected before dispatch — guaranteed or refunded.',
}

interface ListingsPageProps {
  searchParams: Promise<{
    category?: string; page?: string; search?: string; brand?: string
    condition?: string; minPrice?: string; maxPrice?: string; sort?: string
  }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const activeCategory = params.category || 'All'
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const hasActiveFilters = Boolean(
    params.search || params.brand || params.condition || params.minPrice || params.maxPrice
  )

  const { products, total } = await getListings({
    category: activeCategory,
    page: currentPage,
    search: params.search,
    brand: params.brand,
    condition: params.condition,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: params.sort as ListingSort | undefined,
  })
  const totalPages = Math.ceil(total / LISTINGS_PAGE_SIZE)

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams()
    const merged: Record<string, string | number | undefined> = {
      category: activeCategory !== 'All' ? activeCategory : undefined,
      search: params.search, brand: params.brand, condition: params.condition,
      minPrice: params.minPrice, maxPrice: params.maxPrice, sort: params.sort,
      ...overrides,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
    }
    const s = qs.toString()
    return `/listings${s ? `?${s}` : ''}`
  }

  return (
    <div className="bg-background">
      <section className="bg-primary py-14 text-on-primary sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Shop all gadgets</h1>
          <p className="mt-2 font-body text-lg text-on-primary/80">
            {total > 0
              ? `${total} product${total === 1 ? '' : 's'} — each one inspected before it ships.`
              : 'Every unit is inspected before dispatch. Guaranteed or refunded.'}
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-40 border-b border-line bg-surface-raised/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3">
            {LISTING_CATEGORIES.map((cat) => {
              const active = activeCategory === cat
              return (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/listings' : `/listings?category=${encodeURIComponent(cat)}`}
                  className={
                    'shrink-0 rounded-pill px-4 py-1.5 font-body text-sm font-500 transition-micro ' +
                    (active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-ink-soft hover:text-ink')
                  }
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <Suspense fallback={<div className="h-11 animate-pulse rounded-md border border-line bg-surface" />}>
              <FilterBar />
            </Suspense>
          </aside>

          <div>
            {products.length === 0 ? (
              <div className="rounded-lg border border-line bg-surface py-20 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-primary-soft">
                  <ShoppingBag size={22} className="text-primary" />
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="font-display text-lg font-bold text-ink">No results match your filters</h3>
                    <p className="mx-auto mt-1 max-w-sm font-body text-ink-soft">Try widening your search or clearing a filter.</p>
                    <div className="mt-6">
                      <Button asChild variant="secondary">
                        <Link href={buildHref({ search: undefined, brand: undefined, condition: undefined, minPrice: undefined, maxPrice: undefined, page: undefined })}>
                          Clear filters
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-lg font-bold text-ink">Nothing here yet</h3>
                    <p className="mx-auto mt-1 max-w-sm font-body text-ink-soft">
                      Tell us what you&apos;re after and we&apos;ll source it for you.
                    </p>
                    <div className="mt-6">
                      <Button asChild>
                        <a
                          href={buildWhatsAppUrl(`Hi Zolarux, I'm looking for ${activeCategory === 'All' ? 'a gadget' : activeCategory}. Can you source it?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle size={16} />
                          Ask us to source it
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Reveal>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </Reveal>
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      hrefFor={(p) => buildHref({ page: p })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Standard Verification Cycle — with real data**

`/listings` shows real products; category chips filter (try "Laptops & Computers"); `FilterBar` search works; `Pagination` renders when `total > 12` and preserves filters in its hrefs; both empty states reachable (`?search=zzzznonexistent` → "no results"; a category with 0 matches → "nothing here yet"). Both themes, sticky category bar sits below the `h-16` Navbar (`top-16`). `null`-price products show "Price on request".

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(listings): retailer redesign — tokens, Pagination component, real empty states

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: Listing Detail — core redesign

**Files:**
- Rewrite: `app/(marketing)/listings/[id]/page.tsx` (core; trust blocks + reviews land in Task 12)

**Interfaces:**
- Consumes: `getProductById`, `getRelatedProducts` (existing), `formatPriceMaybe`, `buildWhatsAppUrl`, `Gallery` / `SpecsTable` / `Badge` / `Breadcrumbs` / `Button` / `Card` (Phase 0), `notFound`.
- Produces: `app/(marketing)/listings/[id]/page.tsx` — `generateMetadata` + default async page. `params` is a Promise (Next 16).

- [ ] **Step 1: Rewrite `app/(marketing)/listings/[id]/page.tsx`** (core structure; Task 12 adds the trust panel, what-happens-next, related, and `<ProductReviews>`)

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import { formatPriceMaybe } from '@/lib/utils'
import { Gallery } from '@/components/ui/Gallery'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product not found' }
  const price = formatPriceMaybe(product.price)
  return {
    title: product.name,
    description: `${product.name} — inspected by Zolarux, guaranteed or refunded.${price ? ` ${price}.` : ''}`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const images = Array.from(
    new Set([imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[])
  )
  const price = formatPriceMaybe(product.price)

  return (
    <div className="bg-background py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/listings' },
            ...(product.category ? [{ label: product.category, href: `/listings?category=${encodeURIComponent(product.category)}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Gallery images={images} alt={product.name} />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.is_featured && <Badge variant="featured" />}
              {product.condition && <Badge variant="condition" condition={product.condition} />}
            </div>

            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{product.name}</h1>

            <div className="mt-4">
              {price ? (
                <p className="font-display text-3xl font-extrabold text-ink [font-variant-numeric:tabular-nums]">{price}</p>
              ) : (
                <p className="font-display text-2xl font-extrabold text-primary">Price on request</p>
              )}
              <p className="mt-1 font-body text-sm text-ink-soft">
                Inspected before dispatch · Delivery arranged when you order
              </p>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-display font-bold text-ink">Description</h2>
                <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink-soft">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6">
              <SpecsTable specs={product.specs} />
            </div>

            {/* Task 12: trust panel + Order on WhatsApp + what-happens-next */}
          </div>
        </div>

        {/* Task 12: related products + ProductReviews */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Standard Verification Cycle** — open a real listing (`/listings/<uuid>` from `/listings`): gallery works (single-image fallback for products with one photo), breadcrumbs, name, price (or "Price on request"), description shows when present, `SpecsTable` renders nothing (no specs in data — correct). No vendor card, no escrow note, no "verified" badge. Both themes. `notFound()` for a bad id.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(listing-detail): core retailer redesign — remove vendor/escrow, null-safe price

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: Listing Detail — trust panel, WhatsApp CTA, what-happens-next, related, reviews

**Files:**
- Create: `components/ui/ProductReviews.tsx`
- Modify: `app/(marketing)/listings/[id]/page.tsx`, `components/ui/index.ts`

**Interfaces:**
- Consumes: `getProductReviews` (Task 2), `StarRating` / `ReviewCard` / `ReviewSummary` (Task 3), `getRelatedProducts` (existing), `ProductCard`, `Card`, `Button`, `buildWhatsAppUrl`, `formatPriceMaybe`.
- Produces: `ProductReviews` (`components/ui/ProductReviews.tsx`) — `{ productId: string }`, **server component** (`async`). Renders the summary + list, or a "No reviews yet" empty state.

- [ ] **Step 1: `components/ui/ProductReviews.tsx`**

```tsx
import { MessageSquare } from 'lucide-react'
import { getProductReviews } from '@/lib/reviews'
import { ReviewCard } from './ReviewCard'
import { ReviewSummary } from './ReviewSummary'

export async function ProductReviews({ productId }: { productId: string }) {
  const { reviews, average, count, distribution } = await getProductReviews(productId)

  return (
    <section id="product-reviews" className="mt-16 scroll-mt-20">
      <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">Reviews</h2>
      {count === 0 ? (
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <MessageSquare size={22} className="mx-auto mb-3 text-ink-soft" />
          <p className="font-body text-sm text-ink-soft">
            No reviews yet. Buyers can leave a review after their order is delivered.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ReviewSummary average={average} count={count} distribution={distribution} />
          <div className="rounded-lg border border-line bg-surface px-6">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Barrel — append to `components/ui/index.ts`**

```ts
export { ProductReviews } from './ProductReviews'
```

- [ ] **Step 3: Add the trust panel + CTA into `app/(marketing)/listings/[id]/page.tsx`** — replace the `{/* Task 12: trust panel ... */}` comment. Add imports: `Button`, `Card`, `buildWhatsAppUrl`, `getRelatedProducts`, `ProductCard`, `ProductReviews`, `ShieldCheck`, `MessageCircle`, `PackageCheck` from lucide.

```tsx
            <div className="mt-6 space-y-4">
              <a
                href={buildWhatsAppUrl(
                  `Hi Zolarux, I'd like to order: ${product.name}${price ? ` (${price})` : ''}. Is it available?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-verified py-4 font-display text-base font-bold text-white transition-micro hover:brightness-110"
              >
                <MessageCircle size={18} />
                Order on WhatsApp
              </a>

              <Card variant="flat">
                <div className="space-y-3 p-5">
                  <p className="inline-flex items-center gap-2 font-display text-sm font-bold text-ink">
                    <ShieldCheck size={16} className="text-verified" />
                    Guaranteed or refunded
                  </p>
                  <ol className="space-y-2 font-body text-sm text-ink-soft">
                    <li>1. Message us — we confirm stock, condition and delivery.</li>
                    <li>2. Pay, and we dispatch your inspected unit.</li>
                    <li>3. Inspect it on delivery. Not as described? Full refund.</li>
                  </ol>
                </div>
              </Card>
            </div>
```

- [ ] **Step 4: Add related products + reviews** — replace the `{/* Task 12: related products + ProductReviews */}` comment (still inside the `max-w-6xl` container, after the 2-col grid closes):

```tsx
        <ProductReviews productId={product.id} />

        {await (async () => {
          const related = await getRelatedProducts(product.category, product.id)
          if (related.length === 0) return null
          return (
            <div className="mt-16">
              <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">More gadgets like this</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((r) => (
                  <ProductCard key={r.id} product={r} />
                ))}
              </div>
            </div>
          )
        })()}
```

> Cleaner alternative: fetch `related` at the top of the page component alongside `product` and render it inline without the IIFE. Prefer that — hoist `const related = product ? await getRelatedProducts(product.category, product.id) : []` right after the `notFound()` guard, then render `{related.length > 0 && (...)}`.

- [ ] **Step 5: Standard Verification Cycle** — "Order on WhatsApp" opens `wa.me` with the pre-filled message; guarantee card + 3-step list render; `<ProductReviews>` shows "No reviews yet" (table empty); related rail shows same-category products; both themes. Optionally: insert one `status='published'` review row for this `listing_id` via the Supabase MCP, reload, confirm summary + card render, then delete the row.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(listing-detail): guarantee panel, WhatsApp order, reviews, related

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 13: Login + auth layout redesign

**Files:**
- Rewrite: `app/(auth)/login/page.tsx`
- Rewrite: `app/(auth)/layout.tsx`

**Interfaces:**
- Consumes: `createClient` (`@/lib/supabase/client`), `Card` / `Field` / `Input` / `Button` (Phase 0), `useRouter`.
- Produces: redesigned `LoginPage` (client) + `AuthLayout` (server). **Logic unchanged** except: successful auth redirects to `/` (not `/buyer`, which does not exist on this branch), and the register/vendor links are removed.

- [ ] **Step 1: Rewrite `app/(auth)/layout.tsx`** (token migration; conditional legal links — those routes don't exist, so drop them)

```tsx
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <header className="flex h-14 items-center border-b border-line bg-surface-raised px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-display text-xs font-extrabold text-on-primary">Z</span>
          <span className="font-display font-bold text-ink">Zolarux</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <footer className="border-t border-line py-4 text-center font-body text-xs text-ink-soft">
        © {new Date().getFullYear()} Zolarux
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `app/(auth)/login/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, Field, Input, Button } from '@/components/ui'

type Step = 'phone' | 'otp'

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return '+234' + digits
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async () => {
    setError('')
    if (!phone.trim()) return setError('Enter your phone number')
    setLoading(true)
    const { error: err } = await createClient().auth.signInWithOtp({ phone: formatPhone(phone) })
    if (err) setError(err.message)
    else setStep('otp')
    setLoading(false)
  }

  const verifyOtp = async () => {
    setError('')
    if (otp.length < 6) return setError('Enter the 6-digit code')
    setLoading(true)
    const { error: err } = await createClient().auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: 'sms',
    })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/') // no /buyer area on this branch
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="overflow-hidden">
        <div className="bg-primary p-6 text-center text-on-primary">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-on-primary/15">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display text-xl font-extrabold">Welcome back</h1>
          <p className="mt-1 font-body text-sm text-on-primary/75">Sign in to track your orders</p>
        </div>

        <div className="p-6">
          {step === 'phone' ? (
            <div className="space-y-4">
              <Field label="Phone number" htmlFor="login-phone">
                <div className="flex gap-2">
                  <span className="inline-flex shrink-0 items-center rounded-md border border-line bg-surface px-3 font-body text-sm font-600 text-ink-soft">
                    +234
                  </span>
                  <Input
                    id="login-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    placeholder="08012345678"
                  />
                </div>
              </Field>
              {error && <p className="font-body text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={sendOtp} loading={loading}>
                Send code <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-pill bg-verified/12">
                  <Phone size={18} className="text-verified" />
                </div>
                <p className="font-body text-sm text-ink-soft">
                  Code sent to <strong className="text-ink">{phone}</strong>
                </p>
              </div>
              <Field label="6-digit code" htmlFor="login-otp">
                <Input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  placeholder="000000"
                  className="text-center text-2xl font-bold tracking-[0.4em]"
                />
              </Field>
              {error && <p className="text-center font-body text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={verifyOtp} loading={loading} disabled={otp.length < 6}>
                Verify &amp; sign in
              </Button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="w-full font-body text-sm text-ink-soft transition-micro hover:text-ink"
              >
                Change number
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Standard Verification Cycle** — `/login` renders on tokens both themes; phone step → (real OTP send will fail without SMS provider config, which is fine — verify the *error* renders on tokens); "Change number" resets; no register/vendor links; the phone→otp step swap is instant (acceptable) or add a `.hero-rise`-style fade if time permits. `(auth)/layout.tsx` chrome is tokenised.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(auth): redesign Login + auth layout on the kit; fix post-login redirect

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 14: Compat-shim trim + repo sweep

**Files:**
- Modify: `app/globals.css`
- Modify: any stray file still on legacy classes that a grep turns up (Phase 1 surfaces only)

- [ ] **Step 1: Grep the repo for legacy class usage**

```bash
grep -rn "font-300\|font-400\|font-500\|font-600\|font-700\|font-800\|shadow-card\|shadow-card-hover\|shadow-primary\|bg-primary-light\|text-primary-dark\|bg-primary-dark\|animate-nav-pulse" app components --include="*.tsx"
```

- [ ] **Step 2: Classify each hit**

- Hits in `app/(tools)/check-vendor/page.tsx` → **out of scope**, leave. Note them.
- Hits in any Phase 1 surface (Navbar, Footer, Home, Listings, Listing Detail, Login, auth/marketing layouts, ProductCard) → **fix now**: `font-700`→`font-bold`, `font-800`→`font-extrabold`, `font-600`→`font-semibold`, `shadow-card`→`shadow-md`, `shadow-card-hover`→`shadow-lg`, `bg-primary-light`→`bg-primary-soft`, `bg-primary-dark`/`text-primary-dark`→ use `brightness-110`/`brightness-95` or a token. `animate-nav-pulse` → delete (no longer defined).
- Hits in `components/ui/*` refit components (StatTile, Gallery, SpecsTable, FilterBar, ProductCard) → these were tokenised in Phase 0; if a stray remains, fix it.

- [ ] **Step 3: Trim `app/globals.css`**

For each `@utility` in the shim (lines ~223–233) and the `--color-accent` alias (line ~127): if Step 1's grep shows **zero** remaining repo-wide usages, delete that entry. If `check-vendor` still uses e.g. `font-700` and `shadow-card`, keep only those and update the comment:

```css
/* ---------- Legacy utility compat — only the unlinked check-vendor page still needs these ---------- */
@utility font-700 { font-weight: 700; }
@utility shadow-card { box-shadow: var(--elevation-md); }
/* ...only what check-vendor uses... */
```

Delete everything with zero usage. Keep `--color-accent` only if `check-vendor` (or another out-of-scope file) uses `bg-accent`/`text-accent`.

- [ ] **Step 4: Standard Verification Cycle** — `npm run build` clean; open all 6 Phase 1 surfaces + `/dev/ui` in both themes — nothing regressed from the class swaps; `/check-vendor` still renders (it keeps its shim entries).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore(phase-1): trim compat shim to only what the unlinked check-vendor page needs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 15: Phase 1 verification pass + push

**Files:**
- Modify: `docs/superpowers/specs/2026-08-29-flagship-v2-phase-1-shopping-spine-design.md` (§17 — tick resolved items, add a completion note)

- [ ] **Step 1: Full static check**

```bash
npx tsc --noEmit     # clean
npm run lint         # 0 errors
npm run build        # succeeds
```

Paste the route table into the commit message. Confirm: `/`, `/about`, `/listings`, `/listings/[id]`, `/login`, `/check-vendor`, `/dev/ui`, `/robots.txt`, `/sitemap.xml` — `/` and `/listings` + `/listings/[id]` dynamic (Supabase / searchParams), the rest static.

- [ ] **Step 2: Full manual QA matrix — with real data**

`npm run dev`. For **each** of Navbar, Footer, Home (every section), Listings (grid + both empty states + pagination), Listing Detail (real listing + `notFound`), Login (both steps), at **375 / 768 / 1280** in **light and dark**:
- Real products render; no "table not found"; `null`-price → "Price on request".
- No untokenised element (light-on-dark or vice-versa); focus rings present.
- `/#the-guarantee` and `/#reviews` scroll correctly under the fixed Navbar.
- Reduce-motion: hero + `Reveal` + hover-lift all land at end-state.
- Every link resolves (no 404) — especially Footer and Navbar.

Record pass/fail per surface in the commit body.

- [ ] **Step 3: Reconcile spec §17**

Mark hero copy / stats / testimonials / voice as "placeholder shipped — real content pending from user"; note Phase 1 completion date and that reviews render empty (table has 0 rows).

- [ ] **Step 4: Commit + push**

```bash
git add -A
git commit -m "chore(phase-1): verification pass — shopping spine complete

Route table:
<paste>

QA matrix: <summary>
Reviews: display built, table empty (0 rows) — all review surfaces show empty state.
Pending real content (spec §17): hero line, track-record numbers, buyer testimonials.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin flagship-v2
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §1 narrative pivot (single retailer, guarantee, no fee, WhatsApp) | Global Constraints; enforced in Tasks 5–13 |
| §4 nullable fields, real-data messiness, price helper | Task 1 |
| §5 surface-by-surface approach | task order (chrome → Home → listings → detail → login) |
| §6.1 Navbar (Shop menu, The Guarantee/Reviews/About, WhatsApp CTA, mobile Sheet, no vendors) | Task 5 |
| §6.2 Footer (retailer columns, no dead-route links) | Task 6 |
| §6.3 constants prune (NAV_LINKS, drop TRUST_TOOLS/VENDOR_CATEGORIES, keep VENDOR_STATUS_MAP w/ comment) | Task 1 |
| §7.1 cinematic hero (choreographed, CSS-first, `motion` only if needed, reduced-motion) | Task 7 |
| §7.2 featured/new-arrivals rail + `getNewArrivals` | Tasks 1, 8 |
| §7.3 "the guarantee" 4 beats, `id="the-guarantee"` | Task 8 |
| §7.4 proof — stats, testimonials, review summary, `id="reviews"` | Task 9 |
| §7.5 shop by category | Task 9 |
| §7.6 single CTA band | Task 9 |
| §7 cut sections (dual CTA, tool grid, vendor testimonials) | Task 9 Step 4 |
| §8 Listings (title, FilterBar, ProductCard no vendor badge, Pagination, empty states, Reveal) | Tasks 4, 10 |
| §9 Listing Detail (remove vendor/escrow, condition report/what's-included degrade, guarantee panel, Order-on-WhatsApp + what-happens-next, related, metadata) | Tasks 11, 12 |
| §10 Login (logic unchanged, tokenised, remove register links, redirect fix, auth layout) | Task 13 |
| §11 reviews read-only (`lib/reviews.ts`, StarRating/ReviewCard/ReviewSummary/ProductReviews, empty-state, count===0 hides) | Tasks 2, 3, 12; Home wiring Task 9 |
| §12 motion (one hero moment, else Phase 0 system) | Task 7 |
| §13 token migration + compat-shim trim | every surface task + Task 14 |
| §14 no schema change; `getNewArrivals`; `vendor_*` unused | Task 1 |
| §15 verification (real data now available) | Standard Verification Cycle + Task 15 |
| §17 resolved items + content placeholders | Task 15 Step 3 |

No gaps.

**2. Placeholder scan:** Task 9 uses clearly-labelled placeholder stats + testimonials (spec §17 — content pending; the plan says so in the UI and the commit). Task 8 Step 1's `GuaranteeSteps` code block has a `dangerouslySetInnerHTML` shown then explicitly retracted in the same step with the plain-string instruction — the implementer writes plain string literals. No "TBD" / "handle edge cases" / "similar to Task N". Every component and page has full source.

**3. Type consistency:**
- `formatPriceMaybe` — defined Task 1, used Tasks 4, 7, 11, 12 with signature `(number|null|undefined) => string|null`. Consistent.
- `getNewArrivals(limit=8)` — Task 1, used Task 7 (`getNewArrivals(8)`) and Task 8 (`newArrivals` from the page). Consistent.
- `Review` = `{ id, rating: 1|2|3|4|5, body: string|null, created_at }` — Task 2, consumed identically by `ReviewCard` (Task 3) and `ProductReviews` (Task 12).
- `ReviewBundle` fields (`reviews, average, count, distribution`) — Task 2, destructured the same way in `ProductReviews` (Task 12).
- `getReviewSummary()` → `{ average, count }` — Task 2, used in Home (Task 7 fetch, Task 9 render) as `reviewSummary.count` / `.average`. Consistent.
- `SHOP_MENU` / `NAV_LINKS` shapes (`{ label, href }[]`) — Task 1, mapped identically in Navbar (Task 5) and Footer (Task 6).
- `HeroSequence` prop `{ product: HeroProduct | null }` where `HeroProduct = { id, name, imageUrl: string|null, price: string|null }` — Task 7 defines and the page constructs exactly that.
- `ProductReviews` prop `{ productId: string }` — Task 12 defines, Listing Detail passes `product.id`.
- Navbar stays `h-16`; `(marketing)/layout.tsx` keeps `pt-16`; Listings sticky bar uses `top-16`. Consistent.
- `Button` `asChild` wrapping an `<a>` / `<Link>` — used in Navbar/Footer/Home/Listings; matches the Phase 0 `Button` (Slot-based `asChild`).

Fixed inline during review: Task 12 Step 4 originally used an inline async IIFE for related products; replaced with the hoisted-`related` instruction (fetch after `notFound()` guard) to avoid an unusual pattern and a double `getProductById`-adjacent await.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-29-flagship-v2-phase-1-shopping-spine.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — I execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
