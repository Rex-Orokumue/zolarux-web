# Zolarux Flagship v2 — Phase 1: Shopping Spine

**Date:** 2026-08-29
**Status:** Approved for planning
**Depends on:** Phase 0 (Foundation) — complete, `flagship-v2` @ `706ecf3`
**Program spec:** `2026-08-28-flagship-v2-phase-0-foundation-design.md` §1

---

## 1. Program context & a narrative pivot

The program rebuilds the Zolarux site into a best-in-class gadgets retail
experience, direction **"Marketplace"** (discovery-first, warm/dense, blue =
structure + amber = action, soft elevation, springy motion), evolving the
existing identity. Phase 0 delivered the token system, dark mode, motion
system, and a ~25-component library exercised in an unlinked `/dev/ui` route.

**Pivot decided during Phase 1 brainstorming (2026-08-29):** Zolarux is a
**single trusted retailer**, not a multi-vendor marketplace. This overrides
the marketplace framing in the Phase 0 program spec and the earlier
`2026-08-23-flagship-redesign-design.md`.

- Zolarux sells its own catalogue. It may still *source* stock off-platform
  (the [[zolarux-sourcing-model]] reality persists internally — prices and
  availability are not authoritative until confirmed), but the buyer deals
  with **Zolarux**, never a third-party vendor.
- The trust promise is **"guaranteed or refunded"**, baked in and free: Zolarux
  inspects every unit before dispatch; the buyer inspects on delivery; if it is
  not as described, full refund. **No separate escrow "protection fee"** on the
  consumer site. (The SentinelX escrow work — [[sentinelx-protection-fee-gap]] —
  is a separate back-office concern, not surfaced here.)
- Consequences: "Check Vendor" and all vendor-facing surfaces
  (`/for-vendors`, vendor registration, "Verified Vendor" badges, the Safety
  Tools nav dropdown) lose their meaning and are removed from the shopping
  spine. The `Product.vendor_name` / `vendor_id` fields stay in the type/DB but
  are no longer selected or shown.
- The buyer voice is **brand-first ("we", "Zolarux")**. A founder / first-person
  note ("I've done this for 5 years") is allowed as a single accent on Home
  and About, not the default register. (Confirm — §17.)

## 2. Goal of Phase 1

Redesign the six surfaces a buyer moves through — from landing to a purchase
hand-off — as one coherent retailer experience built entirely on the Phase 0
kit, and migrate every one of those pages off the legacy compat classes onto
semantic tokens so light/dark works on real pages for the first time.

## 3. Scope

**In scope — six surfaces:**

| Surface | File(s) |
|---|---|
| Navbar | `components/layout/Navbar.tsx` |
| Footer | `components/layout/Footer.tsx` |
| Home | `app/(marketing)/page.tsx` |
| Listings | `app/(marketing)/listings/page.tsx` |
| Listing Detail | `app/(marketing)/listings/[id]/page.tsx` |
| Login | `app/(auth)/login/page.tsx` |

Plus: a **read-only reviews** display layer (§11), a **prune of vendor/tool
constants**, and **trimming the Phase 0 compat shim** as pages migrate.

**Explicitly out of scope:**

- **Check Vendor** (`app/(tools)/check-vendor/page.tsx`) — stays in the repo,
  **unlinked**, unchanged. Its fate is decided in a later project.
- Any of the ~15 not-yet-built pages (How It Works content page, About beyond
  what already exists, Blog, FAQ, Contact, legal, the other safety tools,
  registration). Note: nav will link to **"The Guarantee"** — if that resolves
  to a not-yet-built route, the link target is decided in §6.
- **Writing** a review (submit flow, auth-gating, moderation) — Phase 1 is
  display only. Deferred to a follow-up once an account area exists.
- Cart, checkout, on-site payment, order records. The purchase hand-off stays
  **WhatsApp** (`buildWhatsAppUrl`, `WHATSAPP_NUMBER = '2347063107314'`).
- Restyling `check-vendor`, `about`, or any `(tools)` page.
- A test framework (none exists; unchanged).
- New brand identity — Phase 0's tokens are the system.

## 4. Current-state facts (verified 2026-08-29, `flagship-v2` @ `706ecf3`)

- **Real pages on this branch:** `/`, `/about`, `/listings`, `/listings/[id]`,
  `/login`, `/check-vendor`, `/dev/ui`. Layouts: `(auth)`, `(marketing)`,
  `(tools)`, `dev`. **No `app/api/*` routes. No `lib/reviews.ts`,
  `lib/referral.ts`.** Many empty leftover directories under `app/` exist from
  `git rm` — ignore them.
- **Data layer** (`lib/products.ts`): `getListings(filters)` (paginated,
  `LISTINGS_PAGE_SIZE = 12`, count exact), `getFeaturedProducts(limit=4)`,
  `getRelatedProducts(category, excludeId, limit=4)`, `getProductById(id)`.
  All hit Supabase `products` table, `.eq('is_active', true)`. Errors are
  logged and return empty — pages already handle the empty path.
- **`Product` type** (`types/product.ts`): includes `vendor_id`, `vendor_name`,
  `brand`, `condition` (`'new'|'uk_used'|'refurbished'|'used'|null`), `specs`
  (`ProductSpec[]|null`), `pricing_type` (`'fixed'|'quote'`), `is_featured`,
  `image_url`, `main_image_url`, `image_urls[]`, `video_urls[]`.
- **Login** (`app/(auth)/login/page.tsx`): `"use client"`, phone→OTP via
  `supabase.auth.signInWithOtp({ phone })` then `verifyOtp`. Nigerian phone
  normalisation to E.164. Two-step (`'phone' | 'otp'`).
- **Middleware** (`middleware.ts` → `lib/supabase/middleware.ts`):
  `updateSession` runs `supabase.auth.getUser()` on every non-static request;
  redirects unauthenticated users away from `/buyer` / `/vendor` (routes that
  don't exist on this branch). Leave as-is — not Phase 1's concern.
- **`lib/constants.ts`** carries `NAV_LINKS` (incl. `/for-buyers`,
  `/for-vendors`), `TRUST_TOOLS` (5 entries incl. `/check-vendor`),
  `VENDOR_CATEGORIES`, `VENDOR_STATUS_MAP`, `ORDER_PIPELINE`,
  `LISTING_CATEGORIES`, `LISTING_SORT_OPTIONS`, `CONDITION_MAP` (token-based
  since Phase 0), `WHATSAPP_NUMBER`, `SITE_*`.
- **`lib/utils.ts`**: `cn`, `formatPrice` (Intl NGN, no decimals),
  `formatDate`, `buildWhatsAppUrl(message, phone?)`, `slugify`, `truncate`.
- **Phase 0 component library** (`components/ui/`, barrel `index.ts`): Button,
  IconButton, Input/Field, Textarea, Select, Checkbox, RadioGroup, Badge,
  FilterPill, Card, Dialog, Sheet, DropdownMenu, Tabs, Tooltip, Accordion,
  Toaster/toast, Skeleton, Avatar, Separator, Breadcrumbs, Pagination,
  ThemeToggle, Reveal. Plus refit: StatTile, ProductCard, Gallery, SpecsTable,
  FilterBar.
- **Compat shim** in `globals.css` (to be trimmed here): `@utility font-300..800`,
  `shadow-card`, `shadow-card-hover`, `shadow-primary`, and the
  `--color-accent` token alias.
- **`AGENTS.md`:** Next 16 has breaking changes — consult
  `node_modules/next/dist/docs/01-app/` before touching routing / metadata /
  fonts / `searchParams`.
- **`Navbar.tsx` history:** commit `fb61658` fixed a "setState in effect" bug
  with render-time state adjustment — the project lint rule
  (`setState synchronously within an effect`) is enforced; honor it (Phase 0's
  `ThemeToggle` / `Reveal` use `useSyncExternalStore` / DOM-dataset patterns to
  comply).
- **Supabase is not configured locally** — `getListings` etc. return the empty
  path. Real-data QA requires a Supabase connection or a preview deploy (§15).

## 5. Approach

Migrate and redesign **surface by surface**, chrome first (Navbar, Footer) so
every page inherits the new frame, then Home, then the two Listings surfaces
(which share `ProductCard` / `FilterBar` / data), then Login, then layer
reviews onto Home + Listing Detail. Each surface is fully token-migrated in the
same task that redesigns it — no page is left half-on-tokens. The compat shim
shrinks as we go and is deleted in the final task.

## 6. Information architecture — Navbar & Footer

### 6.1 Navbar (`components/layout/Navbar.tsx`)

Rebuild on the kit. Structure:

- **Left:** wordmark → `/`.
- **Primary nav:**
  - **Shop** — opens a mega-menu (`DropdownMenu` desktop, inside the mobile
    `Sheet` otherwise): the `LISTING_CATEGORIES` (minus "All"), plus quick
    links "New arrivals" (`/listings?sort=newest`) and "Under ₦200k"
    (`/listings?maxPrice=200000`).
  - **The Guarantee** — links to `/#the-guarantee` (the Home section anchor)
    for Phase 1, since a standalone `/how-it-works` retailer page is out of
    scope. (Confirm — §17.)
  - **About** — `/about` (exists).
  - **Reviews** — `/#reviews` anchor (Home) for Phase 1. Omitted from nav if
    the reviews table turns out empty at build (§11).
- **Right:** a persistent **"Order on WhatsApp"** `Button` (opens
  `buildWhatsAppUrl` with a generic "Hi Zolarux, I'd like to order a gadget"
  message) and **Sign in** (`/login`) / — when a session exists —
  **Account** (links to `/login` for now; a real account area is later).
  `ThemeToggle` lives here (icon-only on mobile).
- **Mobile:** hamburger → `Sheet` (side `right`) containing the full nav,
  Shop categories expanded, the WhatsApp action, Sign in, theme toggle.
- **Scroll behaviour:** transparent-to-solid on scroll over the Home hero;
  solid elevated bar elsewhere. Implemented with an `IntersectionObserver` on a
  sentinel (no scroll listener, no setState-in-effect — use the same
  `useSyncExternalStore` / ref pattern as Phase 0).
- **Removed:** "For Buyers", "For Vendors", the "Safety Tools" dropdown, any
  vendor CTA.

### 6.2 Footer (`components/layout/Footer.tsx`)

Rebuild on tokens. Columns:

- **Shop** — categories, New arrivals, All gadgets.
- **Trust** — The Guarantee, Reviews, About.
- **Support** — Order on WhatsApp, Contact (links to WhatsApp for now — a
  `/contact` page is out of scope), FAQ (omit or link to `/#the-guarantee` if
  no page).
- **Legal** — Privacy, Terms, Refund Policy — **only if those routes exist**;
  otherwise omit the column (do not link to 404s). Verify at build.
- Bottom bar: wordmark, © line, WhatsApp number, socials if real handles exist.
- **Removed:** all vendor links, Check Vendor.

### 6.3 Constants prune (`lib/constants.ts`)

- Replace `NAV_LINKS` with the §6.1 structure (or a new `SHOP_MENU` +
  `NAV_LINKS` pair).
- Delete `TRUST_TOOLS`, `VENDOR_CATEGORIES`, `VENDOR_STATUS_MAP`. Grep for
  each usage first — `VENDOR_STATUS_MAP` is used by `check-vendor/page.tsx`
  (out of scope, still in repo): keep a minimal local copy there, or leave
  `VENDOR_STATUS_MAP` in constants but comment it "used only by the unlinked
  check-vendor page." **Decision:** keep it in constants with that comment —
  deleting it means editing an out-of-scope page.
- Keep `ORDER_PIPELINE` (harmless, may be reused). Keep everything else.

## 7. Home (`app/(marketing)/page.tsx`)

Full restructure. Server component; `getFeaturedProducts` already awaited.
New section order:

### 7.1 Hero — the one cinematic moment
- Large Syne headline (draft: **"Buy the gadget. Skip the gamble."** — final
  copy §17), a supporting line naming the guarantee, one hero product image
  (the newest featured product, or a curated static image), primary CTA
  **"Shop gadgets"** → `/listings`, secondary **"How the guarantee works"** →
  `/#the-guarantee`.
- **Choreographed load:** headline clip/settle → hero product rises → the
  proof row (mini stats) fades up, staggered ~80ms. Implemented CSS-first with
  a small keyframe timeline in a `HeroSequence` client component; **only if**
  CSS can't express it cleanly, add the **`motion`** npm package, imported
  only by `HeroSequence`. That call is made in the hero task and recorded in
  the plan. Respects `prefers-reduced-motion` (render final state, no
  animation).
- Kept within the primary-blue world; `--color-section` / gradient treatment
  per the Marketplace direction.

### 7.2 Featured / New arrivals rail
- `getFeaturedProducts` (already there); if it returns < 2, fall back to a
  "newest" query (add `getNewArrivals(limit)` to `lib/products.ts` — thin
  wrapper over the existing pattern). `ProductCard` grid, "See all" → `/listings`.

### 7.3 The guarantee, explained  (`id="the-guarantee"`)
Replaces the old vendor-escrow "how it works". 4 beats, each an icon + short copy:
1. **We source & inspect every unit** — functionality, battery health, IMEI,
   cosmetic grade.
2. **You see the real thing** — actual photos of the actual unit, honest
   condition notes, full specs.
3. **Pay, then we ship** — order on WhatsApp; we confirm stock and details.
4. **Inspect on delivery — refund if it's wrong** — not as described, full
   refund, no argument.
Closing line: the "guaranteed or refunded" promise, bold.

### 7.4 Proof  (`id="reviews"` on this section — the nav "Reviews" anchor)
- The real track-record stats via `StatTile`:
  `₦2M+ protected` · `100+ transactions` · `0 confirmed scams` · `5 years`.
  (Confirm exact numbers — §17.)
- Real buyer testimonials (curated, real — the current three *vendor* quotes
  are replaced with real *buyer* quotes; provide via §17).
- Aggregate review score + link to reviews, once §11 data exists.

### 7.5 Shop by category
- Token-migrated tiles (the existing 4 + Gaming/Electronics as in
  `LISTING_CATEGORIES`), each → `/listings?category=X`.

### 7.6 Single CTA band
- "Ready to buy without the anxiety?" → **Shop gadgets**. One button. No
  vendor half.

**Cut entirely:** dual buyer/vendor CTA, the 4-tool safety grid, the dark
"Trust Tools Built for Nigeria" section, vendor testimonials, links to
`/how-it-works` / `/vendor-registration` / `/check-vendor` / `/for-vendors`.

## 8. Listings (`app/(marketing)/listings/page.tsx`)

- Title **"Shop all gadgets"** (was "Verified Listings"). Subhead names the
  guarantee.
- `FilterBar` (Phase 0 refit) stays — search, category, brand, condition,
  price, sort, all `searchParams`-driven through `getListings`. Desktop
  sidebar + mobile `Sheet` already built.
- `ProductCard`: **drop the "Verified Vendor" badge**; keep Featured + condition
  badges; add a subtle **"Zolarux inspected"** marker (small, not a loud badge).
- **`Pagination`** (Phase 0 component) wired to `getListings`' `page` param and
  `total` / `LISTINGS_PAGE_SIZE`. `hrefFor` preserves the other searchParams.
- Empty states on tokens: "no results after filtering" (with a clear-filters
  affordance) and "nothing in this category yet" (WhatsApp fallback: "Ask us to
  source it").
- `Reveal` on the grid on first load only.

## 9. Listing Detail (`app/(marketing)/listings/[id]/page.tsx`)

- `Gallery` + `SpecsTable` (Phase 0 refit) stay. Breadcrumbs (Phase 0):
  Shop → {category} → {name}.
- **Remove:** the vendor card, the "+ small escrow protection fee" line, the
  "Start Escrow Purchase" / escrow lock note, the `Badge variant="verified"`.
- **Price block:** price (or "Price on request"), plus a plain-language line —
  "Free inspection before dispatch · Delivery arranged on order".
- **New: Condition report** — a `Card` with what the unit's `condition` means
  in general + a slot for per-unit cosmetic notes. For Phase 1, per-unit notes
  come from `product.description` or a `specs` row if present; if absent, show
  the generic condition explainer only. (No new DB column.)
- **New: What's included** — rendered from a `specs` entry labelled "In the
  box" if present, else a generic line ("Device + charging cable. Original box
  where available.").
- **New: Guarantee panel** — a compact `Card`: *Inspected before dispatch ·
  You inspect on delivery · Full refund if not as described.* Links to
  `/#the-guarantee`.
- **CTA:** `Button` **"Order on WhatsApp"** → `buildWhatsAppUrl` with a
  pre-filled message: `Hi Zolarux, I'd like to order: {name} ({condition},
  {formatPrice(price)}). Is it available?`. Below it, a 3-step
  *what-happens-next* mini-list (confirm → pay → deliver & inspect).
- **Reviews section** (§11) — aggregate + list for this product, read-only.
- Related products rail (`getRelatedProducts`) stays; heading "More gadgets
  like this".
- `generateMetadata` copy updated (drop "vendor verified, escrow protected").

## 10. Login (`app/(auth)/login/page.tsx`)

- Keep the phone→OTP logic **exactly** (`signInWithOtp` / `verifyOtp`, E.164
  normalisation, two-step state). Only presentation changes.
- Rebuild the card on `Card` + `Field` + `Input` + `Button`; the OTP step uses
  a 6-box input group (reuse the pattern, tokenised). Phone→OTP transition is a
  tokened cross-fade/slide honoring `prefers-reduced-motion`. Error + resend
  states on tokens.
- `(auth)/layout.tsx` migrated to tokens (currently `bg-surface dark:bg-gray-950`
  hardcoded pairs — replace with `bg-background` etc.).
- Copy: "Welcome back" / "Sign in to track your orders". Links: drop
  "Register your business"; "No account?" points to `/login` (OTP *is* the
  sign-up) or is removed. Decision: remove the register links entirely — OTP
  handles both.

## 11. Reviews — read-only display

**Data:** the `reviews` table exists in the Supabase project (used by `main`).
**Task 1 of the reviews work must confirm its schema** via the Supabase MCP or
`main:lib/reviews.ts` as reference; adapt, do not assume columns.

- **New `lib/reviews.ts`** (read-only): `getProductReviews(productId)` →
  `{ reviews: Review[]; average: number; count: number }`;
  `getReviewSummary()` → site-wide `{ average, count }` for Home.
  `Review` type: `{ id, rating (1-5), title?, body, author_name, created_at,
  verified? }` — match to the real table.
- **New components** (`components/ui/`, on tokens, using Phase 0 primitives):
  - `StarRating` — display + optional size; half-stars.
  - `ReviewCard` — avatar (initials), name, date, stars, title, body,
    "Verified purchase" chip if `verified`.
  - `ReviewSummary` — big average + star row + count + distribution bars.
  - `ProductReviews` — server component: summary + `ReviewCard` list +
    "no reviews yet" empty state. No submit UI.
- **Home:** `ReviewSummary` (compact) in the Proof section, linking to
  `/#reviews` or the fuller list.
- **Listing Detail:** `ProductReviews` section.
- If `getReviewSummary().count === 0` at build/runtime, the Home review block
  and the "Reviews" nav item render nothing (graceful).
- **`main`'s `components/reviews/*`** (vendor-oriented) are **reference only** —
  not imported; the vendor-review variants are irrelevant here.

## 12. Motion

- Home hero: one choreographed sequence (§7.1). `motion` dependency added
  **only if** required, scoped to `HeroSequence`.
- Everything else: Phase 0 system — `Reveal` for section entrances (once),
  `hover-lift` on cards, `transition-micro` on interactive elements, tokened
  page-level cross-fades where a step changes (Login).
- Global `prefers-reduced-motion` guard already in `globals.css`; every new
  animation must degrade to its end state under it.

## 13. Token migration & compat-shim cleanup

- Each of the 6 surfaces (+ `(auth)/layout.tsx`, `(marketing)/layout.tsx` if
  it has hardcoded classes) moves fully to semantic tokens in the task that
  redesigns it. No `bg-white` / `text-gray-*` / `bg-gray-950` /
  `bg-primary-light` / `shadow-card` / `font-700` left on a Phase 1 surface.
- After all six migrate, **delete the compat shim** from `globals.css`
  (`@utility font-300..800`, `shadow-card*`, `shadow-primary`) — then grep the
  whole repo for those class names; any remaining hits are on out-of-scope
  pages (`check-vendor`, unbuilt pages) — **leave the shim entries those still
  need**, or (cleaner) leave the whole shim until a later phase and just note
  which Phase 1 pages no longer touch it. **Decision:** trim only the entries
  with zero remaining repo-wide usage after Phase 1; keep the rest with a
  comment listing the out-of-scope consumers.
- Keep `--color-accent` alias until `check-vendor` / others migrate.

## 14. Data model notes

- **No schema changes.** `Product.vendor_name` / `vendor_id` remain in the type
  as-is; `lib/products.ts` may stop `select('*')`-ing them implicitly — leave
  `select('*')` (simpler) but never render them.
- `lib/products.ts` gains `getNewArrivals(limit)` (§7.2) — a thin wrapper:
  `is_active`, order by `created_at` desc, limit.
- `reviews` table: read-only access via the new `lib/reviews.ts`. Schema
  confirmed in the first reviews task.

## 15. Verification

Per Phase 0: `npx tsc --noEmit` clean, `npm run lint` clean (0 errors;
pre-existing `<img>` / unused-var warnings tolerated), `npm run build`
succeeds, route table sane. Manual QA of every changed surface + `/dev/ui` at
**375 / 768 / 1280** in **light and dark**, keyboard focus, and
`prefers-reduced-motion`.

**Data-dependent QA — resolved:** the user adds
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
so Listings, Listing Detail, and reviews run against real data locally. The
plan's first task confirms the connection works (a listing renders, the
`reviews` table is reachable) before the data-page tasks start. Empty / error
/ reduced-motion states are still verified explicitly.

## 16. Out of scope (recap)

Check Vendor redesign · all unbuilt pages · review **submission** · cart /
checkout / payment / order records · middleware changes · new identity · test
framework · `about` / `(tools)` restyling · vendor surfaces of any kind.

## 17. Open items

**Resolved (2026-08-29):**
- **"The Guarantee" nav target** → Home `#the-guarantee` anchor. Phase 1 stays
  6 surfaces; no standalone page.
- **Supabase for verification** → user adds env vars to `.env.local` (§15).

**Content to be provided during implementation** (placeholder copy is used
until then; not blocking the plan):
- **Voice** — spec assumes brand-first "we" with an optional single founder
  accent on Home. Confirm or override.
- **Hero headline + supporting line** — placeholder "Buy the gadget. Skip the
  gamble." Provide the real line.
- **Track-record numbers** — placeholder `₦2M+` / `100+` / `0 scams` /
  `5 years`. Confirm or correct.
- **Real buyer testimonials** — 3+ genuine buyer quotes (name, city, what
  happened) to replace the current vendor quotes.

**Verified at build time** (not user input): which of `/privacy`, `/terms`,
`/refund-policy`, `/faq` resolve on this branch — the Footer omits any that
404.
