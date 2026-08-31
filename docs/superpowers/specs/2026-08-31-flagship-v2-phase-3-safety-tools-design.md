# Zolarux Flagship v2 — Phase 3: Safety Tools

**Date:** 2026-08-31
**Status:** Approved for planning
**Depends on:** Phase 2 (Trust & Story) — complete, `flagship-v2` @ `3f9f987`
**Program spec:** `2026-08-28-flagship-v2-phase-0-foundation-design.md` §1;
narrative pivot in `2026-08-29-flagship-v2-phase-1-shopping-spine-design.md` §1

---

## 1. Program context

Single-retailer redesign on `flagship-v2` (disjoint from `main`). Phases 0–2
delivered the design system, the shopping spine, and the trust/story pages
(10 real routes). The program's original Phase 3 was **"Safety tools — Check
Device, Verify Original, Report Stolen, Scan a Link (design-only)"**. Post-pivot
these still make sense — arguably *more* so: a trusted retailer offering the
same checks it runs internally, free, is on-brand ("we check this on every unit
— here's the same check for you"). Phase 3 brings the four tools onto
`flagship-v2`, redesigned and — for three of the four — **actually wired**.

## 2. Goal

Ship a genuine safety-tools section: a stolen-device IMEI check, an
originality-verification guide, a stolen-device report form, and a link
scanner — all on the Phase 0 kit, in the retailer voice, discoverable from a
top-nav dropdown. Fold in the removal of the orphaned `check-vendor` page and
the last of the compat shim.

## 3. Scope

**In scope — four tool pages:**

| Route | What | Wired? |
|---|---|---|
| `/check-device` | IMEI / serial → Zolarux stolen-device registry lookup | **yes** (Supabase, anon read) |
| `/check-original` | Guide: verify a serial on the manufacturer's own site | content only |
| `/report-item` | Form → adds a device to the stolen registry (`pending`) | **yes** (Supabase, anon insert) |
| `/scan-link` | Paste a product URL → rule-based scam-risk analysis | **yes** (new `/api/scan-link` route) |

Plus:
- **Navbar** — "Safety tools" `DropdownMenu` returns; new `SAFETY_TOOLS` constant.
- **Footer** — new "Safety" column.
- **`check-vendor` deletion** — page + `app/(tools)/check-vendor/` + the
  `VENDOR_STATUS_MAP` constant.
- **Compat shim removal** — `@utility font-700 / font-800 / shadow-card /
  shadow-card-hover` from `globals.css` (keep `font-500 / font-600`).
- **`app/(tools)/layout.tsx`** — verify/keep (currently token-clean).

**Out of scope:** any tool the four above don't cover · a `/safety` landing
page (the dropdown is the entry point) · the optional Grok path in
`/api/scan-link` beyond an env-gated pass-through · promoting `stolen_reports`
→ `stolen_registry` (that's Zolarux's internal review, not a public feature) ·
`flagged_entities` wiring (available, not used by these four) · Download App /
Blog / legal pages (the program remnant — a later "Phase 4") · any change to
Phases 0–2 surfaces beyond the Navbar/Footer additions.

## 4. Current-state facts (verified 2026-08-31)

- **`flagship-v2` routes:** `/`, `/about`, `/how-it-works`, `/faq`, `/contact`,
  `/listings`, `/listings/[id]`, `/login`, `/check-vendor` (unlinked),
  `/dev/ui`. `app/(tools)/` holds only `check-vendor/page.tsx` + `layout.tsx`
  (the layout = `<Navbar/>` + `<main className="pt-16">` + `<Footer/>`, no
  hardcoded classes — keep it).
- **`main` has all four tool pages** (`app/(tools)/{check-device,check-original,
  report-item,scan-link}/{page,layout}.tsx`) + `app/api/scan-link/route.ts`.
  They are the **reference** — port + redesign + reframe, do not copy verbatim.
  `main`'s copy is heavy with "buy through Zolarux escrow", "verifiable
  delivery through Zolarux", "vendor refuses to provide the IMEI" — all
  reframed for single-retailer.
- **Supabase (`ugieujaerhfqomvhqoie`), RLS confirmed 2026-08-31:**
  - `stolen_registry` — **0 rows**. Anon `SELECT` → 200. Anon `INSERT` → 401.
    Columns (from `main`'s `StolenRecord`): `id`, `imei?`, `serial_number?`,
    `item_name`, `created_at`, `status`. **The public "confirmed stolen"
    source.**
  - `stolen_reports` — 1 real row (IMEI `352130213565996`, `item_name`
    "iPhone 14 Pro", `date_stolen` 2026-07-22, `location_stolen` "Port
    Harcourt", `status` "pending") **+ 1 junk row this session created**
    (`id f7c56f5a-370c-491a-8b0b-3b74c07df327`, all fields null, `status`
    "pending") — **the user must delete that junk row**; anon can't. Anon
    `SELECT` → 200, anon `INSERT` → 201. Columns: `id`, `imei`,
    `serial_number`, `item_name`, `description`, `date_stolen`,
    `location_stolen`, `police_report_ref`, `owner_contact`, `status`
    (default `'pending'`), `reviewed_by`, `reviewed_at`, `created_at`.
  - `flagged_entities` — 8 rows, shape `{ id, name, phone_number, reason,
    notes, risk_level, status }` — a flagged-**contacts** registry (scammer
    phone numbers), not devices. Anon `SELECT` → 200. Not used by these four.
- **`app/api/scan-link/route.ts` on `main`** (372 lines): SSRF guard +
  **Option A** rule-based URL analysis (self-contained: domain allow/caution
  lists, shortener/TLD/HTTPS checks, gadget-keyword category, risk score 0–100
  with `flags` + `positives`) + **Option B** Grok AI (`process.env.GROK_API_KEY`
  → `api.x.ai`, falls back to Option A when unset) + a `products`-table query
  to surface Zolarux alternatives.
- **`lib/supabase/`** on `flagship-v2`: `client.ts` (browser/anon),
  `server.ts` (RSC/route), `middleware.ts`. `lib/utils`: `cn`,
  `buildWhatsAppUrl`, `formatDate`. `lib/constants`: `NAV_LINKS`, `HELP_LINKS`,
  `SHOP_MENU`, `WHATSAPP_NUMBER`, `VENDOR_STATUS_MAP` (kept only for
  `check-vendor`), `CONDITION_MAP`, etc.
- **Kit:** `Button`, `IconButton`, `Input`, `Field`, `Textarea`, `Select`,
  `Checkbox`, `Card`, `Accordion`, `Badge`, `Reveal`, `DropdownMenu` +
  `DropdownMenuItem`, `Breadcrumbs`, `toast`/`Toaster`, `Skeleton`.
  `components/marketing/PageHeader.tsx` (`{ eyebrow?, title, lede? }`, on a
  `bg-primary` band).
- **Compat shim** (`globals.css`): `@utility font-500 / 600 / 700 / 800`,
  `@utility shadow-card / shadow-card-hover`. Comment says 700/800 +
  shadow-card(-hover) are "only the unlinked check-vendor page". After Phase 3
  deletes `check-vendor`, re-grep: `font-500/600` stay (Phase 0 kit), the rest
  go.
- No test runner. `AGENTS.md`: read `node_modules/next/dist/docs/01-app/`
  before touching routing / route handlers / `generateMetadata`.

## 5. Approach

Build the constant + nav/footer wiring first (so each tool is reachable as it
lands), then the four tools in order of independence: `check-original` (pure
content) → `report-item` (one insert) → `check-device` (two reads) →
`scan-link` (page + API route). Then delete `check-vendor` and trim the shim,
then verify. Each tool is one task. All four pages get `PageHeader` + the
`(tools)` layout for free.

## 6. `SAFETY_TOOLS` constant + Navbar dropdown + Footer column

- **`lib/constants.ts`** — add:

  ```ts
  export const SAFETY_TOOLS = [
    { label: 'Check a device', href: '/check-device',   icon: 'smartphone', desc: 'Is this used phone stolen? Check the IMEI.' },
    { label: 'Verify it’s genuine', href: '/check-original', icon: 'scan-search', desc: 'Confirm a serial number on the maker’s own site.' },
    { label: 'Report a stolen device', href: '/report-item', icon: 'flag', desc: 'Add a stolen phone or laptop to the registry.' },
    { label: 'Scan a link', href: '/scan-link', icon: 'link', desc: 'Paste a listing link — we check it for scam signs.' },
  ] as const
  ```

  (`icon` is a string key; the Navbar maps it to a `lucide-react` component.)

- **`Navbar.tsx`** — add a second `DropdownMenu` after "Shop" (or after the
  `NAV_LINKS` map), trigger label **"Safety tools"** + `ChevronDown`, content
  listing `SAFETY_TOOLS` with icon + label + `desc` (two-line items, same
  visual weight as the `main` version but on tokens). In the mobile `Sheet`,
  add a "Safety tools" group listing the same links. Nothing else in the
  Navbar changes.

- **`Footer.tsx`** — add a **"Safety"** column (5th) rendering `SAFETY_TOOLS`
  as plain links. Grid: `lg:grid-cols-[1.6fr_1fr_1fr_1fr]` →
  `lg:grid-cols-[1.6fr_repeat(4,1fr)]` (and it already wraps 2-up on `sm`).

## 7. `/check-original` — verification guide (content only)

`PageHeader` (eyebrow "Safety tools", title "Verify a device is genuine",
lede). No form, no lookup. Sections:

1. **Why it matters** — one short paragraph: clones look identical; the only
   real proof is the manufacturer's own database.
2. **How to check** — a numbered `Card`: (1) find the serial/IMEI (`Settings →
   About`, or dial `*#06#`), (2) go to the maker's official checker, (3)
   confirm the model, warranty status and that it isn't reported lost/stolen.
3. **Official checkers** — a link list: Apple (`checkcoverage.apple.com`),
   Samsung, Google, Xiaomi, etc. *DRAFT — confirm the list; open in a new tab,
   `rel="noopener"`.*
4. **Red flags a clone shows** — bullet list (mismatched serial vs box,
   sluggish UI, wrong app store, low-res logo). *DRAFT.*
5. A closing line: "Every Zolarux unit has already passed this check —
   [see how we inspect](/how-it-works)."

## 8. `/report-item` — add to the stolen registry (wired)

Client page. `PageHeader` ("Report a stolen device", lede). A `Card` with a
`"use client"` form:

- Fields: **Device type** (`Select` — Phone / Laptop / Tablet / Other),
  **Make & model** (`Input` → `item_name`), **IMEI or serial** (`Input`),
  **When was it stolen?** (`Input type="date"` → `date_stolen`), **Where?**
  (`Input` → `location_stolen`), **Police report reference** (`Input`,
  optional → `police_report_ref`), **Your contact** (`Input` → `owner_contact`),
  **Anything else** (`Textarea` → `description`).
- Validate: `item_name` and (`imei` **or** `serial_number`) required; IMEI
  digits-only, 14–16 chars if present.
- Submit → `createClient()` (browser) `.from('stolen_reports').insert({ ...,
  status: 'pending' })`. On success: swap the form for a success panel ("Report
  received. Our team reviews reports within [window — *DRAFT*]; confirmed ones
  are added to the public registry."). On error: inline message + a WhatsApp
  fallback link.
- A note above the form: this is Zolarux's own registry, not the police; still
  file a police report.

New helper: **`lib/safety.ts`** — one client-safe module (no `next/headers`)
holding `submitStolenReport(payload)`, `checkDevice(query)` (both use
`@/lib/supabase/client`, the anon browser client) and `scanLink(url)` (a
`fetch` to `/api/scan-link`). Typed input/output so the pages stay thin.

## 9. `/check-device` — stolen-device lookup (wired)

Client page. `PageHeader` — but on a **danger-toned** band (use
`--color-danger` for the header background instead of `--color-primary`; add a
`tone?: 'primary' | 'danger'` prop to `PageHeader`), matching `main`'s red
hero — this is a warning tool. Title "Check if a device is stolen", lede.

**Lookup (`lib/safety.ts` — `checkDevice(query: string)`):**
1. Sanitise: trim, strip non-alphanumeric, require 5–20 chars.
2. `stolen_registry` — `.eq('imei', q)` then `.eq('serial_number', q)`. A hit
   → **`{ status: 'stolen', record }`** (strong red result: "This device is in
   our stolen registry. Do not buy it.").
3. If no registry hit, `stolen_reports` — `.eq('imei', q).eq('status',
   'pending')` (and serial). A hit → **`{ status: 'reported', record }`**
   (amber result: "Someone has reported this device as stolen — the report is
   under review. Treat with caution and ask us before buying.").
4. No hit anywhere → **`{ status: 'clean' }`** ("Not in our registry. This
   isn't a guarantee — it may be reported elsewhere. Combine with the
   originality check.").
5. Query error → **`{ status: 'error' }`**.

**Sections:** the search `Input` + `Button`; the result panel (4 states, each a
tokened `Card` with an icon, headline, body, and — for stolen/reported — the
`record` details via `formatDate`); an **educational block** ("6 red flags a
stolen phone shows" — reframed from `main`, drop the vendor/escrow lines); a
short FAQ via `Accordion` (reframed — "Is this a police database?" → no;
"clean ≠ safe"; "what if it's stolen" → don't buy, contact us).

**Data reality:** `stolen_registry` is empty and `stolen_reports` has one real
IMEI (`352130213565996`). So locally: that IMEI → "reported"; anything else →
"clean"; the "stolen" (registry) path is **structurally verified only** until
Zolarux adds a registry row (§15).

## 10. `/scan-link` — link scanner (wired)

**`app/api/scan-link/route.ts`** — port from `main`, keeping:
- SSRF guard (`isPrivateUrl`).
- Option A rule-based analysis (the whole self-contained scorer).
- The `products` query for "safer alternatives on Zolarux" (anon read works).
- Option B (Grok) **only as an env-gated branch that silently falls back** when
  `GROK_API_KEY` is unset (it will be). Do not add the key or a hard dependency.
- Response shape: `{ riskScore, verdict, flags[], positives[], category,
  alternatives[] }` where `verdict` is derived from `riskScore` with default
  thresholds `< 25` = "looks ok" / `25–60` = "be careful" / `> 60` = "high
  risk" (tune per §15).
- Reframe any Zolarux-model copy in the flags/positives strings.

**`/scan-link` page** — client. `PageHeader`. A URL `Input` + `Button`; on
submit `POST /api/scan-link` (with a client-side loading state). Result: a
tokened risk meter (score + verdict colour: verified/action/danger), the
`flags` and `positives` lists, and — if `alternatives.length` — a rail of
`ProductCard`s ("Buy it from Zolarux instead"). Educational block: "How to
spot a scam listing" (reframed). Error / invalid-URL states inline.

New helper: `lib/safety.ts` — `scanLink(url: string)` wrapping the `fetch`.

## 11. Delete `check-vendor` + kill the compat shim

- `git rm -r "app/(tools)/check-vendor"`.
- `lib/constants.ts` — delete `VENDOR_STATUS_MAP` (grep first — after the page
  is gone it has zero consumers).
- `robots.ts` / `sitemap.ts` — remove any `/check-vendor` reference if present.
- Re-grep: `grep -rnE "font-700|font-800|shadow-card|shadow-card-hover" app
  components --include="*.tsx" | grep -v "app/dev/"` → expect **zero**. Then
  delete those four `@utility` blocks from `globals.css`. Keep `font-500` /
  `font-600`. Grep `--color-accent` / `bg-accent` / `text-accent` too — if
  still zero, nothing to do (removed in Phase 1).

## 12. Motion

Restrained — Phase 0 system. `Reveal` on section entrances. Tool result panels
appear with a tokened `transition-micro` fade (no cinematic sequence). Loading
states use `Skeleton` or the `Button` `loading` prop. `prefers-reduced-motion`
respected (Phase 0 global guard).

## 13. Verification

Per Phase 2: `npx tsc --noEmit` clean, `npm run lint` 0 errors, `npm run
build` succeeds. Route table **gains** `/check-device`, `/check-original`,
`/report-item`, `/scan-link` and a dynamic `/api/scan-link`; **loses**
`/check-vendor`. Content verified via curl + no vendor/escrow leakage.

**Wired-path checks (real data, local):**
- `check-device`: `352130213565996` → "reported" state renders with the
  report details; a random IMEI → "clean"; malformed input → rejected.
- `report-item`: fill + submit → success panel; confirm a new `pending` row
  appears (then **delete the test row** — the user or, if the MCP regains
  write access, the assistant).
- `scan-link`: a `bit.ly` link → high risk + shortener flag; `apple.com` →
  low risk + positives; a `wa.me` link → messaging-app flag; an internal IP →
  blocked.
- The "stolen" (registry) path: structurally verified; needs a manual
  `stolen_registry` row to see live (§15).

Empty / error / reduced-motion states verified. Dark-mode + mobile eyeball
remains a human step (Chrome screenshot tool intermittent).

## 14. Out of scope (recap)

`/safety` landing page · Grok wiring · `stolen_reports`→`stolen_registry`
promotion · `flagged_entities` · Download App / Blog / legal · Phase 0–2
surface changes beyond Navbar/Footer.

## 15. Open items

- **Delete the junk `stolen_reports` row** `f7c56f5a-370c-491a-8b0b-3b74c07df327`
  (assistant can't — read-only Supabase access).
- **Content (DRAFT — provide later):** `check-original`'s official-checker
  list + clone red-flags; `report-item`'s review-window text; `check-device`'s
  red-flags + FAQ wording; `scan-link`'s scam-spotting content; the
  danger-vs-caution risk thresholds for `scan-link`.
- **To see `check-device`'s "stolen" path live:** add one row to
  `stolen_registry` (e.g. copy the pending `iPhone 14 Pro` report).
- **Optional later:** wire `GROK_API_KEY` for `scan-link` Option B; wire
  `flagged_entities` into a contact-check tool.