# Zolarux Flagship Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Zolarux's six existing pages (Home, About, Listings, Listing Detail, Check Vendor, Login) plus shared chrome (Navbar/Footer) to flagship gadget-retailer quality — Apple-grade visual craft blended with Amazon/Best-Buy-grade discovery (search, filters, sort) — without touching the WhatsApp-escrow purchase model, brand identity, or backend/auth logic.

**Architecture:** Build a small shared foundation first (design tokens, `Badge`/`StatTile`/`ProductCard`/`FilterBar`/`Gallery`/`SpecsTable` components, a consolidated `lib/products.ts` data-access layer), then apply it consistently across all six pages in dependency order so the result lands as one coherent pass rather than six independently-skinned pages.

**Tech Stack:** Next.js 16.2.6 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Supabase (`@supabase/ssr`), lucide-react icons, Radix UI primitives.

**Spec:** `docs/superpowers/specs/2026-08-23-flagship-redesign-design.md`

## Global Constraints

- Keep the existing brand identity as-is: primary `#4064D7`, accent `#FFA600`, Syne display font, DM Sans body font. No palette or font changes.
- Keep the WhatsApp-escrow purchase handoff exactly as it works today. No cart, checkout, or payment logic.
- No changes to backend/order logic, vendor-side tooling, or auth *logic* (Check Vendor's query flow and Login's OTP flow behavior are unchanged — only presentation is elevated).
- Do not build any of the ~15 pages currently linked but not yet implemented (How It Works, For Buyers/Vendors, other Safety Tools, Register, Blog, FAQ, legal pages, etc.) and do not add new nav/footer links.
- **No test framework exists in this repo** (confirmed: no Jest/Vitest/Playwright in `package.json`). Per the spec's testing section, verification for every task is: `npx tsc --noEmit` (fast typecheck for component-only tasks), `npm run build` (full build, required whenever a page or the build graph is touched), and a manual check in the running app (`npm run dev`) of the specific behavior the task added. This replaces the automated test steps in the standard task template.
- Existing conventions to follow: raw `<img>` tags (not `next/image`) for Supabase-hosted product images — this is the established pattern in this codebase, not an oversight — server components by default, `'use client'` only where interaction requires it, filter/sort state carried via URL `searchParams` (no client state library), Tailwind utility classes matching the existing scale (`font-display`, `font-700`/`font-800`, `rounded-2xl`/`rounded-3xl`, `shadow-card`/`shadow-card-hover`).
- `next build` currently prints a `"middleware" file convention is deprecated. Please use "proxy" instead` warning. This is pre-existing and out of scope for this project (it concerns auth/session infrastructure, not the redesign) — do not attempt to fix it as part of any task below.
- The `products` table lives in a Supabase project not managed from this repo (no migrations folder existed before this plan). Task 2 creates `supabase/migrations/0001_add_product_brand_condition.sql` as a **reference file** — it is not auto-applied. The `brand`/`condition`/`specs` columns must be applied to the live Supabase project separately (by the user, or via the Supabase MCP tool) before those fields will return real data; until then, the UI must keep working correctly with `null` values for all three (this is why the plan uses nullable types and conditional rendering throughout, not optional chaining as an afterthought).

---

### Task 1: Fix pre-existing lint error in Navbar

**Files:**
- Modify: `components/layout/Navbar.tsx:31-33`

**Interfaces:**
- Consumes: nothing new
- Produces: a clean `npm run lint` baseline (currently fails with exit code 1) that every later task's verification step relies on

This is a pre-existing bug unrelated to the redesign, but every later task in this plan verifies with `npm run lint`, so it must be fixed first or that verification step is meaningless from the start.

- [ ] **Step 1: Reproduce the failure**

Run: `npm run lint`
Expected: fails with `Error: Calling setState synchronously within an effect can trigger cascading renders` pointing at `components/layout/Navbar.tsx:32`, plus several pre-existing warnings (unrelated, ignore them for now — later tasks touching those files will clean up their own warnings).

- [ ] **Step 2: Replace the effect with React's "adjust state during render" pattern**

The current code (lines 25-33) is:

```tsx
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 12)
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

useEffect(() => {
  setMobileOpen(false)
}, [pathname])
```

Replace only the second `useEffect` (the scroll listener effect on lines 25-29 is a legitimate subscription and stays untouched):

```tsx
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 12)
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

const [prevPathname, setPrevPathname] = useState(pathname)
if (pathname !== prevPathname) {
  setPrevPathname(pathname)
  setMobileOpen(false)
}
```

This follows React's documented pattern for resetting state when a prop changes (calling `setState` directly in the render body, which React explicitly allows and treats as a synchronous re-render, not a cascading effect) instead of doing it inside a `useEffect`.

- [ ] **Step 3: Verify the fix**

Run: `npm run lint`
Expected: the `set-state-in-effect` error is gone. The remaining output should only be the pre-existing warnings (`buildWhatsAppUrl` unused, `ArrowRight` unused, `no-img-element`, `WHATSAPP_NUMBER` unused, `Image` unused in Navbar) — 7 warnings, 0 errors, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "fix: replace setState-in-effect with render-time state adjustment in Navbar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Data model & constants foundation

**Files:**
- Create: `supabase/migrations/0001_add_product_brand_condition.sql`
- Modify: `types/product.ts`
- Modify: `lib/constants.ts`

**Interfaces:**
- Produces: `ProductCondition` type and `ProductSpec` interface (from `types/product.ts`); `Product.brand: string | null`, `Product.condition: ProductCondition | null`, `Product.specs: ProductSpec[] | null`; `PRODUCT_CONDITIONS: readonly ProductCondition[]`, `CONDITION_MAP: Record<ProductCondition, { label: string; color: string; bg: string; border: string }>`, `LISTING_SORT_OPTIONS`, `ListingSort` type (all from `lib/constants.ts`)

- [ ] **Step 1: Write the reference migration**

Create `supabase/migrations/0001_add_product_brand_condition.sql`:

```sql
-- Adds retail-discovery facets to products: brand (free text), condition
-- (new / uk_used / refurbished / used), and specs (optional key/value spec list).
-- All columns are nullable — existing rows are unaffected, and the app UI
-- already handles null brand/condition/specs gracefully.
--
-- This file is a reference only. There is no migration tooling wired into
-- this repo — apply it directly against the Supabase project's SQL editor,
-- or via the Supabase MCP tool if connected, before relying on these fields
-- returning real data.

alter table products
  add column if not exists brand text,
  add column if not exists condition text,
  add column if not exists specs jsonb;
```

- [ ] **Step 2: Update the `Product` type**

In `types/product.ts`, replace the file contents:

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
  description: string
  price: number
  pricing_type: PricingType
  image_url: string
  main_image_url: string | null
  image_urls: string[]
  video_urls: string[]
  category: string
  brand: string | null
  condition: ProductCondition | null
  specs: ProductSpec[] | null
  vendor_id: string
  vendor_name: string
  is_active: boolean
  is_featured: boolean
  created_at?: string
}
```

- [ ] **Step 3: Add condition/sort constants**

In `lib/constants.ts`, add after the existing `LISTING_CATEGORIES`/`ListingCategory` block:

```ts
import type { ProductCondition } from '@/types/product'

export const PRODUCT_CONDITIONS: readonly ProductCondition[] = ['new', 'uk_used', 'refurbished', 'used']

export const CONDITION_MAP: Record<ProductCondition, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'New', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  uk_used: { label: 'UK Used', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  refurbished: { label: 'Refurbished', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  used: { label: 'Used', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' },
}

export const LISTING_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const

export type ListingSort = typeof LISTING_SORT_OPTIONS[number]['value']
```

(Add the `import type { ProductCondition } from '@/types/product'` line to the top of `lib/constants.ts` alongside any existing imports — there are none today, so it becomes the first line of the file.)

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no type errors.

Run: `npm run lint`
Expected: same 7 pre-existing warnings as after Task 1, 0 errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_add_product_brand_condition.sql types/product.ts lib/constants.ts
git commit -m "feat: add brand/condition/specs to Product type and reference migration

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Shared atoms — Badge and StatTile

**Files:**
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/StatTile.tsx`

**Interfaces:**
- Consumes: `CONDITION_MAP`, `ProductCondition` (Task 2)
- Produces: `Badge` component (props: `{ variant: 'verified' }`, `{ variant: 'featured' }`, or `{ variant: 'condition'; condition: ProductCondition }`); `StatTile` component (props: `{ value: string; label: string; variant?: 'light' | 'dark' }`, default `'light'`)

- [ ] **Step 1: Create `Badge`**

```tsx
import { Shield, Sparkles } from 'lucide-react'
import { CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProductCondition } from '@/types/product'

type BadgeProps =
  | { variant: 'verified' }
  | { variant: 'featured' }
  | { variant: 'condition'; condition: ProductCondition }

export function Badge(props: BadgeProps) {
  if (props.variant === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-green-200 text-green-700 text-xs font-700 px-2 py-1 rounded-full">
        <Shield size={10} />
        Verified
      </span>
    )
  }

  if (props.variant === 'featured') {
    return (
      <span className="inline-flex items-center gap-1 bg-accent text-white text-xs font-700 px-2.5 py-1 rounded-full">
        <Sparkles size={10} />
        Featured
      </span>
    )
  }

  const config = CONDITION_MAP[props.condition]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-700 px-2.5 py-1 rounded-full border',
      config.color, config.bg, config.border
    )}>
      {config.label}
    </span>
  )
}
```

- [ ] **Step 2: Create `StatTile`**

```tsx
import { cn } from '@/lib/utils'

interface StatTileProps {
  value: string
  label: string
  variant?: 'light' | 'dark'
}

export function StatTile({ value, label, variant = 'light' }: StatTileProps) {
  return (
    <div className="text-center px-6 py-2">
      <p className={cn(
        'font-display text-3xl sm:text-4xl font-800',
        variant === 'dark' ? 'text-white' : 'text-primary'
      )}>
        {value}
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0. (Both components are unused so far — that's expected; they're wired in by later tasks.)

- [ ] **Step 4: Commit**

```bash
git add components/ui/Badge.tsx components/ui/StatTile.tsx
git commit -m "feat: add shared Badge and StatTile components

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: ProductCard component

**Files:**
- Create: `components/ui/ProductCard.tsx`

**Interfaces:**
- Consumes: `Badge` (Task 3), `Product` type (Task 2), `formatPrice`/`buildWhatsAppUrl` (`lib/utils.ts`, unchanged)
- Produces: `ProductCard` component (props: `{ product: Product }`)

- [ ] **Step 1: Create the component**

This extracts and upgrades the `ProductCard` function currently inlined in `app/(marketing)/listings/page.tsx:174-233`, adding the condition badge and using `buildWhatsAppUrl` instead of a hand-built URL.

```tsx
import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const whatsappMsg = `Hi, I'm interested in "${product.name}" on Zolarux. Can I get more details?`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <Link href={`/listings/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.is_featured && <Badge variant="featured" />}
          {product.condition && <Badge variant="condition" condition={product.condition} />}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="verified" />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="font-display font-700 text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-3">
          {product.brand ? `${product.brand} · ${product.category}` : product.category}
        </p>

        <div className="flex items-center justify-between">
          <div>
            {product.pricing_type === 'quote' ? (
              <span className="text-primary font-700 text-sm">Price on request</span>
            ) : (
              <span className="font-display font-800 text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <Link
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            title="Inquire on WhatsApp"
          >
            <MessageCircle size={14} className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ProductCard.tsx
git commit -m "feat: add shared ProductCard component with condition badge

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: `lib/products.ts` shared data layer

**Files:**
- Create: `lib/products.ts`

**Interfaces:**
- Consumes: `createClient` from `lib/supabase/server.ts` (unchanged), `Product` type (Task 2), `ListingSort` type (Task 2)
- Produces: `LISTINGS_PAGE_SIZE: number`; `ListingFilters` interface; `getListings(filters: ListingFilters): Promise<{ products: Product[]; total: number }>`; `getFeaturedProducts(limit?: number): Promise<Product[]>`; `getRelatedProducts(category: string, excludeId: string, limit?: number): Promise<Product[]>`; `getProductById(id: string): Promise<Product | null>`

This consolidates the query logic currently duplicated between `listings/page.tsx` (`getProducts`) and `listings/[id]/page.tsx` (`getProduct`), and adds the new queries Home and Listing Detail need.

- [ ] **Step 1: Create the module**

```ts
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'
import type { ListingSort } from '@/lib/constants'

export const LISTINGS_PAGE_SIZE = 12

export interface ListingFilters {
  category?: string
  brand?: string
  condition?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: ListingSort
  page?: number
}

export async function getListings(filters: ListingFilters): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const from = (page - 1) * LISTINGS_PAGE_SIZE
  const to = from + LISTINGS_PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (filters.category && filters.category !== 'All') {
    query = query.ilike('category', `%${filters.category}%`)
  }
  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`)
  }
  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Listings fetch error:', error)
    return { products: [], total: 0 }
  }

  return { products: (data as Product[]) || [], total: count || 0 }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Featured products fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${category}%`)
    .neq('id', excludeId)
    .limit(limit)

  if (error) {
    console.error('Related products fetch error:', error)
    return []
  }
  return (data as Product[]) || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Product
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add lib/products.ts
git commit -m "feat: add lib/products.ts shared data-access layer

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: FilterBar component

**Files:**
- Create: `components/ui/FilterBar.tsx`

**Interfaces:**
- Consumes: `PRODUCT_CONDITIONS`, `CONDITION_MAP`, `LISTING_SORT_OPTIONS` (Task 2), `cn` (`lib/utils.ts`)
- Produces: `FilterBar` component (no props — reads/writes `searchParams` directly via `next/navigation` hooks; must be rendered inside a `<Suspense>` boundary by its caller per Next.js's `useSearchParams` requirement)

This is a Client Component. It manages: free-text search (submitted on Enter/button, not per-keystroke), condition (single-select toggle chips), brand (free text, applied on blur), price range (min/max, applied on blur), and sort (select). All state changes navigate via `router.push` with merged `URLSearchParams`, resetting `page` to keep pagination consistent. The existing category chip row in `listings/page.tsx` is untouched — this component doesn't handle category.

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { LISTING_SORT_OPTIONS, PRODUCT_CONDITIONS, CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput.trim() || null })
  }

  const activeCondition = searchParams.get('condition') ?? ''
  const activeBrand = searchParams.get('brand') ?? ''
  const activeSort = searchParams.get('sort') ?? 'featured'
  const activeMin = searchParams.get('minPrice') ?? ''
  const activeMax = searchParams.get('maxPrice') ?? ''

  const facets = (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Condition</label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => updateParams({ condition: activeCondition === condition ? null : condition })}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-600 border transition-all',
                activeCondition === condition
                  ? `${CONDITION_MAP[condition].bg} ${CONDITION_MAP[condition].color} ${CONDITION_MAP[condition].border}`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {CONDITION_MAP[condition].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Brand</label>
        <input
          type="text"
          defaultValue={activeBrand}
          onBlur={(e) => updateParams({ brand: e.target.value.trim() || null })}
          placeholder="e.g. Apple, Samsung"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Price Range (₦)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={activeMin}
            onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
            placeholder="Min"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            defaultValue={activeMax}
            onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
            placeholder="Max"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? null : e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {LISTING_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gadgets..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden shrink-0 w-11 h-11 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} />
        </button>
      </form>

      <div className="hidden lg:block mt-6 bg-white rounded-2xl border border-gray-100 p-5">
        {facets}
      </div>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-700 text-gray-900">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            {facets}
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-6 bg-primary text-white font-700 py-3 rounded-xl"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add components/ui/FilterBar.tsx
git commit -m "feat: add FilterBar component (search, condition, brand, price, sort)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Listings page integration

**Files:**
- Modify: `app/(marketing)/listings/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getListings`, `LISTINGS_PAGE_SIZE` (Task 5), `ProductCard` (Task 4), `FilterBar` (Task 6), `LISTING_CATEGORIES`, `ListingSort` (Task 2/existing), `buildWhatsAppUrl` (`lib/utils.ts`)

`useSearchParams` (used inside `FilterBar`) requires the component tree using it to be wrapped in `<Suspense>` in a route that could be statically rendered, per Next.js's `use-search-params` docs — this page already reads the `searchParams` page prop (making the route dynamic), but we still wrap `FilterBar` in `Suspense` as documented best practice so it degrades cleanly.

- [ ] **Step 1: Replace the file contents**

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getListings, LISTINGS_PAGE_SIZE } from '@/lib/products'
import { buildWhatsAppUrl } from '@/lib/utils'
import { LISTING_CATEGORIES, type ListingSort } from '@/lib/constants'
import { Shield, ShoppingBag, MessageCircle } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { FilterBar } from '@/components/ui/FilterBar'

export const metadata: Metadata = {
  title: 'Verified Listings',
  description: 'Browse verified gadget listings on Zolarux. Every product is from a verified vendor. Every transaction is escrow-protected.',
}

interface ListingsPageProps {
  searchParams: Promise<{
    category?: string
    page?: string
    search?: string
    brand?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams
  const activeCategory = params.category || 'All'
  const currentPage = parseInt(params.page || '1', 10)
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

  const pageHref = (page: number) => {
    const qs = new URLSearchParams()
    if (activeCategory !== 'All') qs.set('category', activeCategory)
    if (params.search) qs.set('search', params.search)
    if (params.brand) qs.set('brand', params.brand)
    if (params.condition) qs.set('condition', params.condition)
    if (params.minPrice) qs.set('minPrice', params.minPrice)
    if (params.maxPrice) qs.set('maxPrice', params.maxPrice)
    if (params.sort) qs.set('sort', params.sort)
    qs.set('page', String(page))
    return `/listings?${qs.toString()}`
  }

  const clearFiltersHref = activeCategory !== 'All' ? `/listings?category=${activeCategory}` : '/listings'

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-white/70 text-sm font-600">Every listing is vendor-verified & escrow-protected</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">
            Verified Listings
          </h1>
          <p className="text-white/70 text-lg">
            {total > 0 ? `${total} verified product${total !== 1 ? 's' : ''} available` : 'Browse our verified gadget catalogue'}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
            {LISTING_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/listings${cat !== 'All' ? `?category=${cat}` : ''}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Products */}
      <section className="py-12 bg-surface min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside>
              <Suspense fallback={<div className="h-12 bg-white rounded-xl border border-gray-100 animate-pulse" />}>
                <FilterBar />
              </Suspense>
            </aside>

            <div>
              {products.length === 0 ? (
                hasActiveFilters ? (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={24} className="text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-700 text-gray-900 mb-2">No results match your filters</h3>
                    <p className="text-gray-500 mb-6">Try widening your search or clearing a filter.</p>
                    <Link
                      href={clearFiltersHref}
                      className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
                    >
                      Clear Filters
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={24} className="text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-700 text-gray-900 mb-2">No listings yet in this category</h3>
                    <p className="text-gray-500 mb-6">We are actively onboarding verified vendors. Check back soon.</p>
                    <Link
                      href={buildWhatsAppUrl(`Hi, I'm looking for ${activeCategory === 'All' ? 'a gadget' : activeCategory} on Zolarux`)}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-primary text-white font-700 px-6 py-3 rounded-xl hover:bg-primary-dark transition-all"
                    >
                      <MessageCircle size={16} />
                      Request via WhatsApp
                    </Link>
                  </div>
                )
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      {currentPage > 1 && (
                        <Link
                          href={pageHref(currentPage - 1)}
                          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          Previous
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </span>
                      {currentPage < totalPages && (
                        <Link
                          href={pageHref(currentPage + 1)}
                          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Request CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-display text-xl font-700 text-gray-900 mb-2">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-gray-500 mb-6">
            Tell us exactly what you need. Our team will source it from a verified vendor for you.
          </p>
          <Link
            href={buildWhatsAppUrl(`Hi, I'd like to request a product on Zolarux`)}
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-700 px-6 py-3 rounded-xl hover:bg-green-600 transition-all"
          >
            <MessageCircle size={16} />
            Request a Product
          </Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds. `/listings` should still be listed as dynamic (`ƒ`) in the route output.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, then in a browser:
- Visit `/listings` — confirm the page renders with the sidebar filter panel on desktop (resize to `<1024px` to confirm it becomes a bottom-sheet drawer opened by the filter icon button next to search).
- Type a search term with no matches, submit, confirm the "No results match your filters" state with a working "Clear Filters" link appears.
- With no Supabase data configured, confirm the "No listings yet in this category" state (no filters active) still appears instead — the two empty states must be distinguishable by whether a filter is active.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/listings/page.tsx"
git commit -m "feat: wire FilterBar and ProductCard into Listings page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Gallery and SpecsTable components

**Files:**
- Create: `components/ui/Gallery.tsx`
- Create: `components/ui/SpecsTable.tsx`

**Interfaces:**
- Consumes: `ProductSpec` type (Task 2)
- Produces: `Gallery` component (props: `{ images: string[]; alt: string }`); `SpecsTable` component (props: `{ specs: ProductSpec[] | null }`, renders `null` when empty)

- [ ] **Step 1: Create `Gallery`**

Must degrade gracefully: zero images shows a placeholder icon; one image shows a clean single image with no thumbnail strip; multiple images show a thumbnail strip that switches the main image.

```tsx
'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-3xl border border-gray-100 shadow-card flex items-center justify-center text-gray-300">
        <ShoppingBag size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-card group">
        <img
          src={images[activeIndex]}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === i ? 'border-primary' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `SpecsTable`**

```tsx
import type { ProductSpec } from '@/types/product'

export function SpecsTable({ specs }: { specs: ProductSpec[] | null }) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="font-display font-700 text-gray-900 mb-3">Specifications</h3>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">{spec.label}</span>
            <span className="text-gray-900 font-600">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add components/ui/Gallery.tsx components/ui/SpecsTable.tsx
git commit -m "feat: add Gallery and SpecsTable components

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Listing Detail integration

**Files:**
- Modify: `app/(marketing)/listings/[id]/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `getProductById`, `getRelatedProducts` (Task 5), `Gallery`, `SpecsTable` (Task 8), `ProductCard` (Task 4), `Badge` (Task 3)

- [ ] **Step 1: Replace the file contents**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle, Lock, ArrowLeft, MessageCircle } from 'lucide-react'
import { Gallery } from '@/components/ui/Gallery'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/ui/ProductCard'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: `Buy ${product.name} safely on Zolarux. Vendor verified, escrow protected. ${product.pricing_type === 'fixed' ? formatPrice(product.price) : 'Price on request'}.`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const allImages = [imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[]
  const uniqueImages = Array.from(new Set(allImages))
  const whatsappMsg = `Hi, I want to buy "${product.name}" on Zolarux. Can you help me start the escrow process?`
  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Gallery images={uniqueImages} alt={product.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="verified" />
              {product.condition && <Badge variant="condition" condition={product.condition} />}
            </div>

            <h1 className="font-display text-3xl font-800 text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-4">
              {product.brand ? `${product.brand} · ${product.category}` : product.category}
            </p>

            <div className="mb-6">
              {product.pricing_type === 'quote' ? (
                <p className="font-display text-2xl font-800 text-primary">Price on Request</p>
              ) : (
                <p className="font-display text-3xl font-800 text-gray-900">{formatPrice(product.price)}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">+ small escrow protection fee</p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-display font-700 text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <SpecsTable specs={product.specs} />

            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-display font-700">{product.vendor_name?.[0] || 'V'}</span>
                </div>
                <div>
                  <p className="font-700 text-gray-900 text-sm">{product.vendor_name || 'Verified Vendor'}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={11} />
                    <span>Zolarux Verified Vendor</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={buildWhatsAppUrl(whatsappMsg)}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 mb-4"
            >
              <MessageCircle size={18} />
              Start Escrow Purchase
            </Link>

            <div className="flex items-start gap-2 bg-primary-light rounded-xl p-4">
              <Lock size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-primary text-xs leading-relaxed">
                Your payment is held by Zolarux — not the vendor. It is only released
                after you confirm you have received your item and are satisfied.
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-800 text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds; `/listings/[id]` still listed as dynamic.

- [ ] **Step 3: Manual verification**

With `npm run dev` running, visit a real product URL (or confirm `notFound()` renders correctly for a nonexistent id): confirm the gallery shows correctly with 0/1/many images (a product with only one photo should show no thumbnail strip), confirm specs only render when present, confirm the related-products section only renders when there are related items.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/listings/[id]/page.tsx"
git commit -m "feat: add Gallery, SpecsTable, and Related Products to Listing Detail

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Home page — Featured Products rail + hero elevation

**Files:**
- Modify: `app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedProducts` (Task 5), `ProductCard` (Task 4), `StatTile` (Task 3)

- [ ] **Step 1: Convert `HomePage` to an async server component and fetch featured products**

Change the function signature (currently `export default function HomePage()`) to:

```tsx
export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(4)
  return (
    <div className="overflow-x-hidden">
```

Add the import at the top:

```tsx
import { getFeaturedProducts } from '@/lib/products'
import { ProductCard } from '@/components/ui/ProductCard'
import { StatTile } from '@/components/ui/StatTile'
```

- [ ] **Step 2: Replace the STATS bar's inline mapping with `StatTile`**

Current code (`app/(marketing)/page.tsx:182-193`):

```tsx
<section className="bg-gray-950 py-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-800">
      {STATS.map((stat) => (
        <div key={stat.label} className="text-center px-6 py-2">
          <p className="font-display text-3xl font-800 text-white">{stat.value}</p>
          <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

Replace with:

```tsx
<section className="bg-gray-950 py-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-800">
      {STATS.map((stat) => (
        <StatTile key={stat.label} value={stat.value} label={stat.label} variant="dark" />
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Elevate the hero section**

Current hero (`app/(marketing)/page.tsx:119-179`) has a single background glow layer and no entrance animation. Replace the section's opening (through the headline block) to add a second glow layer for depth, a larger type scale on extra-large screens, and an entrance animation matching the rest of the page:

```tsx
<section className="relative bg-primary overflow-hidden">
  {/* Background pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/20 -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
  </div>
  <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-40">
    <div className="max-w-3xl animate-fade-up">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-8">
        <Shield size={13} className="text-accent" />
        <span className="text-white/90 text-xs font-600 tracking-wide">
          Trust Infrastructure for Nigerian Gadget Commerce
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-800 text-white leading-[1.05] mb-6">
        Buy Gadgets Online{' '}
        <span className="text-accent">Without Fear.</span>
      </h1>
```

(Everything after the headline — the paragraph, CTAs, and trust signals — stays exactly as-is; only the opening wrapper markup above changes.)

- [ ] **Step 4: Add the Featured Products rail**

Insert this new section immediately after the "CATEGORY BROWSE" section and before "HOW IT WORKS" (i.e., after `app/(marketing)/page.tsx:236` in the original file, right before the `{/* ── HOW IT WORKS ── */}` comment):

```tsx
{/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
{featuredProducts.length > 0 && (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-3">
            Featured Right Now
          </h2>
          <p className="text-gray-500 text-lg">
            Hand-picked, verified, escrow-protected.
          </p>
        </div>
        <Link
          href="/listings"
          className="hidden sm:inline-flex items-center gap-2 text-primary font-700 hover:gap-3 transition-all shrink-0"
        >
          See all listings <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds. `/` moves from static (`○`) to dynamic (`ƒ`) in the route output since it now fetches from Supabase at request time — this is expected and correct.

- [ ] **Step 6: Manual verification**

With `npm run dev` running, visit `/`: confirm the hero renders with the added depth glow and larger heading on a wide viewport, confirm the stats bar still displays correctly, confirm the Featured Products section is hidden entirely when there are no featured products (rather than showing an empty grid).

- [ ] **Step 7: Commit**

```bash
git add "app/(marketing)/page.tsx"
git commit -m "feat: add Featured Products rail and elevate hero on Home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: About page elevation

**Files:**
- Modify: `app/(marketing)/about/page.tsx`

**Interfaces:**
- Consumes: `StatTile` (Task 3)

- [ ] **Step 1: Replace the stat grid with `StatTile`**

Current code (`app/(marketing)/about/page.tsx:90-102`):

```tsx
<div className="grid grid-cols-2 gap-4">
  {[
    { number: '₦2M+', label: 'Transactions Protected' },
    { number: '100+', label: 'Happy Customers' },
    { number: '5yrs', label: 'In Operation' },
    { number: '0',    label: 'Confirmed Scams' },
  ].map((stat) => (
    <div key={stat.label} className="bg-surface rounded-2xl p-6 text-center border border-gray-100">
      <p className="font-display text-4xl font-800 text-primary mb-2">{stat.number}</p>
      <p className="text-gray-500 text-sm">{stat.label}</p>
    </div>
  ))}
</div>
```

Replace with (keeps the individual bordered-card layout, but the number/label typography now comes from the same `StatTile` atom used on Home, satisfying the "same treatment" requirement):

```tsx
<div className="grid grid-cols-2 gap-4">
  {[
    { number: '₦2M+', label: 'Transactions Protected' },
    { number: '100+', label: 'Happy Customers' },
    { number: '5yrs', label: 'In Operation' },
    { number: '0',    label: 'Confirmed Scams' },
  ].map((stat) => (
    <div key={stat.label} className="bg-surface rounded-2xl p-2 text-center border border-gray-100">
      <StatTile value={stat.number} label={stat.label} />
    </div>
  ))}
</div>
```

Add the import at the top: `import { StatTile } from '@/components/ui/StatTile'`.

- [ ] **Step 2: Elevate the story section's editorial typography**

Current lead heading (`app/(marketing)/about/page.tsx:64-66`):

```tsx
<h2 className="font-display text-3xl font-800 text-gray-900 mb-6">
  Five Years of Building Trust Infrastructure
</h2>
```

Replace with a slightly larger, tighter-tracked treatment consistent with the hero's typographic confidence:

```tsx
<h2 className="font-display text-3xl sm:text-4xl font-800 text-gray-900 mb-6 leading-[1.1] tracking-tight">
  Five Years of Building Trust Infrastructure
</h2>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds; `/about` remains static (`○`).

- [ ] **Step 4: Manual verification**

Visit `/about` in the dev server: confirm the stat tiles render identically in typographic weight/color to Home's stats bar (adjusted for the light background), confirm the story heading reads larger and tighter than before.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/about/page.tsx"
git commit -m "feat: elevate About page typography and reuse StatTile

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Check Vendor visual elevation

**Files:**
- Modify: `app/(tools)/check-vendor/page.tsx`

**Interfaces:**
- Consumes: nothing new — no logic changes, presentation only

- [ ] **Step 1: Add entrance animation to the result panel**

The result block (`app/(tools)/check-vendor/page.tsx:109-120`) currently appears with no transition. Add the site's existing `animate-fade-up` utility:

Current:

```tsx
{result && (
  <div className="mt-6">
    {result.type === 'verified' && <VendorResult vendor={result.vendor} />}
    {result.type === 'flagged' && <FlaggedResult entity={result.entity} />}
    {result.type === 'not_found' && <NotFoundResult query={query} />}
    {result.type === 'error' && (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <p className="text-red-700 text-sm">Something went wrong. Please try again.</p>
      </div>
    )}
  </div>
)}
```

Replace with:

```tsx
{result && (
  <div className="mt-6 animate-fade-up">
    {result.type === 'verified' && <VendorResult vendor={result.vendor} />}
    {result.type === 'flagged' && <FlaggedResult entity={result.entity} />}
    {result.type === 'not_found' && <NotFoundResult query={query} />}
    {result.type === 'error' && (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <p className="text-red-700 text-sm">Something went wrong. Please try again.</p>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Elevate the search card's hover/focus polish**

Current search card wrapper (`app/(tools)/check-vendor/page.tsx:81`):

```tsx
<div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
```

Replace with:

```tsx
<div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-gray-100">
```

- [ ] **Step 3: Elevate the three info boxes with hover lift**

Current info box wrapper (`app/(tools)/check-vendor/page.tsx:130`):

```tsx
<div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
```

Replace with:

```tsx
<div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center hover:-translate-y-0.5 hover:shadow-card transition-all duration-300">
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds; `/check-vendor` remains static (`○`) — this page fetches client-side on interaction, not at request time.

- [ ] **Step 5: Manual verification**

Visit `/check-vendor` in the dev server: submit a query and confirm the result panel fades/slides in rather than popping in abruptly; confirm the search card and info boxes now show a subtle hover response.

- [ ] **Step 6: Commit**

```bash
git add "app/(tools)/check-vendor/page.tsx"
git commit -m "feat: elevate Check Vendor motion and hover polish

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Login page elevation

**Files:**
- Modify: `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: nothing new — no logic changes, presentation only

- [ ] **Step 1: Add a transition when switching between the phone and OTP steps**

Current step container (`app/(auth)/login/page.tsx:73`) renders either block with no transition. Wrap each branch's root `<div>` with the existing `animate-fade-up` utility so switching steps feels intentional rather than an abrupt swap:

Current:

```tsx
{step === 'phone' ? (
  <div className="space-y-4">
```

Replace with:

```tsx
{step === 'phone' ? (
  <div className="space-y-4 animate-fade-up" key="phone-step">
```

And current:

```tsx
) : (
  <div className="space-y-4">
```

Replace with:

```tsx
) : (
  <div className="space-y-4 animate-fade-up" key="otp-step">
```

- [ ] **Step 2: Elevate the card's shadow and entrance**

Current card wrapper (`app/(auth)/login/page.tsx:63`):

```tsx
<div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
```

Replace with:

```tsx
<div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 overflow-hidden animate-fade-up">
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds; `/login` remains static (`○`).

- [ ] **Step 4: Manual verification**

Visit `/login` in the dev server: confirm the card has a slightly stronger shadow and fades in on load; enter a phone number and confirm the OTP step transitions in with the same fade rather than an instant swap.

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/login/page.tsx"
git commit -m "feat: elevate Login card presentation and step transitions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 14: Navbar/Footer elevation

**Files:**
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: nothing new — no navigational/structural changes, no new links

- [ ] **Step 1: Smooth the Navbar's scroll-state transition**

Current header classes (`components/layout/Navbar.tsx:38-45`) already transition `bg`/`shadow`/`border` over `duration-300`. Extend the transition to also ease `backdrop-filter` by using Tailwind's general transition utility instead of `transition-all` scoped only implicitly — this is already covered by the existing `transition-all duration-300` class, so no change is needed here structurally; instead, refine the Safety Tools dropdown's entrance (currently appears instantly):

Current (`components/layout/Navbar.tsx:95-96`):

```tsx
{safetyOpen && (
  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[480px]">
```

Replace with:

```tsx
{safetyOpen && (
  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[480px] animate-fade-up">
```

- [ ] **Step 2: Elevate the mobile menu's entrance**

Current (`components/layout/Navbar.tsx:152-153`):

```tsx
{mobileOpen && (
  <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
```

Replace with:

```tsx
{mobileOpen && (
  <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-up">
```

- [ ] **Step 3: Tighten Footer's trust bar spacing and add a hover state to link columns**

Current footer link (`components/layout/Footer.tsx:74-79`):

```tsx
<Link
  href={link.href}
  className="text-gray-400 hover:text-white text-sm transition-colors"
>
  {link.label}
</Link>
```

Replace with (adds a small rightward shift on hover, matching the "hover:gap-3" nudge pattern used elsewhere on the site, e.g. the "See all verified listings" link on Home):

```tsx
<Link
  href={link.href}
  className="text-gray-400 hover:text-white hover:translate-x-0.5 inline-block text-sm transition-all"
>
  {link.label}
</Link>
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: 0 errors (the pre-existing warnings from Task 1's baseline are unaffected by this task since it doesn't touch the lines they're on).

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Manual verification**

With `npm run dev` running, on any page: open the desktop Safety Tools dropdown and confirm it fades/slides in; open the mobile menu (narrow viewport) and confirm the same; scroll to the footer and confirm each link nudges right on hover.

- [ ] **Step 6: Commit**

```bash
git add components/layout/Navbar.tsx components/layout/Footer.tsx
git commit -m "feat: elevate Navbar/Footer motion and hover polish

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 15: Final verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Full lint pass**

Run: `npm run lint`
Expected: 0 errors, only the pre-existing warnings enumerated in Task 1 Step 3.

- [ ] **Step 2: Full typecheck**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Full production build**

Run: `npm run build`
Expected: succeeds. Confirm the route table shows `/` and `/listings`/`/listings/[id]` as dynamic (`ƒ`) and `/about`, `/check-vendor`, `/login` as static (`○`), matching each page's actual data-fetching behavior.

- [ ] **Step 4: Manual QA pass across all six pages**

Using the `run` skill to drive `npm run dev` in a browser, check each of the following at mobile (~375px), tablet (~768px), and desktop (~1280px+) widths:

- **Home**: hero renders correctly at all widths, stats bar, featured products rail (or its absence with no data), category browse, how-it-works, trust tools, testimonials, dual CTA all render without layout breaks.
- **Listings**: category chips, `FilterBar` (sidebar on desktop, drawer on mobile/tablet), product grid, both empty states, pagination all work; confirm a representative filter combination (e.g. condition + sort together) produces a URL with both params and correct results.
- **Listing Detail**: `Gallery` (test a product with 0, 1, and multiple images if seed data allows), `SpecsTable` (present and absent), vendor block, WhatsApp CTA, Related Products (present and absent).
- **About**: story section, stat tiles, values grid, team section.
- **Check Vendor**: search flow for a verified, flagged, and not-found result, each rendering correctly with the new entrance animation.
- **Login**: phone step, OTP step, and the transition between them.
- **Navbar/Footer**: present and functioning identically on every page above, including the Safety Tools dropdown and mobile menu.

- [ ] **Step 5: Record results**

No commit needed for this task — it's a verification gate. If any check fails, return to the relevant task above, fix it there, and re-run this task's steps before considering the plan complete.
