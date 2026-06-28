# Design: Listings filter, dark mode, supply disclaimer & hero/image refresh

Date: 2026-06-28
Status: Approved (pending spec review)

## Overview

Four related improvements to the Zolarux storefront:

1. **Smarter category filter** — broad filters (Accessories, Electronics…) match sub-type products (earpods, power bank, electric iron) via keyword groups.
2. **Site-wide dark mode** — toggle + system default, no flash on load.
3. **Price/availability disclaimer** — communicate that listings are a live showcase and final price/stock are confirmed at purchase.
4. **Hero & imagery refresh** — photo-backdrop heroes on every page plus added imagery on key pages.

These are independent and can be implemented/reviewed in phases. Recommended order: (1) filter → (3) disclaimer → (4) hero/imagery → (2) dark mode (largest, touches the most files; doing it last lets it absorb the markup added by the others).

---

## Context / why

Products are sourced from independent vendors over WhatsApp and listed under the Zolarux official store account. Vendors are **not** registered on the platform and do **not** notify Zolarux of sell-outs or price changes. Consequence: a listed price or availability may be stale by the time a customer enquires. The disclaimer manages this expectation; it must read as trustworthy, not as a disclaimer-of-liability.

Tech baseline: Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@theme` in `app/globals.css`), Supabase. Per `AGENTS.md`, consult `node_modules/next/dist/docs/` before writing framework code — this Next version has breaking changes.

---

## Feature 1 — Smarter category filter

### Problem
`app/(marketing)/listings/page.tsx` filters with `query.ilike('category', '%${category}%')`. It only matches the stored `category` string. Products whose category/name is a sub-type ("Earpods", "Power Bank", "Electric Iron") never appear under the umbrella filter ("Accessories", "Electronics").

### Design
- Add `CATEGORY_KEYWORDS: Record<string, string[]>` to `lib/constants.ts`, keyed by the `LISTING_CATEGORIES` labels. Each value is a synonym list (lowercase). Initial set (extend freely):
  - **Phones**: phone, smartphone, iphone, android, tablet, ipad, galaxy
  - **Laptops**: laptop, computer, macbook, notebook, pc, monitor, desktop
  - **Accessories**: accessor, earpod, airpod, earphone, headphone, headset, charger, cable, power bank, powerbank, selfie, tripod, case, cover, screen protector, adapter, smartwatch, watch band, memory card, flash drive, mouse, keyboard
  - **Electronics**: electronic, iron, kettle, blender, fan, microwave, appliance, speaker, soundbar, television, tv, home theatre, home theater, generator, stabilizer, inverter, camera, projector, woofer
  - **Gaming**: game, gaming, console, playstation, ps4, ps5, xbox, nintendo, controller, joystick, joy-con
- In both `getProducts` and `getFeaturedProducts`, when `category !== 'All'`:
  - Look up keywords. If found, build a Supabase `.or(...)` matching **each keyword against both `category` and `name`**, e.g.
    `category.ilike.%earpod%,name.ilike.%earpod%, …`
  - If the category has no keyword entry, fall back to the current single `ilike('category', …)`.
- Build the `.or()` string by mapping keywords → `category.ilike.%kw%,name.ilike.%kw%` and joining with commas. Keep the existing gadget-first client-side `sorted` reorder.
- Keep everything server-side so pagination/count stay correct.

### Edge cases
- Commas/special chars in keywords: keywords are author-controlled, keep them comma-free.
- "All" unchanged.
- Vendor filter (`vendor`) still ANDs with the category `.or(...)`.

---

## Feature 2 — Site-wide dark mode

### Behaviour
Default = follow OS (`prefers-color-scheme`); a sun/moon toggle overrides and persists to `localStorage`. No flash of wrong theme on first paint.

### Infrastructure
- `app/globals.css`:
  - Add Tailwind v4 class strategy: `@custom-variant dark (&:where(.dark, .dark *));`
  - Base `body` background/text driven by CSS vars that flip under `.dark` (handles the page canvas).
  - Add `.dark` overrides for `.post-body` blog styles (headings, text, blockquote, aside, code/pre, borders).
- `app/layout.tsx`:
  - Add `suppressHydrationWarning` to `<html>`.
  - Inject an **inline no-flash `<script>`** in `<head>` that, before paint, reads `localStorage.theme` (else `matchMedia('(prefers-color-scheme: dark)')`) and toggles `documentElement.classList`. Update the static `bg-white text-gray-900` on `<body>` to include dark variants.
- `lib/theme.ts`: tiny helper — `getTheme()`, `setTheme('light'|'dark'|'system')`, applies/removes `.dark`, writes `localStorage`, subscribes to OS changes when in "system" mode. No new dependency (custom, given Next version churn).
- `components/layout/ThemeToggle.tsx`: client button (lucide `Sun`/`Moon`), reads/sets theme via `lib/theme.ts`. Placed in `Navbar` desktop CTA row and mobile menu.

### Applying dark styles (~61 component files)
Mechanical, consistent mapping (documented here so it stays uniform). Applied component-by-component:

| Light | Dark variant |
|-------|--------------|
| `bg-white` | `dark:bg-gray-900` |
| `bg-gray-50`, `bg-surface` | `dark:bg-gray-950` |
| `bg-gray-100` | `dark:bg-gray-800` |
| `text-gray-900` | `dark:text-gray-100` |
| `text-gray-700` | `dark:text-gray-300` |
| `text-gray-600`/`500` | `dark:text-gray-400` |
| `text-gray-400` | `dark:text-gray-500` |
| `border-gray-100`/`200` | `dark:border-gray-800` |
| status chips `bg-{green,amber,red}-50` | add `dark:bg-{color}-950/40`, `dark:text-{color}-300`, `dark:border-{color}-900` |
| `bg-primary` / `bg-accent` brand blocks | keep (white text already legible); only adjust light-tinted variants (`bg-primary-light` → `dark:bg-primary-900/30`) |

Scope: all of `app/**` and `components/**` (the ~61 files using hardcoded light colors). Brand colors (`--color-primary`, `--color-accent`) are unchanged.

### Out of scope
Re-theming brand colors; redesigning components; any HTML stored in the DB (email/PDF templates).

---

## Feature 3 — Price/availability disclaimer

### Copy (combined trust-forward + plain-spoken)
> **Live catalogue from verified partner vendors.**
> Prices and stock can change fast — we confirm the final price and availability with you before any payment.

### Placement (banner + inline)
- **Banner**: a slim, dismissible info strip on the listings page, directly under the hero. Shield/info icon, brand-tinted, dismiss state stored in `localStorage` (e.g. `zlx_supply_notice_dismissed`). New component `components/listings/SupplyNotice.tsx` (client, for dismiss).
- **Inline note**: a small muted label next to every price, on product cards (`ProductCard` in listings page) and the product detail page (`app/(marketing)/listings/[id]/page.tsx`): e.g. `ⓘ Confirmed at checkout`. For `pricing_type === 'quote'` items it complements the existing "Price on request".

Both must respect dark mode.

---

## Feature 4 — Hero & imagery refresh

### Hero style (chosen: Option C — photo backdrop, on every page)
Pattern: full-bleed background photo + left-weighted blue gradient overlay
(`linear-gradient(90deg, rgba(18,28,66,.93), rgba(46,79,191,.72) 58%, rgba(64,100,215,.30))`),
a trust pill, large display headline, supporting line, optional trust chips. Reusable component `components/layout/PageHero.tsx` taking `imageUrl`, `eyebrow`, `title`, `subtitle`, `chips?`.

- **Listings hero** uses the approved photo: `https://images.unsplash.com/photo-1576814547952-f8531781d7ef` (African man with smartphone, shot in Lagos).
- Other pages each get a fitting Unsplash photo with a **Nigerian / Black-audience** subject relevant to that page (sourced during implementation; user can swap any). Per-page themes:
  - Home: shopping/gadgets lifestyle
  - How It Works: person using phone / unboxing
  - For Vendors: seller/small-business with products
  - About, FAQ, downloads, tools: relevant supporting photo or the gradient fallback if no strong photo exists
- Photos served from Unsplash CDN with sizing params (`?w=…&q=70&auto=format&fit=crop`). All chosen images are free for commercial use, no attribution required.

### Added imagery (beyond heroes) on: Home, How It Works, For Vendors, Product detail
- **Home**: product/lifestyle images in feature/benefit sections.
- **How It Works**: one illustrative image per step.
- **For Vendors**: imagery showing vendors/selling.
- **Product detail**: visual polish (gallery framing, trust visuals) — no change to data.
All imagery: Black/Nigerian-audience subjects where people appear; must look correct in dark mode (overlays/borders adjusted).

---

## Components & files (summary)

New:
- `lib/theme.ts`
- `components/layout/ThemeToggle.tsx`
- `components/layout/PageHero.tsx`
- `components/listings/SupplyNotice.tsx`

Changed (high level):
- `lib/constants.ts` — `CATEGORY_KEYWORDS`
- `app/globals.css` — dark variant + base vars + `.post-body` dark + body dark
- `app/layout.tsx` — no-flash script, `suppressHydrationWarning`, body dark classes
- `components/layout/Navbar.tsx` — theme toggle (desktop + mobile) + dark styles
- `app/(marketing)/listings/page.tsx` — keyword filter, supply notice, inline note, PageHero
- `app/(marketing)/listings/[id]/page.tsx` — inline note, dark styles
- Heroes across `app/**` pages — adopt `PageHero`
- Imagery on home, how-it-works, for-vendors, product detail
- All ~61 files using light-only colors — dark variants per mapping table

## Testing / verification
- Filter: with `category=Accessories`, a product named "Earpods" (category "Other Gadgets") appears; `category=Electronics` surfaces "Electric Iron"; "All" unchanged; pagination/count correct.
- Dark mode: toggle flips theme and persists across reloads; first paint matches stored/OS preference (no flash); key pages legible in both themes (no white-on-white / black-on-black); blog `.post-body` readable in dark.
- Disclaimer: banner shows, dismiss persists; inline note appears next to prices in both themes.
- Hero/imagery: heroes render with photo + readable overlay text in both themes; images load with correct sizing.
- `npm run build` and `npm run lint` pass.

## Open items / risks
- Dark mode is large (~61 files); mechanical but high-volume — expect the bulk of effort here.
- Per-page hero photos for "photo style everywhere" need sourcing; pages without a strong fitting photo fall back to the gradient overlay on a neutral image.
- Keyword lists are heuristic; easy to extend as new product types appear.
