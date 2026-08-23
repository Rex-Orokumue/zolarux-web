# Zolarux Flagship Redesign — Design Spec

**Date:** 2026-08-23
**Status:** Approved for planning

## 1. Goal

Zolarux is a trust-and-escrow marketplace for gadget commerce in Nigeria: vendors are sourced off-platform via WhatsApp, listings are vendor-verified, and purchases are protected by an escrow "protection fee" flow that hands off to WhatsApp for the actual deal. The site (Home, About, Listings, Listing Detail, Check Vendor, Login) is already built and reasonably polished, but the goal of this project is to raise it to **flagship gadget-retailer quality** — blending Apple-grade visual craft (storytelling, imagery, motion, typographic confidence) with Amazon/Best-Buy-grade discovery power (real search, filters, sort) — without changing the underlying business model.

## 2. Scope

**In scope — one integrated redesign pass across:**
- Home (`app/(marketing)/page.tsx`)
- About (`app/(marketing)/about/page.tsx`)
- Listings (`app/(marketing)/listings/page.tsx`)
- Listing Detail (`app/(marketing)/listings/[id]/page.tsx`)
- Check Vendor (`app/(tools)/check-vendor/page.tsx`)
- Login (`app/(auth)/login/page.tsx`)
- Shared chrome: `Navbar`, `Footer` (light elevation, not a rebuild)
- A new shared component layer (see §4) used consistently across all of the above
- A `products` table schema addition: `brand`, `condition` (see §5)

**Out of scope (explicitly deferred to future projects):**
- The ~15 pages currently linked from nav/footer but not yet built (How It Works, For Buyers, For Vendors, Verified Vendors, Check Device, Verify Original, Report Stolen, Scan a Link, Register buyer/vendor, Download App, Blog, Contact, FAQ, Privacy, Terms, Refund Policy)
- Cart, checkout, payment integration, or any change to the WhatsApp-escrow purchase handoff
- Backend order/dispute logic, vendor-side tooling, auth logic (OTP flow behavior itself is unchanged — only its presentation is polished)
- Introducing a test framework (none exists in the repo today)
- Brand identity changes (color palette, fonts) — the existing identity (`#4064D7` primary / `#FFA600` accent, Syne display + DM Sans body) is kept as-is; this project elevates *execution*, not identity

## 3. Approach

Build a small shared foundation first (design tokens + components), then apply it consistently across all six pages and the shared chrome in one pass, rather than redesigning pages independently. This is what keeps the result feeling like one coherent flagship product instead of six separately-skinned pages.

## 4. Shared foundation

### 4.1 Design tokens (additions only — no palette/font changes)
- Condition badge colors (new / UK-used / refurbished / used) added to `tailwind.config.ts`, following the existing pattern used for `VENDOR_STATUS_MAP` in `lib/constants.ts`.
- Minor refinements to the existing shadow/motion scale (`boxShadow`, `animate-fade-up`) to support slightly richer hover/scroll-reveal treatment — extending, not replacing, what's in `globals.css` and `tailwind.config.ts` today.

### 4.2 New shared components (`components/ui/` or similar, following existing `components/layout/` convention)
- **`ProductCard`** — extracted from the inline function currently duplicated in `listings/page.tsx`; adds a condition badge alongside the existing Verified/Featured badges. Used on Listings, Home ("Featured Products" rail), and the Related Products rail on Listing Detail.
- **`FilterBar`** — search input, category, price range, brand, condition, sort. Renders as a sidebar on desktop and a bottom-sheet drawer on mobile, following the interaction pattern already established by the Navbar's Safety Tools dropdown/mobile menu.
- **`Gallery`** — replaces the current single hero image + thumbnail strip on Listing Detail with a proper carousel. Must degrade gracefully to a single clean image when a vendor supplied only one (or a low-quality) photo — this is a real constraint given vendors are sourced off-platform via WhatsApp and photo quality is inconsistent ([[zolarux-sourcing-model]]).
- **`SpecsTable`** — optional key/value spec rows on Listing Detail; renders only when a product has spec data.
- **`Badge`** — one consolidated component for Verified / Featured / Condition, replacing the ad-hoc badge markup currently repeated across Listings and Listing Detail.

### 4.3 Navbar / Footer
Light elevation only: spacing, motion timing/easing, and interaction polish on the Safety Tools dropdown (desktop) and mobile drawer. No structural or navigational changes, no new links added (missing pages stay unbuilt per §2).

## 5. Data model change

`products` gains two new **nullable** columns:
- `brand text`
- `condition text` — expected values: `'new' | 'uk_used' | 'refurbished' | 'used'` (enforced at the application layer via the `Product` TypeScript type; not a DB-level enum, to keep the migration simple and match the existing schema's style of plain-text status/category fields)

There is no migrations folder in this repo — the schema lives directly in the Supabase project — so this column addition happens out-of-band:

```sql
alter table products
  add column if not exists brand text,
  add column if not exists condition text;
```

This SQL will be run against the Supabase project directly (by the user, or via the Supabase MCP tool if connected) before the Listings/Listing-Detail filtering work depends on it. Existing rows with `null` values simply omit the condition/brand badge and are excluded from those specific filters — no other behavior changes. `types/product.ts` and `lib/constants.ts` (for condition labels + badge colors, following the `VENDOR_STATUS_MAP` pattern) are updated accordingly.

## 6. Page-by-page changes

### Home
- More cinematic hero — larger typographic moment, refined background treatment, kept within the existing primary-blue palette.
- New **Featured Products** rail sourced live from Supabase (`is_featured = true`) using the new shared `ProductCard`, replacing the purely static category-tile section as the primary product-discovery moment on the page.
- Existing sections (stats bar, category browse, how-it-works, trust tools, testimonials, dual CTA) are kept and tightened for visual rhythm and consistent motion, not removed or reordered.

### Listings
- `FilterBar` added: search (name/description `ilike`), category (existing), price range, brand, condition, sort (price asc/desc, newest, featured-first).
- All new facets flow through the existing `searchParams`-driven server query pattern in `getProducts()` — no client-side state library introduced.
- Inline `ProductCard` function replaced with the shared component.
- New empty state for "no results after filtering" (with a "clear filters" affordance), in addition to the existing "no listings yet in this category" empty state.

### Listing Detail
- Single image + thumbnail strip replaced with `Gallery`.
- `SpecsTable` rendered when spec data exists (optional — many listings won't have it yet).
- Brand and condition surfaced next to the existing Verified badge.
- New **Related Products** rail (same category, excluding the current product), using `ProductCard`.
- WhatsApp CTA and escrow trust-note copy/behavior unchanged.

### About
- Content unchanged; visual treatment elevated to match Home — larger editorial typography for the story section, stat tiles reusing the same treatment as Home's stats bar (currently styled slightly differently), tightened team section spacing/hierarchy.

### Check Vendor
- Tool logic (query flow, verified/flagged/not-found/error states) unchanged.
- Visual presentation of each result state elevated and brought into the same motion language as the rest of the site.

### Login
- OTP flow logic unchanged.
- Card presentation, phone→OTP step transition, and error states polished for flagship-app-level microinteraction quality.

## 7. Architecture & data flow

No new architectural patterns introduced. Everything stays server-rendered (RSC) with filter/sort state carried via `searchParams`, consistent with the existing Listings page. Client components ("use client") are used only where interaction requires it: the `FilterBar` drawer, the `Gallery`, debounced search input, and the existing Check Vendor / Login client logic (unchanged).

## 8. Error handling

Follows existing conventions: Supabase query errors are logged server-side and rendered as an empty result set with a friendly, WhatsApp-fallback-inclusive empty state — the same treatment already used in `listings/page.tsx`, extended to the new filtered/searched-empty case.

## 9. Testing / verification

No test framework exists in this repo (`package.json` has no Jest/Vitest/Playwright). Verification for this project is:
- `npm run lint` and `next build` passing
- Manual QA pass across breakpoints (mobile/tablet/desktop), empty states, missing/low-quality image fallback, and representative filter combinations, using the `run` skill to drive the live app in-browser

Introducing an automated test framework is a separate decision, not bundled into this project.

## 10. Open items requiring user action before/during implementation

- Run the `products` schema migration (§5) against the live Supabase project, or connect the Supabase MCP tool so it can be applied directly.
- Provide (or confirm placeholder use of) any real product photography if available — the `Gallery` component's graceful-degradation behavior is designed around the likely case that this isn't uniformly available.
