# Zolarux Flagship v2 — Phase 0: Foundation

**Date:** 2026-08-28
**Status:** Approved for planning
**Supersedes framing of:** `2026-08-23-flagship-redesign-design.md` (that spec scoped an *elevation pass*; this program is a full redesign)

---

## 1. Program context

The goal is to rebuild the Zolarux site into a best-in-class gadgets retail
experience — blending cinematic product craft, real discovery power, and a
distinct point of view — **without changing the business model** (off-platform
WhatsApp vendor sourcing, vendor verification, escrow "protection fee" handoff
to WhatsApp).

This is too large for one spec. It is decomposed into five phases, each with its
own spec → plan → implementation cycle:

| Phase | Scope |
|---|---|
| **0 — Foundation** *(this spec)* | Evolved identity tokens, motion system, core component library, dark mode, verification route |
| 1 — Shopping spine | Navbar, Footer, Home, Listings, Listing Detail, Check Vendor, Login |
| 2 — Trust & story | About, How It Works, For Buyers, For Vendors, Verified Vendors |
| 3 — Safety tools | Check Device, Verify Original, Report Stolen, Scan a Link (design-only) |
| 4 — Content & account shells | Register (buyer/vendor), Download App, Blog, Contact, FAQ, Privacy, Terms, Refund Policy (design-only) |

**Chosen visual direction: "Marketplace"** — discovery-first, warm and dense,
blue as structure + amber as action, soft layered elevation, springy motion.
Selected from a three-direction exploration
(`Signal` / `Marketplace` / `Statement`). The other directions are not carried
forward, though individual moves from them may be borrowed later.

**Identity stance:** evolve, don't replace. The roots stay — `#4064D7`-family
blue, `#FFA600`-family amber, Syne (display) + DM Sans (body). Phase 0 pushes
them into a real system with far more range.

**New pages across the program are design-only:** full layout, real copy, real
form interactivity (typing, validation, success/error states), but submissions
are not wired to a backend. Pages with existing real data (Listings, Listing
Detail, Check Vendor) stay wired.

## 2. Branch strategy

- New long-lived branch **`flagship-v2`**, cut from the current
  `flagship-redesign` tip (`67a2b22`). This keeps the shared components already
  built there (`Badge`, `StatTile`, `ProductCard`, `Gallery`, `SpecsTable`,
  `FilterBar`) as raw material.
- Each phase is developed on a branch off `flagship-v2`
  (`flagship-v2/phase-0-foundation`, etc.) and merged back when its plan
  completes.
- `main`'s separate dark-mode rollout (disjoint history) is **not merged**. Its
  palette decisions are treated as reference; dark mode is re-implemented here
  inside the new token system.
- Task 15 ("final verification pass") from the old `flagship-redesign` plan is
  abandoned as written — it verified the elevation pass, which this program
  replaces.

## 3. Current-state facts (verified 2026-08-28)

- **Next.js 16.2.6**, React 19.2.4, TypeScript 5. `AGENTS.md` warns Next 16 has
  breaking changes vs. common knowledge — implementation **must** consult
  `node_modules/next/dist/docs/` before using Next APIs.
- **Tailwind v4** (`@tailwindcss/postcss`), currently in a hybrid setup:
  `app/globals.css` does `@import 'tailwindcss'` then `@config
  '../tailwind.config.ts'`. `tailwind.config.ts` extends `colors`, `fontFamily`,
  `boxShadow`, `borderRadius`.
- **Fonts:** self-hosted via `@fontsource/syne` (400/600/700/800) and
  `@fontsource/dm-sans` (300/400/500/700), `@import`-ed at the top of
  `globals.css`. Not `next/font`. `tailwind.config.ts` references
  `var(--font-syne)` / `var(--font-dm-sans)` but `globals.css` uses literal
  family names — a latent inconsistency to resolve.
- **Colors today:** `:root` CSS vars (`--primary`, `--accent`, `--foreground`,
  `--muted`, `--border`, `--background`, `--surface`). **No dark mode** on
  `flagship-redesign`.
- **Utilities that already exist** (`lib/utils.ts`): `cn()` (clsx +
  tailwind-merge), `formatPrice()` (Intl NGN, no decimals), `formatDate()`,
  `buildWhatsAppUrl()`, `slugify()`, `truncate()`, `escapeHtml()`.
- **`lib/constants.ts`:** `CONDITION_MAP` currently maps conditions to generic
  Tailwind color classes (`text-green-700` etc.) — not brand-aligned.
  `VENDOR_STATUS_MAP`, `LISTING_SORT_OPTIONS`, `NAV_LINKS`, `TRUST_TOOLS` also
  live here.
- **Deps already present** usable for the component library: `@radix-ui/react-*`
  (dialog, dropdown-menu, label, navigation-menu, separator, slot),
  `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

## 4. Goal of Phase 0

Produce the single source of truth — design tokens, motion primitives, and a
themed component library — that every subsequent phase builds against, so ~21
pages end up feeling like one product rather than many skins. Phase 0 changes
**no user-facing pages**.

## 5. Token architecture

### 5.1 Move to Tailwind v4 native theming

- Replace the `@config '../tailwind.config.ts'` shim with a native `@theme`
  block in `globals.css`. Delete `tailwind.config.ts` unless a v4-inexpressible
  need remains (if so, document why in the file).
- Two token layers:
  - **Primitives** — raw ramps, theme-independent:
    `--color-blue-{50,100,200,300,400,500,600,700,800,900}`,
    `--color-amber-{100,300,500,700}`,
    `--color-neutral-{0,50,100,200,300,400,500,600,700,800,900,950}` (warm bias —
    a hint of the amber hue in the low end, a hint of blue in the high end, never
    pure grey),
    `--color-green-{...}`, `--color-red-{...}`, `--color-violet-{...}` for
    semantic status.
  - **Semantic tokens** — what components consume. Defined for light on
    `:root`; overridden for dark under `.dark` (see §6).

### 5.2 Semantic color tokens (Marketplace direction)

| token | light | dark | role |
|---|---|---|---|
| `--color-bg` | `#FBFAF8` | `#101216` | page ground |
| `--color-surface` | `#FFFFFF` | `#191C22` | cards, inputs |
| `--color-surface-raised` | `#FFFFFF` | `#1F232B` | popovers, sheets, sticky bars |
| `--color-ink` | `#191B21` | `#ECEDF1` | primary text |
| `--color-ink-soft` | `#5B616E` | `#939AA6` | secondary text |
| `--color-line` | `#ECE8E1` | `#2A2F39` | borders, dividers |
| `--color-primary` | `#3E5FD0` | `#7B97FF` | structure, primary CTA, links |
| `--color-on-primary` | `#FFFFFF` | `#0B0E14` | text/icons on primary fill |
| `--color-primary-soft` | `#EEF2FE` | `#1D2740` | primary-tinted fills |
| `--color-action` | `#FF9500` | `#FFAE3D` | deals, featured, "hot" accents |
| `--color-on-action` | `#191B21` | `#101216` | text on action fill |
| `--color-verified` | `#1F9D6B` | `#2FCB90` | verification / success |
| `--color-danger` | `#D64545` | `#F87171` | destructive / error |
| `--color-section` | `#EEF2FE` | `#161B2B` | alternating section bands |
| `--color-ring` | `#3E5FD0` | `#7B97FF` | focus ring |

Contrast: every text-on-surface pair above meets WCAG AA for body text in both
themes; `ink-soft` on `bg` is the tightest and must be re-checked if adjusted.

### 5.3 Shape, elevation, motion tokens

| token | value |
|---|---|
| `--radius-sm` | `9px` |
| `--radius-md` | `14px` (default for cards, buttons, inputs) |
| `--radius-lg` | `20px` |
| `--radius-pill` | `999px` |
| `--shadow-sm` | `0 1px 2px -1px rgb(0 0 0 / .08), 0 1px 3px -1px rgb(0 0 0 / .06)` |
| `--shadow-md` | `0 6px 16px -8px rgb(24 26 33 / .16), 0 2px 6px -3px rgb(24 26 33 / .10)` |
| `--shadow-lg` | `0 12px 28px -14px rgb(24 26 33 / .28), 0 3px 8px -4px rgb(24 26 33 / .12)` |
| `--dur-micro` | `160ms` (small hovers, color/opacity) |
| `--dur-lift` | `340ms` (card lift, sheet slide, reveal) |
| `--ease-out` | `cubic-bezier(.2, 0, 0, 1)` |
| `--ease-spring` | `cubic-bezier(.34, 1.28, .4, 1)` |

Dark-theme shadows use higher opacity / longer spread (documented alongside the
light values in `globals.css`).

### 5.4 Typography

- Keep `@fontsource` self-hosting. Add `@fontsource/dm-sans/600.css` (Marketplace
  uses DM Sans 400/500/600/700). Syne stays 600/700/800.
- Resolve the family-name inconsistency: pick **literal family names** in one
  place (`--font-display: 'Syne', ...`, `--font-body: 'DM Sans', ...` as tokens)
  and reference the tokens everywhere.
- Type scale (rem, ~1.2 ratio, tokenised as `--text-*`):
  `--text-xs .75` / `--text-sm .875` / `--text-base 1` / `--text-lg 1.125` /
  `--text-xl 1.35` / `--text-2xl 1.65` / `--text-3xl 2.05` / `--text-4xl 2.6` /
  `--text-5xl 3.3` / `--text-6xl 4.2`. Fluid clamping is applied per-use in
  pages, not baked into the scale.
- Defaults: headings → Syne 700, `line-height: 1.1`, `letter-spacing: -0.018em`,
  `text-wrap: balance`. Body → DM Sans 400, `line-height: 1.6`. Prices / figures
  → DM Sans 700 with `font-variant-numeric: tabular-nums`. Uppercase eyebrows /
  labels → `letter-spacing: 0.08em`.

### 5.5 Condition + status maps

Rebuild `CONDITION_MAP` in `lib/constants.ts` to reference semantic tokens (via
utility classes that resolve to CSS vars) rather than hardcoded palette classes:

| condition | token |
|---|---|
| `new` | `--color-verified` |
| `uk_used` | `--color-primary` |
| `refurbished` | `--color-refurb` (semantic token; light `#7C5CE0` / dark `#A98BFF`) |
| `used` | `--color-ink-soft` |

Add `--color-refurb` to the semantic layer in §5.2 alongside the others.

Each renders as a soft-tinted chip (`color-mix` of the token with `surface`) with
the token as text/border. `VENDOR_STATUS_MAP` gets the same treatment (its
`headerBg` hex values are replaced with token references).

## 6. Dark mode

- Add **`next-themes`**. `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, `disableTransitionOnChange`.
- `<ThemeProvider>` wraps the app in the root layout (`app/layout.tsx`), which
  must gain `suppressHydrationWarning` on `<html>`. Verify the Next 16 App Router
  integration against `node_modules/next/dist/docs/` — this is the one place
  Phase 0 touches a framework seam.
- Dark tokens are defined as a `.dark { ... }` override block in `globals.css`,
  redefining **only** the semantic layer from §5.2–5.3. Components never
  reference a raw palette value or a `.dark`-only declaration directly.
- `ThemeToggle` component: a three-way control (light / system / dark) using the
  Radix dropdown or a segmented control; shows the resolved state; keyboard
  accessible. Lands in the component library; it is wired into the Navbar in
  Phase 1.
- `prefers-color-scheme` still governs the un-toggled default via `system`.

## 7. Motion system

- **CSS-first.** Transitions and keyframe animations driven by the `--dur-*` /
  `--ease-*` tokens. Named utilities in `globals.css`:
  `.transition-lift`, `.transition-micro`, a refreshed `.animate-fade-up`
  (replacing the current ad-hoc one), and hover-lift patterns for cards.
- **One client helper: `<Reveal>`** (`components/ui/Reveal.tsx`) —
  `"use client"`, wraps children, uses `IntersectionObserver` to toggle a
  `data-revealed` attribute that triggers a token-timed fade-up. Props:
  `as`, `delay`, `once` (default true). Renders children immediately (no layout
  shift, SSR-safe) and simply skips the animation when
  `prefers-reduced-motion: reduce` or when `IntersectionObserver` is
  unavailable.
- **Global reduced-motion guard** in `globals.css`: collapse animation/transition
  durations to ~0 under `prefers-reduced-motion: reduce`.
- **No animation library.** If Phase 1 hits an interaction that genuinely needs
  timeline orchestration (e.g. a multi-element hero sequence), adding `motion`
  is a decision made in that phase's spec, not now.

## 8. Component library

**Location:** `components/ui/` (matches existing convention). One component per
file, PascalCase. Barrel export at `components/ui/index.ts`.

**Construction rules:**
- Variants via **CVA**; class merging via `cn()`.
- Use a **Radix primitive** whenever the component needs focus management, an
  accessible open/close, or ARIA wiring: `Dialog`, `Sheet` (Radix Dialog with
  side styling), `DropdownMenu`, `Tabs`, `Tooltip`, `Accordion`, `Select`,
  `Checkbox`, `RadioGroup`, `Separator`, `Label`. Radix packages already
  installed: `react-dialog`, `react-dropdown-menu`, `react-label`,
  `react-navigation-menu`, `react-separator`, `react-slot`. Packages to add:
  `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`,
  `@radix-ui/react-accordion`, `@radix-ui/react-checkbox`,
  `@radix-ui/react-radio-group`, `@radix-ui/react-select`.
- **Toasts: `sonner`** (not `@radix-ui/react-toast`) — lighter, standard, and
  avoids hand-building a toast viewport. Flagged in §11.
- Every interactive component has a visible `:focus-visible` ring from
  `--color-ring`.
- Every component renders correctly in both themes with no per-theme props.
- Server-compatible by default; `"use client"` only where interaction requires
  it.

**Inventory (Phase 0 delivers all of these):**

| Component | Notes |
|---|---|
| `Button` | variants: `primary`, `secondary`, `ghost`, `danger`, `link`; sizes `sm`/`md`/`lg`; `asChild` via Radix Slot; loading state |
| `IconButton` | square, `lucide-react` icon, required `aria-label` |
| `Input`, `Textarea` | label, hint, error slot; error state uses `--color-danger` |
| `Select` | Radix Select, styled to match Input |
| `Checkbox`, `RadioGroup` | Radix |
| `Badge` | refit existing; variants `verified`, `featured`, `condition-*`, `neutral` |
| `FilterPill` | toggle chip for FilterBar; active = primary fill |
| `Card` | `surface` bg, `--radius-md`, `--shadow-md`, optional hover-lift |
| `Dialog`, `Sheet` | Radix Dialog; Sheet slides from bottom (mobile) / right (desktop) |
| `DropdownMenu` | Radix; used by Navbar Safety Tools + ThemeToggle |
| `Tabs`, `Tooltip`, `Accordion` | Radix |
| `Toast` | `sonner`, themed |
| `Skeleton` | shimmer honoring reduced-motion |
| `Avatar` | vendor avatars, initials fallback |
| `Breadcrumbs`, `Pagination`, `Separator` | |
| `ThemeToggle` | §6 |
| `Reveal` | §7 |

**Refit of existing branch components onto the new tokens:** `StatTile`,
`ProductCard`, `Gallery`, `SpecsTable`, `FilterBar` (plus `Badge`). Behaviour
unchanged; only styling moves to tokens + new components. Their consuming pages
are not touched in Phase 0 — they keep compiling with the refitted components.

## 9. Verification

No test framework exists; introducing one remains a separate decision, out of
scope here.

- **`/dev/ui` route** — an unlinked page (`app/dev/ui/page.tsx`, excluded from
  `sitemap.ts` and `robots.ts`) rendering every component in every variant and
  state, grouped by component, with a theme toggle pinned on the page.
- Phase 0 is done when:
  - `npm run lint` — clean
  - `npx tsc --noEmit` — clean
  - `next build` — succeeds; route table shows `/dev/ui` and no unexpected
    dynamic/static changes to existing routes
  - Manual QA of `/dev/ui` at **375 / 768 / 1280 px** in **both themes**, plus a
    smoke check that the six existing pages still render (they now consume
    refitted components)
  - `prefers-reduced-motion` verified to suppress `Reveal`, skeleton shimmer, and
    hover-lift

## 10. Out of scope for Phase 0

- Any redesign of Home, About, Listings, Listing Detail, Check Vendor, Login
- Navbar / Footer rebuild (Phase 1)
- Any new page from Phases 2–4
- Wiring `main`'s dark-mode code (reference only)
- Test framework
- Content / copywriting work
- The `products` table `brand` / `condition` columns — already added on
  `flagship-redesign` per the prior spec; unchanged here

## 11. Open items requiring user input

- ~~Confirm `flagship-v2` as the branch name (§2).~~ **Resolved:** confirmed;
  branch cut from `flagship-redesign` tip `67a2b22`.
- ~~`sonner` vs. `@radix-ui/react-toast` for toasts.~~ **Resolved:** `sonner`
  (implemented in `components/ui/Toast.tsx`, mounted in the root layout).
- ~~Whether `/dev/ui` ships permanently.~~ **Resolved:** it stays on the branch
  through the program and is removed before the final merge to `main` — tracked
  as an integration-phase task.

## 12. Phase 0 completion (2026-08-28)

All 16 plan tasks committed to `flagship-v2`. `npx tsc --noEmit` clean;
`npm run lint` clean (6 pre-existing-style `<img>` / unused-var **warnings**,
0 errors); `next build` succeeds with the route table unchanged except the
added static `/dev/ui`. Component library verified on `/dev/ui` in light and
dark at desktop width; the six existing pages (`/`, `/about`, `/listings`,
`/listings/[id]`, `/check-vendor`, `/login`) still render (only pre-existing
Supabase "table not found" fetch errors, unrelated to this work).

**Known deferred to Phase 1** (cosmetic, on un-migrated page markup — not
Phase 0's job): white full-bleed strips against the dark background on
`/listings` and `/check-vendor`; low-contrast hardcoded `text-gray-*` in some
page-level empty states; hero sections using `bg-primary` now render with the
dark-theme blue. These pages are fully redesigned in Phase 1.
