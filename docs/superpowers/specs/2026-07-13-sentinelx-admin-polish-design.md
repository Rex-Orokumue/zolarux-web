# SentinelX Admin Page Polish + Navbar Link

## Context

`/admin/sentinelx` (`app/admin/sentinelx/page.tsx` + `SentinelXOrdersTable.tsx`) is a bare, functional table of escrow orders with release/refund/dispute actions. It works but looks unfinished, has no filtering, no pagination (hardcapped at 100 rows), and no summary stats. It's also only reachable by typing the URL directly — there's no link to it anywhere else on the site.

Admin access is gated server-side by `requireAdminUser()` (`lib/admin/require-admin.ts`), which checks the signed-in user's email against the `ADMIN_EMAILS` env var allowlist. This is server-only; the client-side `Navbar` has no concept of "admin."

`sentinelx_orders.amount` is stored in **kobo** (confirmed via `app/api/sentinelx/escrow/initiate/route.ts`, which validates `amount` as an integer kobo value). The existing table renders raw kobo (`order.amount.toLocaleString()`), which is wrong for display.

## Goals

1. Polish the SentinelX admin page: status badges, correct currency formatting, dates, empty state, mobile-responsive layout, better action buttons.
2. Add status filtering, text search, pagination, and summary stats.
3. Make the page discoverable: add an "Admin" link to the main site `Navbar`, visible only to admin users.

## Non-goals

- No changes to the underlying escrow action logic (`nextStatus`, webhook sending) in `app/api/admin/sentinelx/[id]/route.ts`.
- No changes to `requireAdminUser()`'s allowlist mechanism.
- No new admin pages beyond SentinelX orders.
- No client-side exposure of the `ADMIN_EMAILS` list.

## Design

### 1. Data layer — `app/admin/sentinelx/page.tsx`

Becomes a server component that reads `searchParams: Promise<{ status?: string; q?: string; page?: string }>`.

- `PAGE_SIZE = 20`.
- `currentPage = parseInt(params.page || '1', 10)`.
- Base query: `.from('sentinelx_orders').select('*', { count: 'exact' }).order('initiated_at', { ascending: false })`.
  - If `status` param is one of the valid `SentinelXOrderStatus` values, add `.eq('status', status)`.
  - If `q` param is non-empty, add `.or(`order_ref.ilike.%${q}%,listing_title.ilike.%${q}%`)` (escaping `%`/`,` isn't a concern here since Supabase's `.or()` builder handles the value as a single filter argument, but the `q` string itself must not contain unescaped `,` or `)` — sanitize by stripping those characters before building the filter string).
  - `.range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)`.
- Compute `totalPages = Math.ceil((count || 0) / PAGE_SIZE)`.
- Summary stats (independent of filters/pagination — always reflect the full table):
  - Four `head: true, count: 'exact'` queries filtered by `eq('status', X)` for `held`, `disputed`, `released`, `refunded`.
  - One `.select('amount').eq('status', 'held')` query, summed client-side in the server component, for "value currently in escrow."
- Pass `orders`, `totalPages`, `currentPage`, `stats`, and the active `status`/`q` filters down to the client table component.

### 2. `SentinelXOrdersTable.tsx` polish

- Add a `STATUS_CONFIG` map (label/color/bg/border) mirroring the pattern in `app/(dashboard)/vendor/orders/page.tsx`:
  - `initiated`: blue — "Initiated"
  - `held`: amber — "In Escrow"
  - `released`: green — "Released"
  - `refunded`: gray — "Refunded"
  - `disputed`: red — "Disputed"
- Render `formatPrice(order.amount / 100)` instead of raw kobo.
- Render `formatDate(order.initiated_at)` instead of the raw ISO string.
- Truncate `buyer_id`/`seller_id` to a short prefix with `truncate()` from `lib/utils`, with the full value in a `title` attribute.
- Restyle action buttons: green for `release`, gray/neutral for `refund`, red for `dispute` (currently all identical gray).
- Empty state: icon + "No orders match these filters" message, styled like the vendor-orders empty state.
- Responsive layout: table view on `sm:` and up; stacked card view (one card per order, same fields + actions) below `sm:`.
- Existing action logic (`runAction`, `pendingId`, `error` state, PATCH to `/api/admin/sentinelx/[id]`) is unchanged.

### 3. Filter/search bar (new, in `page.tsx` or a small server-rendered subcomponent)

- Status pills as `Link`s: `All / Held / Disputed / Released / Refunded / Initiated`, each linking to `/admin/sentinelx?status=X&q=<preserved>`, styled like the `/listings` category-pill pattern (active pill highlighted).
- A `<form method="GET" action="/admin/sentinelx">` with a text `<input name="q">` (defaultValue from current `q`) and a hidden `status` field to preserve the active filter — no client JS required.
- Pagination controls (Previous/Next + "Page X of Y") matching the `/listings` pattern, preserving `status` and `q` in the links.
- Stats row: 5 cards (Held, Disputed, Released, Refunded counts + Value in Escrow), styled like the vendor-orders stats grid.

### 4. Navbar admin link

- New route `app/api/admin/me/route.ts`:
  ```ts
  export async function GET() {
    const admin = await requireAdminUser()
    return NextResponse.json({ isAdmin: !!admin })
  }
  ```
- In `Navbar.tsx`'s existing `checkAuth`/`onAuthStateChange` logic, after a user is found, fetch `/api/admin/me` and store the result in a new `isAdmin` state. Reset `isAdmin` to `false` when the user signs out or no session exists.
- Desktop nav: render an "Admin" link (using the already-imported `Shield` icon) next to "Dashboard", only when `isAdmin` is `true`.
- Mobile menu: same link placed near "Dashboard" in the signed-in block.
- This is a discoverability affordance only — the real access boundary remains `requireAdminUser()` in `app/admin/layout.tsx`.

## Error handling

- Invalid/unknown `status` query param: ignored (falls back to no status filter, i.e. "All").
- `q` param: strip `%`, `,`, and `)` characters before building the `.ilike`/`.or()` filter string, to keep the constructed filter well-formed.
- `page` param out of range (e.g. beyond `totalPages`, or `<= 0`): clamp to `1` if not a positive integer; a page beyond the last page simply yields an empty `orders` list (existing empty-state handles it).
- `/api/admin/me` fetch failure in `Navbar` (network error, non-2xx): treat as `isAdmin = false` (fail closed — link just doesn't show; the real access check still happens server-side regardless).

## Testing

- Existing behavior (release/refund/dispute actions, `PATCH /api/admin/sentinelx/[id]`) is unchanged and already covered by `lib/__tests__/sentinelx-transitions.test.ts` etc. — no new tests needed there.
- New: a unit test for `/api/admin/me` covering admin and non-admin/unauthenticated cases (mirrors the existing `require-admin.test.ts` patterns).
- Manual verification (via `/verify` or dev server): confirm filters/search/pagination compose correctly in the URL, stats reflect actual DB counts, kobo→naira conversion is correct, and the Navbar "Admin" link appears only for allowlisted users.
