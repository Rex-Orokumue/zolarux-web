# SentinelX Admin Page Polish + Navbar Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the `/admin/sentinelx` escrow orders page (status badges, correct kobo→Naira formatting, filtering, search, pagination, summary stats, mobile-responsive layout) and make it discoverable via an admin-only "Admin" link in the main site `Navbar`.

**Architecture:** Pure URL-param parsing/building logic (status filter, search sanitization, pagination) is extracted into a new `lib/sentinelx/admin-filters.ts` module so it's unit-testable under this repo's existing `lib/**/*.test.ts` Vitest scope. `app/admin/sentinelx/page.tsx` (server component) uses that module to query `sentinelx_orders` with filters/pagination plus separate aggregate-count queries for summary stats, and renders a new `SentinelXFilters` server component (status pills + search form, no client JS) alongside the restyled `SentinelXOrdersTable` client component. Admin discoverability is added via a new thin `GET /api/admin/me` route (wraps the already-tested `requireAdminUser()`) that the client-side `Navbar` polls once per session to decide whether to render an "Admin" link — this keeps the `ADMIN_EMAILS` allowlist server-only.

**Tech Stack:** Next.js 16 App Router (server + client components), Supabase JS client (`createAdminClient()`, service-role), Tailwind CSS, `lucide-react` icons, Vitest for unit tests.

## Global Constraints

- `sentinelx_orders.amount` is stored in **kobo** — always divide by 100 before passing to `formatPrice()` when displaying it. Never touch the stored/transmitted kobo values themselves (only display formatting changes).
- This repo's Vitest config only runs `lib/**/*.test.ts` (see `vitest.config.ts`) and there is no component/route-handler test harness installed. Per the existing `2026-07-10-sentinelx-escrow-api.md` plan's established convention: route handlers and React components are verified manually (curl / dev server / browser), and only pure `lib/` functions get automated unit tests. Do not attempt to add a testing library — extract pure logic into `lib/` instead, as this plan does.
- Follow existing repo conventions: Tailwind utility classes already in use elsewhere (`font-display`, `font-600/700/800`, `bg-primary`/`bg-primary-light`/`text-primary`, `shadow-card`, `rounded-2xl`, `bg-surface`) — do not invent new design tokens.
- `requireAdminUser()` (`lib/admin/require-admin.ts`) and its allowlist mechanism are not to be changed.
- The real access boundary stays server-side (`app/admin/layout.tsx`'s `requireAdminUser()` redirect). The Navbar link is a discoverability affordance only, not a security control — it must fail closed (hidden) on any fetch error.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/sentinelx/admin-filters.ts` | New. Pure helpers: validate `status` param, sanitize `q` param, parse/clamp `page` param, build `/admin/sentinelx` hrefs from those params. |
| `lib/__tests__/sentinelx-admin-filters.test.ts` | New. Unit tests for the above. |
| `app/api/admin/me/route.ts` | New. `GET` → `{ isAdmin: boolean }`, thin wrapper over `requireAdminUser()`. |
| `app/admin/sentinelx/SentinelXOrdersTable.tsx` | Modify. Status badges, kobo→Naira + date formatting, truncated IDs, colored action buttons, empty state, responsive table/card layout. |
| `app/admin/sentinelx/SentinelXFilters.tsx` | New. Status-pill links + GET search form (server component, no client JS). |
| `app/admin/sentinelx/page.tsx` | Modify. Reads `searchParams`, queries with filters/pagination, computes summary stats, renders stats row + filters + table + pagination. |
| `components/layout/Navbar.tsx` | Modify. Fetches admin status once a session exists; shows an "Admin" link (desktop + mobile) when `isAdmin`. |

---

### Task 1: `lib/sentinelx/admin-filters.ts` — pure filter/pagination helpers

**Files:**
- Create: `lib/sentinelx/admin-filters.ts`
- Test: `lib/__tests__/sentinelx-admin-filters.test.ts`

**Interfaces:**
- Consumes: `SentinelXOrderStatus` from `@/types/sentinelx` (already defined: `'initiated' | 'held' | 'released' | 'refunded' | 'disputed'`).
- Produces (consumed by Tasks 4 and 5):
  - `parseStatusFilter(status: string | undefined): SentinelXOrderStatus | undefined`
  - `sanitizeSearch(q: string | undefined): string`
  - `parsePage(page: string | undefined): number`
  - `buildSentinelXHref(params: { status?: string; q?: string; page?: number }): string`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/sentinelx-admin-filters.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseStatusFilter, sanitizeSearch, parsePage, buildSentinelXHref } from '@/lib/sentinelx/admin-filters'

describe('parseStatusFilter', () => {
  it('returns the status when it is a valid SentinelXOrderStatus', () => {
    expect(parseStatusFilter('held')).toBe('held')
  })
  it('returns undefined for an invalid status', () => {
    expect(parseStatusFilter('bogus')).toBeUndefined()
  })
  it('returns undefined when status is undefined', () => {
    expect(parseStatusFilter(undefined)).toBeUndefined()
  })
})

describe('sanitizeSearch', () => {
  it('trims whitespace', () => {
    expect(sanitizeSearch('  order123  ')).toBe('order123')
  })
  it('strips %, comma, and ) characters', () => {
    expect(sanitizeSearch('abc%,)def')).toBe('abcdef')
  })
  it('returns empty string when q is undefined', () => {
    expect(sanitizeSearch(undefined)).toBe('')
  })
})

describe('parsePage', () => {
  it('defaults to 1 when page is undefined', () => {
    expect(parsePage(undefined)).toBe(1)
  })
  it('parses a valid positive integer string', () => {
    expect(parsePage('3')).toBe(3)
  })
  it('clamps to 1 for zero or negative values', () => {
    expect(parsePage('0')).toBe(1)
    expect(parsePage('-5')).toBe(1)
  })
  it('clamps to 1 for non-numeric input', () => {
    expect(parsePage('abc')).toBe(1)
  })
})

describe('buildSentinelXHref', () => {
  it('returns the base path with no params', () => {
    expect(buildSentinelXHref({})).toBe('/admin/sentinelx')
  })
  it('includes status when provided', () => {
    expect(buildSentinelXHref({ status: 'held' })).toBe('/admin/sentinelx?status=held')
  })
  it('includes q when provided', () => {
    expect(buildSentinelXHref({ q: 'order123' })).toBe('/admin/sentinelx?q=order123')
  })
  it('omits page when it is 1', () => {
    expect(buildSentinelXHref({ page: 1 })).toBe('/admin/sentinelx')
  })
  it('includes page when greater than 1', () => {
    expect(buildSentinelXHref({ page: 2 })).toBe('/admin/sentinelx?page=2')
  })
  it('combines status, q, and page', () => {
    expect(buildSentinelXHref({ status: 'disputed', q: 'foo', page: 3 })).toBe(
      '/admin/sentinelx?status=disputed&q=foo&page=3'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/__tests__/sentinelx-admin-filters.test.ts`
Expected: FAIL — `Cannot find module '@/lib/sentinelx/admin-filters'`

- [ ] **Step 3: Write the implementation**

Create `lib/sentinelx/admin-filters.ts`:

```ts
import type { SentinelXOrderStatus } from '@/types/sentinelx'

const FILTERABLE_STATUSES: SentinelXOrderStatus[] = ['initiated', 'held', 'released', 'refunded', 'disputed']

export function parseStatusFilter(status: string | undefined): SentinelXOrderStatus | undefined {
  if (!status) return undefined
  return (FILTERABLE_STATUSES as string[]).includes(status) ? (status as SentinelXOrderStatus) : undefined
}

export function sanitizeSearch(q: string | undefined): string {
  return (q || '').replace(/[%,)]/g, '').trim()
}

export function parsePage(page: string | undefined): number {
  const parsed = parseInt(page || '1', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function buildSentinelXHref(params: { status?: string; q?: string; page?: number }): string {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.q) search.set('q', params.q)
  if (params.page && params.page > 1) search.set('page', String(params.page))
  const qs = search.toString()
  return `/admin/sentinelx${qs ? `?${qs}` : ''}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/__tests__/sentinelx-admin-filters.test.ts`
Expected: PASS — all 13 tests green

- [ ] **Step 5: Commit**

```bash
git add lib/sentinelx/admin-filters.ts lib/__tests__/sentinelx-admin-filters.test.ts
git commit -m "feat(sentinelx): add admin filter/pagination URL helpers"
```

---

### Task 2: `GET /api/admin/me` — admin-status check route

**Files:**
- Create: `app/api/admin/me/route.ts`

**Interfaces:**
- Consumes: `requireAdminUser()` from `@/lib/admin/require-admin` (existing, already unit-tested in `lib/__tests__/require-admin.test.ts`).
- Produces (consumed by Task 6): `GET /api/admin/me` → `200 { isAdmin: boolean }` (always 200; never 401/500 for this endpoint since it's just a discoverability check).

- [ ] **Step 1: Write the route**

Create `app/api/admin/me/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin/require-admin'

export async function GET() {
  const admin = await requireAdminUser()
  return NextResponse.json({ isAdmin: !!admin })
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`

In another terminal, with no auth cookie sent, confirm the endpoint fails closed:

```bash
curl -s http://localhost:3000/api/admin/me
```

Expected: `{"isAdmin":false}` (no session ⇒ `requireAdminUser()` returns `null` ⇒ `isAdmin: false`). This matches the existing repo convention of manually verifying route handlers rather than adding a test harness (see `lib/__tests__/require-admin.test.ts`, which already covers every branch of `requireAdminUser()` itself).

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/me/route.ts
git commit -m "feat(admin): add /api/admin/me isAdmin check route"
```

---

### Task 3: `SentinelXOrdersTable.tsx` — visual polish

**Files:**
- Modify: `app/admin/sentinelx/SentinelXOrdersTable.tsx` (full rewrite; current file is 86 lines)

**Interfaces:**
- Consumes: `SentinelXOrder`, `SentinelXOrderStatus` from `@/types/sentinelx`; `formatPrice`, `formatDate`, `truncate` from `@/lib/utils` (all pre-existing, unchanged).
- Produces: same exported `SentinelXOrdersTable({ orders }: { orders: SentinelXOrder[] })` component signature as before — Task 5 passes it `orders` exactly as it does today, no prop changes.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `app/admin/sentinelx/SentinelXOrdersTable.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import { formatPrice, formatDate, truncate } from '@/lib/utils'
import type { SentinelXOrder, SentinelXOrderStatus } from '@/types/sentinelx'

const STATUS_CONFIG: Record<SentinelXOrderStatus, { label: string; color: string; bg: string; border: string }> = {
  initiated: { label: 'Initiated', color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-200' },
  held:      { label: 'In Escrow', color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200' },
  released:  { label: 'Released',  color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300' },
  refunded:  { label: 'Refunded',  color: 'text-gray-700',  bg: 'bg-gray-100',  border: 'border-gray-200' },
  disputed:  { label: 'Disputed',  color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
}

const ACTIONS_BY_STATUS: Record<string, { action: 'release' | 'refund' | 'dispute'; label: string; classes: string }[]> = {
  held: [
    { action: 'release', label: 'Release to seller', classes: 'text-green-700 border-green-200 hover:bg-green-50' },
    { action: 'refund',  label: 'Refund buyer',       classes: 'text-gray-600 border-gray-200 hover:bg-gray-50' },
    { action: 'dispute', label: 'Mark disputed',      classes: 'text-red-700 border-red-200 hover:bg-red-50' },
  ],
  disputed: [
    { action: 'release', label: 'Release to seller', classes: 'text-green-700 border-green-200 hover:bg-green-50' },
    { action: 'refund',  label: 'Refund buyer',       classes: 'text-gray-600 border-gray-200 hover:bg-gray-50' },
  ],
}

function StatusBadge({ status }: { status: SentinelXOrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-600 border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

export function SentinelXOrdersTable({ orders }: { orders: SentinelXOrder[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAction(id: string, action: 'release' | 'refund' | 'dispute') {
    setPendingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/sentinelx/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Action failed')
    } finally {
      setPendingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
        <Package size={32} className="text-gray-200 mx-auto mb-4" />
        <h3 className="font-display font-700 text-gray-900 mb-2">No orders match these filters</h3>
        <p className="text-gray-400 text-sm">Try a different status or search term.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {error && <p className="text-red-600 text-sm px-4 pt-4">{error}</p>}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Listing</th>
              <th className="py-3 px-4">Buyer</th>
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Initiated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 px-4 font-mono text-xs">{order.order_ref}</td>
                <td className="py-3 px-4">{order.listing_title}</td>
                <td className="py-3 px-4 text-gray-500" title={order.buyer_id}>{truncate(order.buyer_id, 10)}</td>
                <td className="py-3 px-4 text-gray-500" title={order.seller_id}>{truncate(order.seller_id, 10)}</td>
                <td className="py-3 px-4 font-600">{formatPrice(order.amount / 100)}</td>
                <td className="py-3 px-4 text-gray-500">{formatDate(order.initiated_at)}</td>
                <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label, classes }) => (
                      <button
                        key={action}
                        disabled={pendingId === order.id}
                        onClick={() => runAction(order.id, action)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${classes}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-50">
        {orders.map((order) => (
          <div key={order.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-500">{order.order_ref}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="font-600 text-gray-900">{order.listing_title}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p title={order.buyer_id}>Buyer: {truncate(order.buyer_id, 14)}</p>
              <p title={order.seller_id}>Seller: {truncate(order.seller_id, 14)}</p>
              <p>Initiated: {formatDate(order.initiated_at)}</p>
            </div>
            <p className="font-display font-700 text-gray-900">{formatPrice(order.amount / 100)}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label, classes }) => (
                <button
                  key={action}
                  disabled={pendingId === order.id}
                  onClick={() => runAction(order.id, action)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${classes}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `SentinelXOrdersTable.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/admin/sentinelx/SentinelXOrdersTable.tsx
git commit -m "feat(admin): polish SentinelX orders table with badges, formatting, mobile layout"
```

---

### Task 4: `SentinelXFilters.tsx` — status pills + search form

**Files:**
- Create: `app/admin/sentinelx/SentinelXFilters.tsx`

**Interfaces:**
- Consumes: `buildSentinelXHref` from `@/lib/sentinelx/admin-filters` (Task 1); `SentinelXOrderStatus` from `@/types/sentinelx`.
- Produces (consumed by Task 5): `SentinelXFilters({ activeStatus, search }: { activeStatus: SentinelXOrderStatus | undefined; search: string })`.

- [ ] **Step 1: Write the component**

Create `app/admin/sentinelx/SentinelXFilters.tsx`:

```tsx
import Link from 'next/link'
import { buildSentinelXHref } from '@/lib/sentinelx/admin-filters'
import type { SentinelXOrderStatus } from '@/types/sentinelx'

const STATUS_PILLS: { label: string; value: SentinelXOrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Held', value: 'held' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Released', value: 'released' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Initiated', value: 'initiated' },
]

export function SentinelXFilters({
  activeStatus,
  search,
}: {
  activeStatus: SentinelXOrderStatus | undefined
  search: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {STATUS_PILLS.map((pill) => (
          <Link
            key={pill.label}
            href={buildSentinelXHref({ status: pill.value, q: search })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all ${
              activeStatus === pill.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {pill.label}
          </Link>
        ))}
      </div>

      <form method="GET" action="/admin/sentinelx" className="flex gap-2 sm:ml-auto">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search order ref or listing…"
          className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-600 hover:bg-primary-dark transition-all shrink-0"
        >
          Search
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `SentinelXFilters.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/admin/sentinelx/SentinelXFilters.tsx
git commit -m "feat(admin): add SentinelX status filter pills and search form"
```

---

### Task 5: `app/admin/sentinelx/page.tsx` — filters, pagination, stats

**Files:**
- Modify: `app/admin/sentinelx/page.tsx` (full rewrite; current file is 19 lines)

**Interfaces:**
- Consumes: `parseStatusFilter`, `sanitizeSearch`, `parsePage`, `buildSentinelXHref` (Task 1); `SentinelXFilters` (Task 4); `SentinelXOrdersTable` (Task 3, unchanged prop signature); `formatPrice` from `@/lib/utils`.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `app/admin/sentinelx/page.tsx` with:

```tsx
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { SentinelXOrdersTable } from './SentinelXOrdersTable'
import { SentinelXFilters } from './SentinelXFilters'
import { formatPrice } from '@/lib/utils'
import { parseStatusFilter, sanitizeSearch, parsePage, buildSentinelXHref } from '@/lib/sentinelx/admin-filters'
import type { SentinelXOrder } from '@/types/sentinelx'

const PAGE_SIZE = 20

export default async function SentinelXOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = createAdminClient()

  const statusFilter = parseStatusFilter(params.status)
  const search = sanitizeSearch(params.q)
  const currentPage = parsePage(params.page)

  let query = supabase
    .from('sentinelx_orders')
    .select('*', { count: 'exact' })
    .order('initiated_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)
  if (search) query = query.or(`order_ref.ilike.%${search}%,listing_title.ilike.%${search}%`)

  const { data: orders, count } = await query.range(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE - 1
  )

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))

  const [heldRes, disputedRes, releasedRes, refundedRes, heldAmountsRes] = await Promise.all([
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'held'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'disputed'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'released'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'refunded'),
    supabase.from('sentinelx_orders').select('amount').eq('status', 'held'),
  ])

  const escrowValueKobo = (heldAmountsRes.data || []).reduce((sum, row: { amount: number }) => sum + row.amount, 0)

  const stats = [
    { label: 'Held', value: heldRes.count || 0, color: 'text-amber-600' },
    { label: 'Disputed', value: disputedRes.count || 0, color: 'text-red-600' },
    { label: 'Released', value: releasedRes.count || 0, color: 'text-green-600' },
    { label: 'Refunded', value: refundedRes.count || 0, color: 'text-gray-600' },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">SentinelX Escrow Orders</h1>
        <span className="text-sm text-gray-400">{count || 0} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
            <p className={`font-display font-800 text-2xl ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
          <p className="font-display font-800 text-2xl text-primary">{formatPrice(escrowValueKobo / 100)}</p>
          <p className="text-gray-400 text-xs mt-1">Value in Escrow</p>
        </div>
      </div>

      <SentinelXFilters activeStatus={statusFilter} search={params.q || ''} />

      <SentinelXOrdersTable orders={(orders as SentinelXOrder[]) || []} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {currentPage > 1 && (
            <Link
              href={buildSentinelXHref({ status: statusFilter, q: search, page: currentPage - 1 })}
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
              href={buildSentinelXHref({ status: statusFilter, q: search, page: currentPage + 1 })}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/admin/sentinelx/page.tsx`

- [ ] **Step 3: Manually verify against the dev server**

Run: `npm run dev`, sign in as a user whose email is in `ADMIN_EMAILS`, and visit:
- `http://localhost:3000/admin/sentinelx` — confirm stats row, filter pills, search box, table (or empty state if no orders), and pagination (if >20 orders) all render.
- `http://localhost:3000/admin/sentinelx?status=held` — confirm only held orders show and the "Held" pill is highlighted.
- `http://localhost:3000/admin/sentinelx?q=<part of an existing order_ref>` — confirm the matching order(s) show.

If there's no seed data in `sentinelx_orders` to test against, confirm at minimum that the page loads without error and shows the empty state — full filter/search/pagination behavior was already covered by Task 1's unit tests for the underlying URL logic.

- [ ] **Step 4: Commit**

```bash
git add app/admin/sentinelx/page.tsx
git commit -m "feat(admin): add filtering, search, pagination, and stats to SentinelX orders page"
```

---

### Task 6: `Navbar.tsx` — admin-only "Admin" link

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/me` (Task 2) → `{ isAdmin: boolean }`.

- [ ] **Step 1: Add an `isAdmin` state and a `checkIsAdmin` helper**

In `components/layout/Navbar.tsx`, add this helper function above the `Navbar` component (after the `SAFETY_TOOLS` constant, i.e. after line 19):

```ts
async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/me')
    if (!res.ok) return false
    const data = await res.json()
    return !!data.isAdmin
  } catch {
    return false
  }
}
```

Add the state declaration right after the existing `userRole` state (currently line 28):

```ts
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
```

- [ ] **Step 2: Wire it into the session-check effect**

In the `checkAuth` function (currently lines 96–120), the block:

```ts
      if (user) {
        setUser(user)

        // Determine role: check metadata first, then fall back to checking vendors table
```

becomes:

```ts
      if (user) {
        setUser(user)
        setIsAdmin(await checkIsAdmin())

        // Determine role: check metadata first, then fall back to checking vendors table
```

and:

```ts
      } else {
        setUser(null)
        setUserRole(null)
      }
      setAuthChecked(true)
```

becomes:

```ts
      } else {
        setUser(null)
        setUserRole(null)
        setIsAdmin(false)
      }
      setAuthChecked(true)
```

- [ ] **Step 3: Wire it into the auth-state-change subscription**

The `onAuthStateChange` callback (currently lines 124–132):

```ts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setUserRole(session.user.user_metadata?.role || userRole)
      } else {
        setUser(null)
        setUserRole(null)
      }
    })
```

becomes:

```ts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setUserRole(session.user.user_metadata?.role || userRole)
        checkIsAdmin().then(setIsAdmin)
      } else {
        setUser(null)
        setUserRole(null)
        setIsAdmin(false)
      }
    })
```

- [ ] **Step 4: Reset on sign-out**

`handleSignOut` (currently lines 137–143):

```ts
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    router.push('/')
  }
```

becomes:

```ts
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    setIsAdmin(false)
    router.push('/')
  }
```

- [ ] **Step 5: Add the desktop "Admin" link**

In the desktop CTAs block, the signed-in branch (currently lines 259–266):

```tsx
            {user ? (
              <>
                <Link
                  href={getAccountHref()}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Dashboard
                </Link>
```

becomes:

```tsx
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/sentinelx"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Shield size={14} /> Admin
                  </Link>
                )}
                <Link
                  href={getAccountHref()}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Dashboard
                </Link>
```

(`Shield` is already imported from `lucide-react` at the top of the file — no import changes needed.)

- [ ] **Step 6: Add the mobile "Admin" link**

In the mobile menu, the signed-in branch (currently lines 370–377):

```tsx
              {user ? (
                <>
                  <Link
                    href={getAccountHref()}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Dashboard
                  </Link>
```

becomes:

```tsx
              {user ? (
                <>
                  <Link
                    href={getAccountHref()}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/sentinelx"
                      className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Admin
                    </Link>
                  )}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `Navbar.tsx`

- [ ] **Step 8: Manually verify against the dev server**

With `npm run dev` running:
- Signed out: confirm no "Admin" link appears (desktop or mobile menu).
- Signed in as a non-admin user: confirm no "Admin" link appears.
- Signed in as a user whose email is in `ADMIN_EMAILS`: confirm the "Admin" link appears in both the desktop nav and the mobile menu, and clicking it navigates to `/admin/sentinelx`.

- [ ] **Step 9: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat(nav): show admin-only link to SentinelX orders page"
```

---

## Self-Review Notes

- **Spec coverage:** All four spec sections (data layer, table polish, filter/search bar, Navbar link) map 1:1 to Tasks 1/5, 3, 4, and 2/6 respectively. Error-handling rules from the spec (invalid status ignored, `q` sanitized, page clamped, fail-closed `isAdmin`) are implemented in Task 1's helpers and Task 6's `checkIsAdmin`.
- **Type consistency:** `SentinelXOrdersTable`'s prop signature (`{ orders: SentinelXOrder[] }`) is unchanged from the current file, so Task 5 doesn't need to change how it's called. `buildSentinelXHref`'s param shape (`{ status?: string; q?: string; page?: number }`) is used identically in both `SentinelXFilters.tsx` (Task 4) and `page.tsx` (Task 5).
- **No placeholders:** every step has complete, concrete code.
