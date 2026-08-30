# Zolarux Flagship v2 — Phase 2: Trust & Story

**Date:** 2026-08-30
**Status:** Approved for planning
**Depends on:** Phase 1 (Shopping spine) — complete, `flagship-v2` @ `18431a8`
**Program spec:** `2026-08-28-flagship-v2-phase-0-foundation-design.md` §1;
narrative pivot in `2026-08-29-flagship-v2-phase-1-shopping-spine-design.md` §1

---

## 1. Program context

Single-retailer redesign on `flagship-v2` (disjoint from `main`). Phase 0
delivered the token system + component library; Phase 1 rebuilt the six
shopping-spine surfaces. The program's original Phase 2 was **"Trust & story:
About, How It Works, For Buyers, For Vendors, Verified Vendors"** — the
single-retailer pivot cuts For Vendors and Verified Vendors entirely, and
folds For Buyers into the Home guarantee section. Phase 2 is re-scoped to the
**four trust/story pages a single trusted gadget retailer needs**.

## 2. Goal

Give the site a credible "who we are / how this works / is this legit" layer:
a founder-led About, a full How-It-Works page, an FAQ, and a Contact page —
all on the Phase 0 kit, all in the retailer voice.

## 3. Scope

**In scope — four pages:**

| Page | Route | State |
|---|---|---|
| About | `/about` (`app/(marketing)/about/page.tsx`) | exists — redesign + token migration + narrative reframe |
| How It Works | `/how-it-works` (`app/(marketing)/how-it-works/page.tsx`) | **new** |
| FAQ | `/faq` (`app/(marketing)/faq/page.tsx`) | **new** |
| Contact | `/contact` (`app/(marketing)/contact/page.tsx`) | **new** |

Plus: Navbar / Footer / `lib/constants.ts` updates (§10).

**Content:** the assistant drafts all copy in the retailer voice, marking
anything guessed (delivery times, coverage areas, exact policy numbers) as
draft. The user replaces specifics later — same pattern as the Phase 1
testimonials / hero line. Reusable real facts (from prior copy): ~5 years
operating, ₦2M+ in orders, 0 confirmed scams, nationwide with Lagos / Abuja /
Port Harcourt named, gadgets only, ~1–5 business days delivery.

**Out of scope:** Blog and `blog_posts` wiring · legal pages (Privacy, Terms,
Refund Policy — "guaranteed or refunded" is explained on How It Works for now)
· any vendor-facing page · For Buyers as a standalone page · a real
Contact-form backend (the form routes to WhatsApp — §9) · any change to the
six Phase 1 surfaces beyond the Navbar/Footer link updates in §10 · the
`(tools)` pages.

## 4. Current-state facts (verified 2026-08-30, `flagship-v2` @ `18431a8`)

- **Real pages:** `/`, `/about`, `/listings`, `/listings/[id]`, `/login`,
  `/check-vendor` (unlinked), `/dev/ui`. Marketing layout
  (`app/(marketing)/layout.tsx`) wraps children in `<Navbar/>` + `<main
  className="pt-16">` + `<Footer/>`.
- **`about/page.tsx`** (153 lines): hero + story + values + team, **on legacy
  classes** (`bg-white`, `text-gray-*`, `bg-surface`, `shadow-card`,
  `font-700/800`, `bg-primary-light` — the last is already dead since Phase 0
  deleted `tailwind.config.ts`). Copy is "trust infrastructure / we sit between
  both parties / verifying vendors, holding funds in escrow / Buyer Money is
  Sacred". Team: **Rex Orokumue** (Founder & CEO), **Karen** (Operations —
  "vendor verification, dispute resolution"), **Precious** (Customer
  Relations). Uses `StatTile` (Phase 0, tokenised).
- **`lib/constants.ts`:** `NAV_LINKS = [{The Guarantee, /#the-guarantee},
  {Reviews, /#reviews}, {About, /about}]`; `SHOP_MENU` (7 entries). No FAQ /
  Contact / How-It-Works constants.
- **`components/layout/Footer.tsx`:** brand column + "Shop" (`SHOP_MENU`) +
  "Zolarux" (`NAV_LINKS` + Sign in) + guarantee bottom bar. On tokens.
- **`components/layout/Navbar.tsx`:** Shop `DropdownMenu`, `NAV_LINKS`,
  ThemeToggle, "Order on WhatsApp", mobile `Sheet`. On tokens.
- **Home** (`app/(marketing)/page.tsx`): the `#the-guarantee` section
  (`<GuaranteeSteps>` — 4 beats, `components/marketing/GuaranteeSteps.tsx`)
  **stays unchanged** — How It Works expands on it, it does not replace it.
- **Kit available:** `Accordion` (Radix, `AccordionItemData` = `{ value,
  trigger, content }`), `Card`/`CardBody`, `Field`/`Input`/`Textarea`,
  `Button`, `Reveal`, `Breadcrumbs`, `StatTile`, `Separator`, `Avatar`,
  `Badge`. `buildWhatsAppUrl(message, phone?)` and `WHATSAPP_NUMBER =
  '2347063107314'` in `lib/utils` / `lib/constants`.
- **`components/marketing/`** holds `HeroSequence.tsx`, `GuaranteeSteps.tsx`.
- No test runner. `AGENTS.md`: consult `node_modules/next/dist/docs/01-app/`
  before touching routing / `generateMetadata` / fonts.
- Compat shim in `globals.css` keeps `font-700/800` + `shadow-card(-hover)`
  "for the unlinked check-vendor + the not-yet-redesigned about page" — once
  About migrates here, re-grep and trim any entry that drops to zero use.

## 5. Approach

Four independent pages + one small shared "PageHeader" pattern for the
consistent hero band across the three new pages. Build About first (it's the
migration + the reusable pattern), then How It Works, FAQ, Contact, then the
Navbar/Footer/constants wiring. Static pages only — no Supabase — so every
task is fully verifiable locally.

## 6. About (`/about` — redesign)

**Voice: founder-first.** Rex is the narrator for the story; the rest of the
site keeps brand "we".

**Sections:**
1. **Hero** — `bg-primary` band. Eyebrow "Our story", headline (draft:
   *"I started Zolarux because I was tired of watching people get burned."*),
   one-paragraph lede in Rex's voice.
2. **The story** — 3–4 short first-person paragraphs: selling gadgets ~5 years,
   watching friends lose money to fake phones and vanishing "vendors" on
   WhatsApp/IG, deciding to be the seller people could actually trust —
   inspect everything, be honest about condition, stand behind every unit.
   Alongside: the real-facts stat block via `StatTile` (₦2M+ / 100+ / 5 yrs /
   0 scams — same numbers as Home, spec §14 of Phase 1).
3. **What we stand for** — 4 value cards, reframed off escrow:
   - *We inspect everything* — nothing ships that we haven't checked.
   - *We're honest about condition* — real photos, real notes, no "as good as new".
   - *We're easy to reach* — a person on WhatsApp, not a ticket queue.
   - *Guaranteed or refunded* — if it's not as described, you get your money back.
4. **The team** — keep Rex / Karen / Precious; bios reframed (Karen: sourcing &
   inspection; Precious: customer care). `Avatar` (initials) + name + role +
   short bio. *Names/bios are draft — user confirms.*

**Migration:** every element to tokens; delete `metadata.description`'s
"trust infrastructure" line.

## 7. How It Works (`/how-it-works` — new)

Expands the Home `#the-guarantee` section (which stays). Depth the Home teaser
doesn't have.

**Sections:**
1. **PageHeader** — "How buying from Zolarux works", one-line lede.
2. **The four steps** — render `<GuaranteeSteps>` unchanged (the same 4 beats
   as Home) as the spine. Sections 3–7 below are the added depth; do **not**
   build a `GuaranteeSteps` variant.
3. **What "inspected" means** — a checklist card: powers on & all functions,
   battery health %, IMEI / serial checked & clean, screen & body graded,
   accessories confirmed. *Draft — user tunes the list.*
4. **Condition grades** — a short table/definition list: **New**, **UK Used**,
   **Refurbished**, **Used** — one honest sentence each. (Matches
   `CONDITION_MAP` labels even though no catalogue rows carry a condition yet —
   spec §4 of Phase 1.)
5. **Ordering, delivery & payment** — plain paragraphs: message on WhatsApp →
   we confirm stock/price/condition → pay (bank transfer / the methods you
   actually take — *draft*) → we dispatch → ~1–5 business days, nationwide.
6. **The refund process** — step-by-step: inspect on delivery → if not as
   described, tell us within [window — *draft*] → return the unit → full
   refund of what you paid. Links to Contact.
7. **CTA band** — "Ready?" → `/listings`.

## 8. FAQ (`/faq` — new)

`Accordion` (Phase 0), grouped into 4 sections with a subheading each. ~10–12
Q&As total. **All answers are draft** — user corrects the specifics.

- **Ordering & payment** — How do I order? · How do I pay? · Can I pay on
  delivery? · Do I need an account?
- **Delivery** — Where do you deliver? · How long does delivery take? · How
  much is delivery?
- **Condition & warranty** — What do the condition grades mean? · Do phones
  come with a warranty? · Are the photos of the actual unit?
- **Refunds** — What if it's not as described? · How long do refunds take? ·
  Can I return it if I change my mind?

Each group renders as `<h2>` + an `<Accordion type="single">`. A short intro
line + a "Still stuck? Message us" link to `/contact` at the bottom.

## 9. Contact (`/contact` — new)

**No backend.** WhatsApp-first, plus a form that *submits to WhatsApp*.

**Sections:**
1. **PageHeader** — "Talk to a human", lede naming the response-time
   expectation (*draft — e.g. "usually within an hour, 9am–8pm"*).
2. **Primary CTA** — big "Message us on WhatsApp" button (`buildWhatsAppUrl`
   with a generic greeting).
3. **The form** — `"use client"`. Fields: **Name** (`Input`), **What's it
   about?** (`Select` — Order help / Product question / Refund / Something
   else), **Message** (`Textarea`). On submit: client-side validate, then
   `window.open(buildWhatsAppUrl(composed))` where `composed` is e.g.
   `"Hi Zolarux — {subject}\n\nFrom: {name}\n\n{message}"`. A brief inline
   note under the button: "This opens WhatsApp with your message ready to
   send." No success page needed (WhatsApp is the confirmation).
4. **Other ways** — email / socials **only if real** (user provides; omit
   otherwise), and a line pointing at `/faq` first.

**Component:** `components/marketing/ContactForm.tsx` (client). The page shell
is a server component.

## 10. Navbar / Footer / constants

- **`lib/constants.ts`:**
  - `NAV_LINKS`: change `{ label: 'The Guarantee', href: '/#the-guarantee' }`
    → `{ label: 'How it works', href: '/how-it-works' }`. Keep Reviews + About.
  - Add `HELP_LINKS = [{ How it works, /how-it-works }, { FAQ, /faq },
    { Contact, /contact }] as const`.
- **`Navbar.tsx`:** the nav already maps `NAV_LINKS`, so "How it works"
  updates automatically. No structural change. (Contact/FAQ stay
  footer-only to keep the top nav lean.)
- **`Footer.tsx`:** add a fourth column **"Help"** rendering `HELP_LINKS`.
  Grid goes `md:grid-cols-[1.4fr_1fr_1fr]` → `md:grid-cols-[1.4fr_repeat(3,1fr)]`
  (or a 2×2 on `sm`). Bottom bar unchanged.

## 11. Motion

Restrained — Phase 0 system only. `Reveal` on section entrances (once),
`hover-lift` on the value / team / step cards. **No cinematic sequence** (that
was Home-only). All new animation degrades to end-state under
`prefers-reduced-motion` (Phase 0 global guard).

## 12. Verification

Per Phase 1: `npx tsc --noEmit` clean, `npm run lint` 0 errors (pre-existing
`<img>` warnings tolerated), `npm run build` succeeds, route table gains
`/how-it-works`, `/faq`, `/contact` (all static — no Supabase). Content
verified via page-text extraction. Manual QA of each page + the updated
Navbar/Footer at 375 / 768 / 1280 in light and dark, `Accordion` keyboard
operation, the Contact form validation + WhatsApp-URL composition, reduced
motion. (Dark-mode/mobile eyeball remains a human step while the Chrome
screenshot tool is broken.)

## 13. Out of scope (recap)

Blog · legal pages · vendor pages · For Buyers standalone · Contact-form
backend · Phase 1 surface changes (beyond nav/footer links) · `(tools)` pages
· `check-vendor`.

## 14. Open items (content — provide during/after the build; placeholders ship until then)

- **About:** confirm Rex's founder story specifics; confirm team names/roles
  (Karen, Precious) and bios; confirm the headline.
- **How It Works:** the real "what inspected means" checklist; payment methods
  accepted; delivery timeframe & cost; the refund window (24h? 48h?) and
  whether the buyer pays return shipping.
- **FAQ:** every answer — especially coverage areas, delivery times/cost,
  warranty terms, refund timeframe.
- **Contact:** response-time / hours line; whether there's a real email or
  socials to list.
- **Track-record numbers** (₦2M+ / 100+ / 0 / 5 yrs) — still the Phase 1
  placeholders; confirm once.