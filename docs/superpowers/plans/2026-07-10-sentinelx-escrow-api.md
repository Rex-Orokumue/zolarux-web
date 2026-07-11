# SentinelX Escrow API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, shared-secret-protected API that SentinelX (an external mobile esports platform) calls to run its Gaming Exchange escrow flow through Zolarux, plus the minimal internal admin surface Zolarux ops needs to release or refund those escrows.

**Architecture:** A new `sentinelx_orders` table (kept fully separate from Zolarux's own `orders` table) tracks each escrow through `initiated → held → released | refunded`, with an optional `disputed` branch. `POST /api/sentinelx/escrow/initiate` (bearer-secret protected) creates the row and a Paystack payment link. A new `POST /api/paystack/webhook` receiver — verified via Paystack's HMAC-SHA512 signature, not the client redirect — is the sole source of truth for marking an order `held`, and fires the outbound `payment_held` webhook to SentinelX. The `released`/`refunded` transitions are **not** triggered by SentinelX; they're manual ops actions taken on a new internal `/admin/sentinelx` page, which is what fires the outbound `delivery_confirmed`/`order_refunded` webhooks. This keeps Zolarux as the actual escrow authority.

**Tech Stack:** Next.js 16 App Router route handlers, Supabase (Postgres) via `createAdminClient()` (service-role, RLS bypass), Paystack REST API via `fetch` (no SDK), Vitest for unit tests.

## Global Constraints

- All amounts are integers in **kobo**, matching the SentinelX spec — no Naira conversion anywhere in this flow (unlike the existing `orders/create` route, which stores Naira).
- `sentinelx_orders` is a **new, separate table** from `orders` — do not touch or reuse the existing `orders` table/model.
- The Paystack webhook (`charge.success`), not the client-side redirect/callback, is the only trigger that moves an order from `initiated` to `held`. This mirrors the pattern SentinelX itself already uses.
- `released`/`refunded` transitions happen only via manual ops action on `/admin/sentinelx` — there is intentionally no SentinelX-callable endpoint for these two transitions (confirmed decision).
- Admin access is gated by a comma-separated `ADMIN_EMAILS` env var checked against the existing Supabase Auth session (`getUser()`) — there is no existing admin-role concept in this codebase, so this is the new, minimal mechanism. No new login system.
- Paystack's `/transaction/initialize` requires an `email` field; the SentinelX spec doesn't provide a buyer email, so `initiate` synthesizes a placeholder (`sentinelx-buyer-<buyer_id>@zolarux.com.ng`). It is never delivered to — flag this to the SentinelX team if a real buyer email becomes available later, since a real email is nicer for their receipts.
- Follow existing repo conventions throughout: `app/api/<name>/route.ts` handlers, rate-limit-first via `lib/rate-limit.ts`, hand-rolled validation (no zod), `{ success, ... }` / `{ error }` response shapes, `createAdminClient()` for all privileged writes, tests colocated flat in `lib/__tests__/*.test.ts` (this repo's existing pattern — not per-module `__tests__` folders).
- No existing precedent in this repo for testing `route.ts` handlers directly (no `next-test-api-route-handler` or similar installed) — route handler tasks are verified manually via `curl`/browser instead of automated tests, matching how the rest of the codebase is tested (only pure `lib/` functions have unit tests).

---

## File Structure

| File | Responsibility |
|---|---|
| `migrations/004_create_sentinelx_orders.sql` | New table + indexes + RLS enable (no policies — service-role only) |
| `types/sentinelx.ts` | Shared types: order shape, status, action, webhook event/payload |
| `lib/utils.ts` (modify) | Add `generateSentinelXOrderRef()` alongside existing `generateOrderRef()` |
| `lib/sentinelx/auth.ts` | Verify inbound `Authorization: Bearer <SENTINELX_API_SECRET>` |
| `lib/sentinelx/transitions.ts` | Pure state-machine function: `(currentStatus, action) → nextStatus \| null` |
| `lib/sentinelx/webhook.ts` | Outbound webhook sender to SentinelX (fire-and-forget, never throws) |
| `lib/paystack/verify-signature.ts` | HMAC-SHA512 verification of Paystack's `x-paystack-signature` |
| `lib/admin/require-admin.ts` | Session + `ADMIN_EMAILS` allowlist check |
| `app/api/sentinelx/escrow/initiate/route.ts` | Inbound: SentinelX → Zolarux, creates order + Paystack link |
| `app/api/paystack/webhook/route.ts` | Inbound: Paystack → Zolarux, marks `held`, fires `payment_held` |
| `app/api/admin/sentinelx/[id]/route.ts` | Internal: ops release/refund/dispute action, fires `delivery_confirmed`/`order_refunded` |
| `app/admin/layout.tsx` | Gate `/admin/*` behind `requireAdminUser()` |
| `app/admin/sentinelx/page.tsx` | Server component: lists `sentinelx_orders` |
| `app/admin/sentinelx/SentinelXOrdersTable.tsx` | Client component: release/refund/dispute buttons |
| `.env.local.example` (modify) | Document `SENTINELX_API_SECRET`, `SENTINELX_WEBHOOK_URL`, `ADMIN_EMAILS` |

---

### Task 1: Database migration — `sentinelx_orders` table

**Files:**
- Create: `migrations/004_create_sentinelx_orders.sql`

**Interfaces:**
- Produces: table `sentinelx_orders` with columns `id, order_ref, listing_id, listing_title, buyer_id, seller_id, amount, paystack_reference, status, initiated_at, held_at, resolved_at, created_at`. `status` constrained to `'initiated' | 'held' | 'released' | 'refunded' | 'disputed'`.

- [ ] **Step 1: Write the migration file**

```sql
-- ============================================================
-- Migration: Create sentinelx_orders table
-- Run this in Supabase SQL Editor
-- Backs the SentinelX Gaming Exchange escrow integration.
-- Rows are only ever written via the service-role client from
-- app/api/sentinelx/*, app/api/paystack/webhook, and
-- app/api/admin/sentinelx/* — never from a browser session —
-- so RLS is enabled with no policies (service role bypasses RLS).
-- ============================================================

CREATE TABLE IF NOT EXISTS sentinelx_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT UNIQUE NOT NULL,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  paystack_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'held', 'released', 'refunded', 'disputed')),
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  held_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sentinelx_orders_paystack_reference_idx
  ON sentinelx_orders (paystack_reference);

CREATE INDEX IF NOT EXISTS sentinelx_orders_status_idx
  ON sentinelx_orders (status);

ALTER TABLE sentinelx_orders ENABLE ROW LEVEL SECURITY;
-- No policies — only the service-role client (createAdminClient()) reads/writes this table.
```

- [ ] **Step 2: Run it against the Supabase project**

Run the SQL in the Supabase SQL Editor (this repo has no automated migration runner — `migrations/002` and `003` were applied the same way). Confirm with:

```sql
select column_name, data_type from information_schema.columns where table_name = 'sentinelx_orders';
```

Expected: 13 rows matching the columns above.

- [ ] **Step 3: Commit**

```bash
git add migrations/004_create_sentinelx_orders.sql
git commit -m "feat(sentinelx): add sentinelx_orders table"
```

---

### Task 2: Shared types

**Files:**
- Create: `types/sentinelx.ts`

**Interfaces:**
- Produces: `SentinelXOrderStatus`, `SentinelXAction`, `SentinelXWebhookEvent`, `SentinelXOrder`, `SentinelXWebhookPayload` — consumed by every task below.

- [ ] **Step 1: Write the types**

```ts
export type SentinelXOrderStatus = 'initiated' | 'held' | 'released' | 'refunded' | 'disputed'
export type SentinelXAction = 'release' | 'refund' | 'dispute'
export type SentinelXWebhookEvent = 'payment_held' | 'delivery_confirmed' | 'order_refunded'

export interface SentinelXOrder {
  id: string
  order_ref: string
  listing_id: string
  listing_title: string
  buyer_id: string
  seller_id: string
  amount: number
  paystack_reference: string | null
  status: SentinelXOrderStatus
  initiated_at: string
  held_at: string | null
  resolved_at: string | null
  created_at: string
}

export interface SentinelXWebhookPayload {
  event: SentinelXWebhookEvent
  order_ref: string
  data: Record<string, unknown>
  sent_at: string
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `types/sentinelx.ts`.

- [ ] **Step 3: Commit**

```bash
git add types/sentinelx.ts
git commit -m "feat(sentinelx): add shared types"
```

---

### Task 3: `generateSentinelXOrderRef()`

**Files:**
- Modify: `lib/utils.ts` (add after the existing `generateOrderRef` function)
- Test: `lib/__tests__/sentinelx-order-ref.test.ts`

**Interfaces:**
- Produces: `generateSentinelXOrderRef(): string` — returns e.g. `SNX-LX3F9A2-K7QZ`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { generateSentinelXOrderRef } from '@/lib/utils'

describe('generateSentinelXOrderRef', () => {
  it('is prefixed with SNX-', () => {
    expect(generateSentinelXOrderRef()).toMatch(/^SNX-/)
  })

  it('produces unique refs across calls', () => {
    const a = generateSentinelXOrderRef()
    const b = generateSentinelXOrderRef()
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/sentinelx-order-ref.test.ts`
Expected: FAIL — `generateSentinelXOrderRef` is not exported from `@/lib/utils`.

- [ ] **Step 3: Add the function to `lib/utils.ts`**

Add immediately after the existing `generateOrderRef` function:

```ts
export function generateSentinelXOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SNX-${timestamp}-${random}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/sentinelx-order-ref.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts lib/__tests__/sentinelx-order-ref.test.ts
git commit -m "feat(sentinelx): add generateSentinelXOrderRef"
```

---

### Task 4: Inbound shared-secret verification

**Files:**
- Create: `lib/sentinelx/auth.ts`
- Test: `lib/__tests__/sentinelx-auth.test.ts`

**Interfaces:**
- Consumes: `NextRequest` from `next/server`.
- Produces: `verifySentinelXSecret(request: NextRequest): { ok: boolean; error?: string; status?: number }` — consumed by Task 8.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { verifySentinelXSecret } from '@/lib/sentinelx/auth'

function reqWithAuth(header: string | null) {
  const headers = new Headers()
  if (header !== null) headers.set('authorization', header)
  return new NextRequest('http://localhost/api/sentinelx/escrow/initiate', { headers })
}

describe('verifySentinelXSecret', () => {
  const ORIGINAL = process.env.SENTINELX_API_SECRET

  afterEach(() => {
    process.env.SENTINELX_API_SECRET = ORIGINAL
  })

  it('rejects when secret is not configured', () => {
    delete process.env.SENTINELX_API_SECRET
    const result = verifySentinelXSecret(reqWithAuth('Bearer whatever'))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(500)
  })

  it('rejects a missing Authorization header', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth(null))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
  })

  it('rejects a mismatched token', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth('Bearer wrong-token'))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
  })

  it('accepts a matching bearer token', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth('Bearer top-secret'))
    expect(result.ok).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/sentinelx-auth.test.ts`
Expected: FAIL — module `@/lib/sentinelx/auth` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { NextRequest } from 'next/server'

export function verifySentinelXSecret(
  request: NextRequest,
): { ok: boolean; error?: string; status?: number } {
  const secret = process.env.SENTINELX_API_SECRET
  if (!secret) {
    return { ok: false, error: 'SentinelX integration not configured', status: 500 }
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== secret) {
    return { ok: false, error: 'Unauthorized', status: 401 }
  }

  return { ok: true }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/sentinelx-auth.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/sentinelx/auth.ts lib/__tests__/sentinelx-auth.test.ts
git commit -m "feat(sentinelx): add inbound shared-secret verification"
```

---

### Task 5: Escrow status state machine

**Files:**
- Create: `lib/sentinelx/transitions.ts`
- Test: `lib/__tests__/sentinelx-transitions.test.ts`

**Interfaces:**
- Consumes: `SentinelXOrderStatus`, `SentinelXAction` from `@/types/sentinelx` (Task 2).
- Produces: `nextStatus(current: SentinelXOrderStatus, action: SentinelXAction): SentinelXOrderStatus | null` — consumed by Task 10 (admin route).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { nextStatus } from '@/lib/sentinelx/transitions'

describe('nextStatus', () => {
  it('allows release from held', () => {
    expect(nextStatus('held', 'release')).toBe('released')
  })
  it('allows release from disputed', () => {
    expect(nextStatus('disputed', 'release')).toBe('released')
  })
  it('allows refund from held', () => {
    expect(nextStatus('held', 'refund')).toBe('refunded')
  })
  it('allows refund from disputed', () => {
    expect(nextStatus('disputed', 'refund')).toBe('refunded')
  })
  it('allows dispute from held', () => {
    expect(nextStatus('held', 'dispute')).toBe('disputed')
  })
  it('rejects release from initiated', () => {
    expect(nextStatus('initiated', 'release')).toBeNull()
  })
  it('rejects refund from an already-released order', () => {
    expect(nextStatus('released', 'refund')).toBeNull()
  })
  it('rejects dispute from an already-disputed order', () => {
    expect(nextStatus('disputed', 'dispute')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/sentinelx-transitions.test.ts`
Expected: FAIL — module `@/lib/sentinelx/transitions` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import type { SentinelXOrderStatus, SentinelXAction } from '@/types/sentinelx'

const ALLOWED_FROM: Record<SentinelXAction, SentinelXOrderStatus[]> = {
  release: ['held', 'disputed'],
  refund: ['held', 'disputed'],
  dispute: ['held'],
}

const RESULT_STATUS: Record<SentinelXAction, SentinelXOrderStatus> = {
  release: 'released',
  refund: 'refunded',
  dispute: 'disputed',
}

/** Returns the next status for an admin action, or null if the transition isn't allowed from the current status. */
export function nextStatus(
  current: SentinelXOrderStatus,
  action: SentinelXAction,
): SentinelXOrderStatus | null {
  if (!ALLOWED_FROM[action].includes(current)) return null
  return RESULT_STATUS[action]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/sentinelx-transitions.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/sentinelx/transitions.ts lib/__tests__/sentinelx-transitions.test.ts
git commit -m "feat(sentinelx): add escrow status transition rules"
```

---

### Task 6: Outbound webhook sender

**Files:**
- Create: `lib/sentinelx/webhook.ts`
- Test: `lib/__tests__/sentinelx-webhook.test.ts`

**Interfaces:**
- Consumes: `SentinelXWebhookEvent`, `SentinelXWebhookPayload` from `@/types/sentinelx` (Task 2).
- Produces: `sendSentinelXWebhook(event: SentinelXWebhookEvent, orderRef: string, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }>` — consumed by Tasks 9 and 10.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

describe('sendSentinelXWebhook', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.unstubAllGlobals()
  })

  it('returns ok:false without calling fetch when unconfigured', async () => {
    delete process.env.SENTINELX_WEBHOOK_URL
    delete process.env.SENTINELX_API_SECRET
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await sendSentinelXWebhook('payment_held', 'SNX-1', {})
    expect(result.ok).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('posts the event with a bearer-secret header', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await sendSentinelXWebhook('delivery_confirmed', 'SNX-2', { seller_id: 'abc' })

    expect(result.ok).toBe(true)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://sentinelx.example/webhooks/zolarux')
    expect(init.headers.Authorization).toBe('Bearer shared-secret')
    const body = JSON.parse(init.body)
    expect(body.event).toBe('delivery_confirmed')
    expect(body.order_ref).toBe('SNX-2')
    expect(body.data.seller_id).toBe('abc')
  })

  it('returns ok:false when SentinelX responds non-2xx', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const result = await sendSentinelXWebhook('order_refunded', 'SNX-3', {})
    expect(result.ok).toBe(false)
  })

  it('returns ok:false when fetch throws', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await sendSentinelXWebhook('payment_held', 'SNX-4', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('network down')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/sentinelx-webhook.test.ts`
Expected: FAIL — module `@/lib/sentinelx/webhook` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import type { SentinelXWebhookEvent, SentinelXWebhookPayload } from '@/types/sentinelx'

/** Fire-and-forget POST to SentinelX. Never throws — logs and returns ok:false on failure. */
export async function sendSentinelXWebhook(
  event: SentinelXWebhookEvent,
  orderRef: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SENTINELX_WEBHOOK_URL
  const secret = process.env.SENTINELX_API_SECRET

  if (!url || !secret) {
    console.error('SentinelX webhook not sent — missing SENTINELX_WEBHOOK_URL or SENTINELX_API_SECRET')
    return { ok: false, error: 'SentinelX webhook not configured' }
  }

  const payload: SentinelXWebhookPayload = {
    event,
    order_ref: orderRef,
    data,
    sent_at: new Date().toISOString(),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`SentinelX webhook ${event} failed — status ${res.status}`, orderRef)
      return { ok: false, error: `SentinelX responded ${res.status}` }
    }

    return { ok: true }
  } catch (err: any) {
    console.error(`SentinelX webhook ${event} threw`, orderRef, err?.message)
    return { ok: false, error: err?.message || 'Network error' }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/sentinelx-webhook.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/sentinelx/webhook.ts lib/__tests__/sentinelx-webhook.test.ts
git commit -m "feat(sentinelx): add outbound webhook sender"
```

---

### Task 7: Paystack webhook signature verification

**Files:**
- Create: `lib/paystack/verify-signature.ts`
- Test: `lib/__tests__/paystack-verify-signature.test.ts`

**Interfaces:**
- Produces: `verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): boolean` — consumed by Task 9.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyPaystackSignature } from '@/lib/paystack/verify-signature'

describe('verifyPaystackSignature', () => {
  const secret = 'sk_test_12345'
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'SNX-1' } })
  const validSignature = createHmac('sha512', secret).update(body).digest('hex')

  it('accepts a correctly signed payload', () => {
    expect(verifyPaystackSignature(body, validSignature, secret)).toBe(true)
  })

  it('rejects a tampered body', () => {
    const tampered = JSON.stringify({ event: 'charge.success', data: { reference: 'SNX-EVIL' } })
    expect(verifyPaystackSignature(tampered, validSignature, secret)).toBe(false)
  })

  it('rejects a missing signature header', () => {
    expect(verifyPaystackSignature(body, null, secret)).toBe(false)
  })

  it('rejects when secret is empty', () => {
    expect(verifyPaystackSignature(body, validSignature, '')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/paystack-verify-signature.test.ts`
Expected: FAIL — module `@/lib/paystack/verify-signature` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { createHmac, timingSafeEqual } from 'crypto'

/** Verifies a Paystack webhook's x-paystack-signature header (HMAC-SHA512 over the raw body). */
export function verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false

  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')

  const expectedBuf = Buffer.from(expected, 'utf8')
  const signatureBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== signatureBuf.length) return false

  return timingSafeEqual(expectedBuf, signatureBuf)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/paystack-verify-signature.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/paystack/verify-signature.ts lib/__tests__/paystack-verify-signature.test.ts
git commit -m "feat(paystack): add webhook signature verification"
```

---

### Task 8: Admin allowlist check

**Files:**
- Create: `lib/admin/require-admin.ts`
- Test: `lib/__tests__/require-admin.test.ts`

**Interfaces:**
- Consumes: `getUser` from `@/lib/supabase/server` (existing, `lib/supabase/server.ts:37`).
- Produces: `requireAdminUser(): Promise<{ id: string; email: string } | null>` — consumed by Tasks 10 and 11.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  getUser: vi.fn(),
}))

import { getUser } from '@/lib/supabase/server'
import { requireAdminUser } from '@/lib/admin/require-admin'

describe('requireAdminUser', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.clearAllMocks()
  })

  it('returns null when ADMIN_EMAILS is unset', async () => {
    delete process.env.ADMIN_EMAILS
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '1', email: 'ops@zolarux.com.ng' } } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns null when there is no session', async () => {
    process.env.ADMIN_EMAILS = 'ops@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: null } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns null when the user is not on the allowlist', async () => {
    process.env.ADMIN_EMAILS = 'ops@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '2', email: 'random@gmail.com' } } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns the user when their email is on the allowlist (case-insensitive)', async () => {
    process.env.ADMIN_EMAILS = 'Ops@Zolarux.com.ng, second@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '3', email: 'ops@zolarux.com.ng' } } } as any)

    expect(await requireAdminUser()).toEqual({ id: '3', email: 'ops@zolarux.com.ng' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/__tests__/require-admin.test.ts`
Expected: FAIL — module `@/lib/admin/require-admin` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { getUser } from '@/lib/supabase/server'

export interface AdminUser {
  id: string
  email: string
}

/** Returns the current user if their email is on the ADMIN_EMAILS allowlist, else null. */
export async function requireAdminUser(): Promise<AdminUser | null> {
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowlist.length === 0) return null

  const { data: { user } } = await getUser()
  if (!user?.email) return null

  if (!allowlist.includes(user.email.toLowerCase())) return null

  return { id: user.id, email: user.email }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/__tests__/require-admin.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/admin/require-admin.ts lib/__tests__/require-admin.test.ts
git commit -m "feat(admin): add ADMIN_EMAILS allowlist check"
```

---

### Task 9: `POST /api/sentinelx/escrow/initiate`

**Files:**
- Create: `app/api/sentinelx/escrow/initiate/route.ts`

**Interfaces:**
- Consumes: `verifySentinelXSecret` (Task 4), `generateSentinelXOrderRef` (Task 3), `createAdminClient` (existing, `lib/supabase/admin.ts`), `rateLimit`/`getClientIp` (existing, `lib/rate-limit.ts`).
- Produces: `POST` handler returning `{ success: true, order_id, order_ref, payment_link }` on success.

- [ ] **Step 1: Write the implementation**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifySentinelXSecret } from '@/lib/sentinelx/auth'
import { generateSentinelXOrderRef } from '@/lib/utils'

const MAX_AMOUNT_KOBO = 5_000_000_000 // ₦50,000,000 cap — mirrors orders/create's existing cap

export async function POST(request: NextRequest) {
  const { rateLimit, getClientIp } = await import('@/lib/rate-limit')
  const ip = getClientIp(request.headers)
  const { limited, resetIn } = rateLimit(`sentinelx-initiate:${ip}`, 30, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } },
    )
  }

  const auth = verifySentinelXSecret(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { buyer_id, seller_id, listing_id, listing_title, amount } = body

  const missing = [
    !buyer_id && 'buyer_id',
    !seller_id && 'seller_id',
    !listing_id && 'listing_id',
    !listing_title && 'listing_title',
    amount == null && 'amount',
  ].filter(Boolean)
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
  }

  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT_KOBO) {
    return NextResponse.json({ error: 'amount must be a positive integer (kobo) within range' }, { status: 400 })
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecret) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
  }

  const order_ref = generateSentinelXOrderRef()

  // Paystack requires an email on every transaction. SentinelX only sends a buyer ID,
  // so we synthesize a stable placeholder — it's never actually delivered to.
  const placeholderEmail = `sentinelx-buyer-${buyer_id}@zolarux.com.ng`

  let authorizationUrl: string
  try {
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: placeholderEmail,
        amount,
        reference: order_ref,
        metadata: { source: 'sentinelx', order_ref, listing_id, buyer_id, seller_id },
      }),
    })
    const paystackData = await paystackRes.json()
    if (!paystackRes.ok || !paystackData.status) {
      console.error('SentinelX initiate — Paystack init failed:', paystackData)
      return NextResponse.json({ error: 'Could not create payment link' }, { status: 502 })
    }
    authorizationUrl = paystackData.data.authorization_url
  } catch (err: any) {
    console.error('SentinelX initiate — Paystack request threw:', err?.message)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 502 })
  }

  const supabase = createAdminClient()
  const { data: order, error: insertError } = await supabase
    .from('sentinelx_orders')
    .insert({
      order_ref,
      listing_id: String(listing_id),
      listing_title: String(listing_title),
      buyer_id: String(buyer_id),
      seller_id: String(seller_id),
      amount,
      paystack_reference: order_ref,
      status: 'initiated',
    })
    .select()
    .single()

  if (insertError) {
    console.error('SentinelX initiate — insert failed:', insertError.message)
    return NextResponse.json({ error: 'Failed to create escrow order' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    order_id: order.id,
    order_ref: order.order_ref,
    payment_link: authorizationUrl,
  })
}
```

- [ ] **Step 2: Manual verification**

Set `SENTINELX_API_SECRET=dev-secret` and a valid `PAYSTACK_SECRET_KEY` (test mode) in `.env.local`, run `npm run dev`, then:

```bash
curl -X POST http://localhost:3000/api/sentinelx/escrow/initiate \
  -H "Authorization: Bearer dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"buyer_id":"buyer_1","seller_id":"seller_1","listing_id":"listing_1","listing_title":"Rare Skin Bundle","amount":500000}'
```

Expected: `200` with `{"success":true,"order_id":"...","order_ref":"SNX-...","payment_link":"https://checkout.paystack.com/..."}`. Confirm a row appeared in `sentinelx_orders` with `status = 'initiated'`. Also confirm `curl` without the `Authorization` header returns `401`.

- [ ] **Step 3: Commit**

```bash
git add app/api/sentinelx/escrow/initiate/route.ts
git commit -m "feat(sentinelx): add POST /api/sentinelx/escrow/initiate"
```

---

### Task 10: `POST /api/paystack/webhook`

**Files:**
- Create: `app/api/paystack/webhook/route.ts`

**Interfaces:**
- Consumes: `verifyPaystackSignature` (Task 7), `sendSentinelXWebhook` (Task 6), `createAdminClient` (existing).
- Produces: `POST` handler that transitions `sentinelx_orders.status` from `initiated` to `held` and fires `payment_held`.

- [ ] **Step 1: Write the implementation**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature } from '@/lib/paystack/verify-signature'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('Paystack webhook — PAYSTACK_SECRET_KEY not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    console.error('Paystack webhook — signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Always ack 200 once the signature checks out — Paystack retries on non-2xx.
  // Only charge.success against a known SentinelX reference does anything.
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('sentinelx_orders')
    .select()
    .eq('paystack_reference', reference)
    .eq('status', 'initiated')
    .maybeSingle()

  if (!order) {
    // Not a SentinelX order (or already processed) — nothing to do.
    return NextResponse.json({ received: true })
  }

  const held_at = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('sentinelx_orders')
    .update({ status: 'held', held_at })
    .eq('id', order.id)

  if (updateError) {
    console.error('Paystack webhook — failed to mark order held:', updateError.message, order.order_ref)
    return NextResponse.json({ received: true })
  }

  await sendSentinelXWebhook('payment_held', order.order_ref, {
    order_id: order.id,
    order_ref: order.order_ref,
    listing_id: order.listing_id,
    buyer_id: order.buyer_id,
    seller_id: order.seller_id,
    amount: order.amount,
    held_at,
  })

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 2: Manual verification**

In the Paystack dashboard (test mode), set the webhook URL to `https://<your-ngrok-or-vercel-preview>/api/paystack/webhook`. Complete a test payment against a `payment_link` from Task 9. Confirm:
1. Paystack shows a `200` delivery for the `charge.success` event.
2. The matching `sentinelx_orders` row flips to `status = 'held'` with `held_at` set.
3. `SENTINELX_WEBHOOK_URL` (point it at a request-bin/webhook.site URL for this test) received a `payment_held` POST with `Authorization: Bearer <SENTINELX_API_SECRET>`.

Also send a manually-crafted request with a garbage `x-paystack-signature` header and confirm it's rejected with `401` and no DB write occurs.

- [ ] **Step 3: Commit**

```bash
git add app/api/paystack/webhook/route.ts
git commit -m "feat(paystack): add webhook receiver, marks sentinelx orders held"
```

---

### Task 11: `PATCH /api/admin/sentinelx/[id]` (release / refund / dispute)

**Files:**
- Create: `app/api/admin/sentinelx/[id]/route.ts`

**Interfaces:**
- Consumes: `requireAdminUser` (Task 8), `nextStatus` (Task 5), `sendSentinelXWebhook` (Task 6), `createAdminClient` (existing).
- Produces: `PATCH` handler accepting `{ action: 'release' | 'refund' | 'dispute' }`, returns `{ success: true, order }`.

- [ ] **Step 1: Write the implementation**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminUser } from '@/lib/admin/require-admin'
import { nextStatus } from '@/lib/sentinelx/transitions'
import type { SentinelXAction } from '@/types/sentinelx'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

const VALID_ACTIONS: SentinelXAction[] = ['release', 'refund', 'dispute']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action: SentinelXAction = body?.action
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase.from('sentinelx_orders').select().eq('id', id).maybeSingle()
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updatedStatus = nextStatus(order.status, action)
  if (!updatedStatus) {
    return NextResponse.json({ error: `Cannot ${action} an order in status "${order.status}"` }, { status: 409 })
  }

  const resolved_at = action === 'dispute' ? null : new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('sentinelx_orders')
    .update({ status: updatedStatus, ...(resolved_at ? { resolved_at } : {}) })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Admin SentinelX action failed:', updateError.message, id)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  if (action === 'release') {
    await sendSentinelXWebhook('delivery_confirmed', order.order_ref, {
      order_id: order.id,
      order_ref: order.order_ref,
      seller_id: order.seller_id,
      amount: order.amount,
    })
  } else if (action === 'refund') {
    await sendSentinelXWebhook('order_refunded', order.order_ref, {
      order_id: order.id,
      order_ref: order.order_ref,
      buyer_id: order.buyer_id,
      amount: order.amount,
    })
  }

  return NextResponse.json({ success: true, order: updated })
}
```

- [ ] **Step 2: Manual verification**

With a `held` test order from Task 10, sign in as a user whose email is in `ADMIN_EMAILS` and:

```bash
curl -X PATCH http://localhost:3000/api/admin/sentinelx/<order-id> \
  -H "Content-Type: application/json" \
  -b "<your session cookie>" \
  -d '{"action":"release"}'
```

Expected: `200`, order flips to `released`, `resolved_at` set, and the `SENTINELX_WEBHOOK_URL` test endpoint receives a `delivery_confirmed` POST. Confirm calling `release` again on the same order now returns `409` (already terminal). Confirm calling without a valid admin session returns `401`.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/sentinelx/[id]/route.ts
git commit -m "feat(admin): add release/refund/dispute action for sentinelx orders"
```

---

### Task 12: Admin UI — `/admin/sentinelx`

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/sentinelx/page.tsx`
- Create: `app/admin/sentinelx/SentinelXOrdersTable.tsx`

**Interfaces:**
- Consumes: `requireAdminUser` (Task 8), `createAdminClient` (existing), `SentinelXOrder` type (Task 2), `PATCH /api/admin/sentinelx/[id]` (Task 11).

- [ ] **Step 1: Write the admin layout**

```tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin/require-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser()
  if (!admin) redirect('/')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin/sentinelx" className="font-display font-700 text-gray-900 text-sm">
            Zolarux Admin
          </Link>
          <span className="text-gray-500 text-xs">{admin.email}</span>
        </div>
      </header>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write the orders list page**

```tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { SentinelXOrdersTable } from './SentinelXOrdersTable'
import type { SentinelXOrder } from '@/types/sentinelx'

export default async function SentinelXOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('sentinelx_orders')
    .select()
    .order('initiated_at', { ascending: false })
    .limit(100)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-lg font-display font-700 text-gray-900 mb-4">SentinelX Escrow Orders</h1>
      <SentinelXOrdersTable orders={(orders as SentinelXOrder[]) || []} />
    </main>
  )
}
```

- [ ] **Step 3: Write the client-side actions table**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SentinelXOrder } from '@/types/sentinelx'

const ACTIONS_BY_STATUS: Record<string, { action: 'release' | 'refund' | 'dispute'; label: string }[]> = {
  held: [
    { action: 'release', label: 'Release to seller' },
    { action: 'refund', label: 'Refund buyer' },
    { action: 'dispute', label: 'Mark disputed' },
  ],
  disputed: [
    { action: 'release', label: 'Release to seller' },
    { action: 'refund', label: 'Refund buyer' },
  ],
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

  return (
    <div className="overflow-x-auto">
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 pr-4">Order Ref</th>
            <th className="py-2 pr-4">Listing</th>
            <th className="py-2 pr-4">Buyer</th>
            <th className="py-2 pr-4">Seller</th>
            <th className="py-2 pr-4">Amount (kobo)</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50">
              <td className="py-2 pr-4 font-mono text-xs">{order.order_ref}</td>
              <td className="py-2 pr-4">{order.listing_title}</td>
              <td className="py-2 pr-4">{order.buyer_id}</td>
              <td className="py-2 pr-4">{order.seller_id}</td>
              <td className="py-2 pr-4">{order.amount.toLocaleString()}</td>
              <td className="py-2 pr-4">{order.status}</td>
              <td className="py-2 pr-4 flex gap-2">
                {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label }) => (
                  <button
                    key={action}
                    disabled={pendingId === order.id}
                    onClick={() => runAction(order.id, action)}
                    className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Manual verification**

Run `npm run dev`, sign in as a user whose email is in `ADMIN_EMAILS`, visit `/admin/sentinelx`. Confirm the table lists test orders from earlier tasks, and clicking "Release to seller" / "Refund buyer" / "Mark disputed" on a `held` row updates its status in place (via `router.refresh()`) and fires the corresponding webhook. Then sign in as a non-admin user (or sign out) and confirm `/admin/sentinelx` redirects to `/`.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx app/admin/sentinelx/page.tsx app/admin/sentinelx/SentinelXOrdersTable.tsx
git commit -m "feat(admin): add /admin/sentinelx order review page"
```

---

### Task 13: Env var documentation

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Add the new variables**

Append to `.env.local.example`:

```
# SentinelX Gaming Exchange escrow integration
# Shared secret SentinelX sends as "Authorization: Bearer <value>" on inbound calls,
# and that Zolarux sends the same way on outbound webhooks to SENTINELX_WEBHOOK_URL.
SENTINELX_API_SECRET=generate_a_strong_random_secret_here
SENTINELX_WEBHOOK_URL=https://sentinelx.example.com/webhooks/zolarux

# Admin dashboard access — comma-separated list of emails allowed into /admin/*
ADMIN_EMAILS=you@zolarux.com.ng
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "docs: document sentinelx and admin env vars"
```

---

## Self-Review

**Spec coverage:**
- `POST /api/sentinelx/escrow/initiate` → Task 9. ✓
- `payment_held` webhook → Task 10 (fired from the Paystack webhook receiver, source of truth). ✓
- `delivery_confirmed` webhook → Task 11 (`action: 'release'`). ✓
- `order_refunded` webhook → Task 11 (`action: 'refund'`). ✓
- All four secured by `SENTINELX_API_SECRET` → inbound via `verifySentinelXSecret` (Task 4, used in Task 9); outbound via the `Authorization` header `sendSentinelXWebhook` attaches (Task 6, used in Tasks 10 & 11). ✓
- `sentinelx_orders` separate table → Task 1. ✓
- Manual-ops trigger for release/refund → Task 11 + Task 12 admin UI. ✓
- Visibility question ("how do I see the orders") → Task 12 admin page, plus Supabase Table Editor works immediately after Task 1 with zero extra code. ✓

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `SentinelXOrderStatus`, `SentinelXAction`, `SentinelXWebhookEvent`, `SentinelXOrder`, `SentinelXWebhookPayload` are defined once in `types/sentinelx.ts` (Task 2) and imported everywhere else — no redefinitions. `nextStatus`, `sendSentinelXWebhook`, `verifySentinelXSecret`, `verifyPaystackSignature`, `requireAdminUser`, `generateSentinelXOrderRef` signatures match between their defining task and every consuming task.
