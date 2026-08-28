# Flagship v2 — Phase 0 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-system foundation — evolved "Marketplace" identity tokens (light + dark), a CSS-first motion system, and a themed component library — that every later phase of the Zolarux redesign is built against, without changing any user-facing page.

**Architecture:** All theming flows through CSS custom properties. `app/globals.css` defines a primitive palette and a semantic token layer for light on `:root`, overridden for dark on `.dark`; Tailwind v4's `@theme inline` maps utilities to those live vars so `bg-surface` / `text-ink` auto-swap by theme. `next-themes` toggles the `.dark` class SSR-safely. Components live in `components/ui/`, are built on Radix primitives + `class-variance-authority`, consume only semantic tokens, and are exercised in an unlinked `/dev/ui` kitchen-sink route that serves as the test surface (the repo has no test runner).

**Tech Stack:** Next.js 16.2.6 (App Router), React 19.2, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI primitives, `class-variance-authority`, `clsx` + `tailwind-merge` (via `cn()`), `lucide-react`, `@fontsource` (Syne + DM Sans), `next-themes`, `sonner`.

**Spec:** `docs/superpowers/specs/2026-08-28-flagship-v2-phase-0-foundation-design.md` — read it before starting. The plan argues from the spec; both travel together.

## Global Constraints

- **Branch:** all work on `flagship-v2` (already created, off `flagship-redesign` tip). Do not touch `main` or `flagship-redesign`.
- **Next.js 16 is not the Next.js you know** (`AGENTS.md`). Before editing `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, or creating any route, read the matching file under `node_modules/next/dist/docs/01-app/` (e.g. `01-getting-started/11-css.md`, `13-fonts.md`, `03-api-reference/`). Heed deprecation notices.
- **No test runner exists.** "Verify" for every task = the Standard Verification Cycle below. Introducing Jest/Vitest/Playwright is explicitly out of scope.
- **No page redesigns in Phase 0.** The six existing pages (Home, About, Listings, Listing Detail, Check Vendor, Login) and the Navbar/Footer are not restyled here. They must keep compiling and rendering.
- **Identity roots are fixed:** blue `#4064D7` family, amber `#FFA600` family, Syne (display) + DM Sans (body). Evolve, do not replace.
- **Every component:** renders correctly in light AND dark with no per-theme prop; has a visible `:focus-visible` ring from `--color-ring` on interactive elements; is server-compatible unless interaction forces `"use client"`; consumes semantic tokens only (never a raw palette hex or a `.dark`-only declaration).
- **Commit style:** end every commit message body with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Conventional-commit prefixes (`feat:`, `refactor:`, `chore:`).
- **Path alias:** `@/` → repo root (e.g. `@/components/ui/Button`, `@/lib/utils`).

### Standard Verification Cycle

Run at the end of every task, in order. Any failure blocks the commit — fix, then rerun.

```bash
npx tsc --noEmit          # expected: no errors
npm run lint              # expected: clean (no new warnings)
npm run build             # expected: succeeds; note the printed route table
```

Then, for any task that adds or changes rendered UI:

```bash
npm run dev               # then open http://localhost:3000/dev/ui
```

Manual check (record result in the commit message or task notes):
- The new/changed section renders at **375px**, **768px**, **1280px** viewport widths.
- Toggle the page theme control: the section is legible and correct in **light** and **dark** (contrast holds, no invisible text, no theme-mismatched surfaces).
- Keyboard: `Tab` to each interactive element — focus ring is visible.
- If the task touches motion: set OS "reduce motion" and confirm animation is suppressed.

---

## File Structure

**Created:**
- `components/theme/ThemeProvider.tsx` — client wrapper around `next-themes` `ThemeProvider`.
- `components/ui/ThemeToggle.tsx` — three-way (light / system / dark) segmented control.
- `components/ui/Reveal.tsx` — IntersectionObserver scroll-reveal wrapper.
- `components/ui/Button.tsx`, `IconButton.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `FilterPill.tsx`, `Card.tsx`, `Dialog.tsx`, `Sheet.tsx`, `DropdownMenu.tsx`, `Tabs.tsx`, `Tooltip.tsx`, `Accordion.tsx`, `Toast.tsx`, `Skeleton.tsx`, `Avatar.tsx`, `Breadcrumbs.tsx`, `Pagination.tsx`, `Separator.tsx`.
- `components/ui/index.ts` — barrel export (appended to by each component task).
- `app/dev/layout.tsx` — minimal layout for the dev route (no marketing chrome).
- `app/dev/ui/page.tsx` — kitchen-sink page (appended to by each component task).

**Modified:**
- `app/globals.css` — token system, dark overrides, typography defaults, motion utilities, reduced-motion guard, legacy-utility compat layer.
- `app/layout.tsx` — `ThemeProvider`, `suppressHydrationWarning`, `<Toaster />`, body classes onto tokens.
- `lib/constants.ts` — `CONDITION_MAP` and `VENDOR_STATUS_MAP` rebuilt on semantic tokens.
- `components/ui/Badge.tsx`, `StatTile.tsx`, `ProductCard.tsx`, `Gallery.tsx`, `SpecsTable.tsx`, `FilterBar.tsx` — refit onto new tokens/components (behaviour unchanged).
- `app/sitemap.ts`, `app/robots.ts` — exclude `/dev`.
- `package.json` — new deps.

**Deleted:**
- `tailwind.config.ts` — its content is reproduced in `@theme` (see Task 1). *Spec note:* the spec says "retire `tailwind.config.ts`"; this plan additionally reproduces its legacy tokens (`primary`, `accent`, `shadow-card`, custom radii) inside `@theme` as a **compatibility layer** so the six un-migrated pages keep rendering. That compat layer is removed in Phase 1 as each page is migrated.

---

## Task 1: Design tokens & global stylesheet

**Files:**
- Modify: `app/globals.css` (full rewrite)
- Delete: `tailwind.config.ts`
- Modify: `package.json` (no new dep — `@fontsource/dm-sans` already installed; add the 600 import in CSS)

**Interfaces:**
- Consumes: nothing.
- Produces: the semantic token contract every later task depends on. Utility names (from `@theme inline`): colors `bg-background bg-surface bg-surface-raised text-ink text-ink-soft border-line bg-primary text-primary text-on-primary bg-primary-soft bg-action text-on-action text-verified text-refurb text-danger bg-section ring-ring`; radii `rounded-sm rounded-md rounded-lg rounded-pill`; shadows `shadow-sm shadow-md shadow-lg`; fonts `font-display font-body`; text sizes `text-xs … text-6xl`; eases `ease-out ease-spring`. Motion utility classes: `.transition-micro`, `.transition-lift`, `.animate-fade-up`, `.hover-lift`. Legacy compat (removed in Phase 1): `bg-primary` (already covered), `bg-accent`, `text-accent`, `shadow-card`, `shadow-card-hover`, `shadow-primary`, `rounded-3xl`, `rounded-4xl`, `.font-700` … `.font-800`.

- [ ] **Step 1: Read the Next.js CSS doc**

Read `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`. Confirm the Tailwind v4 setup is `@import 'tailwindcss';` in the global stylesheet imported from the root layout (it already is). Note the "check `next build` for final CSS order" warning.

- [ ] **Step 2: Replace `app/globals.css` with the token system**

```css
/* ============================================================
   Zolarux — global stylesheet & design tokens (Flagship v2)
   ============================================================ */

/* Self-hosted fonts */
@import '@fontsource/syne/400.css';
@import '@fontsource/syne/600.css';
@import '@fontsource/syne/700.css';
@import '@fontsource/syne/800.css';
@import '@fontsource/dm-sans/400.css';
@import '@fontsource/dm-sans/500.css';
@import '@fontsource/dm-sans/600.css';
@import '@fontsource/dm-sans/700.css';

@import 'tailwindcss';

/* Enable class-based dark mode (next-themes attribute="class") */
@custom-variant dark (&:where(.dark, .dark *));

/* ---------- Primitive palette (theme-independent) ---------- */
:root {
  --blue-50:  #EEF2FE;
  --blue-100: #DDE6FD;
  --blue-200: #BBcDFB;
  --blue-300: #93AEF7;
  --blue-400: #6E8BFF;
  --blue-500: #4064D7;
  --blue-600: #3E5FD0;
  --blue-700: #2E4FBF;
  --blue-800: #24408F;
  --blue-900: #1A2B6B;

  --amber-100: #FFF1D6;
  --amber-300: #FFD37A;
  --amber-500: #FFA600;
  --amber-700: #B77400;

  --green-500: #1F9D6B;
  --green-400: #2FCB90;
  --red-500:   #D64545;
  --red-400:   #F87171;
  --violet-500: #7C5CE0;
  --violet-400: #A98BFF;

  --warm-0:   #FFFFFF;
  --warm-50:  #FBFAF8;
  --warm-100: #F4F2ED;
  --warm-200: #ECE8E1;
  --cool-700: #2A2F39;
  --cool-800: #1F232B;
  --cool-850: #191C22;
  --cool-900: #101216;
  --cool-950: #0B0E14;
  --ink-900:  #191B21;
  --ink-500:  #5B616E;
  --ink-300:  #939AA6;
}

/* ---------- Semantic tokens — LIGHT ---------- */
:root {
  --background:       var(--warm-50);
  --surface:          var(--warm-0);
  --surface-raised:   var(--warm-0);
  --ink:              var(--ink-900);
  --ink-soft:         var(--ink-500);
  --line:             var(--warm-200);
  --primary:          var(--blue-600);
  --on-primary:       #FFFFFF;
  --primary-soft:     var(--blue-50);
  --action:           var(--amber-500);
  --on-action:        var(--ink-900);
  --verified:         var(--green-500);
  --refurb:           var(--violet-500);
  --danger:           var(--red-500);
  --section:          var(--blue-50);
  --ring:             var(--blue-600);

  --shadow-sm: 0 1px 2px -1px rgb(0 0 0 / .08), 0 1px 3px -1px rgb(0 0 0 / .06);
  --shadow-md: 0 6px 16px -8px rgb(24 26 33 / .16), 0 2px 6px -3px rgb(24 26 33 / .10);
  --shadow-lg: 0 12px 28px -14px rgb(24 26 33 / .28), 0 3px 8px -4px rgb(24 26 33 / .12);
}

/* ---------- Semantic tokens — DARK ---------- */
.dark {
  --background:     var(--cool-900);
  --surface:        var(--cool-850);
  --surface-raised: var(--cool-800);
  --ink:            #ECEDF1;
  --ink-soft:       var(--ink-300);
  --line:           var(--cool-700);
  --primary:        var(--blue-400);
  --on-primary:     var(--cool-950);
  --primary-soft:   #1D2740;
  --action:         #FFAE3D;
  --on-action:      var(--cool-900);
  --verified:       var(--green-400);
  --refurb:         var(--violet-400);
  --danger:         var(--red-400);
  --section:        #161B2B;
  --ring:           var(--blue-400);

  --shadow-sm: 0 1px 2px -1px rgb(0 0 0 / .5), 0 1px 3px -1px rgb(0 0 0 / .4);
  --shadow-md: 0 8px 20px -8px rgb(0 0 0 / .6), 0 3px 8px -4px rgb(0 0 0 / .45);
  --shadow-lg: 0 16px 34px -16px rgb(0 0 0 / .7), 0 4px 10px -5px rgb(0 0 0 / .5);
}

/* ---------- Tailwind theme mapping ---------- */
@theme inline {
  --color-background:     var(--background);
  --color-surface:        var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-ink:            var(--ink);
  --color-ink-soft:       var(--ink-soft);
  --color-line:           var(--line);
  --color-primary:        var(--primary);
  --color-on-primary:     var(--on-primary);
  --color-primary-soft:   var(--primary-soft);
  --color-action:         var(--action);
  --color-on-action:      var(--on-action);
  --color-verified:       var(--verified);
  --color-refurb:         var(--refurb);
  --color-danger:         var(--danger);
  --color-section:        var(--section);
  --color-ring:           var(--ring);

  /* legacy compat — removed in Phase 1 */
  --color-accent:         var(--amber-500);

  --font-display: 'Syne', system-ui, sans-serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  --radius-sm:   9px;
  --radius-md:   14px;
  --radius-lg:   20px;
  --radius-pill: 999px;

  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);

  --ease-out:    cubic-bezier(.2, 0, 0, 1);
  --ease-spring: cubic-bezier(.34, 1.28, .4, 1);

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.35rem;
  --text-2xl:  1.65rem;
  --text-3xl:  2.05rem;
  --text-4xl:  2.6rem;
  --text-5xl:  3.3rem;
  --text-6xl:  4.2rem;
}

/* ---------- Base ---------- */
@layer base {
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--background);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.018em;
    text-wrap: balance;
  }

  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}

/* ---------- Motion utilities ---------- */
@layer utilities {
  .font-display { font-family: var(--font-display); }
  .font-body    { font-family: var(--font-body); }

  .transition-micro { transition: color .16s var(--ease-out), background-color .16s var(--ease-out), border-color .16s var(--ease-out), box-shadow .16s var(--ease-out), opacity .16s var(--ease-out); }
  .transition-lift  { transition: transform .34s var(--ease-spring), box-shadow .34s var(--ease-spring); }

  .hover-lift:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

  .animate-fade-up { animation: fadeUp .5s var(--ease-out) forwards; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  [data-reveal] { opacity: 0; transform: translateY(16px); }
  [data-reveal][data-revealed='true'] { opacity: 1; transform: translateY(0); transition: opacity .5s var(--ease-out), transform .5s var(--ease-out); }

  .text-gradient {
    background: linear-gradient(135deg, var(--primary) 0%, var(--blue-400) 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  }
}

/* legacy weight utilities — removed in Phase 1 */
@utility font-300 { font-weight: 300; }
@utility font-400 { font-weight: 400; }
@utility font-500 { font-weight: 500; }
@utility font-600 { font-weight: 600; }
@utility font-700 { font-weight: 700; }
@utility font-800 { font-weight: 800; }

/* legacy shadow/radius compat — removed in Phase 1 */
@utility shadow-card       { box-shadow: var(--shadow-md); }
@utility shadow-card-hover { box-shadow: var(--shadow-lg); }
@utility shadow-primary    { box-shadow: 0 8px 32px rgb(64 100 215 / .25); }
@utility rounded-3xl       { border-radius: 1.5rem; }
@utility rounded-4xl       { border-radius: 2rem; }

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
}
```

- [ ] **Step 3: Delete `tailwind.config.ts` and remove the `@config` line**

The rewrite in Step 2 already omits `@config '../tailwind.config.ts'`. Delete the file:

```bash
git rm tailwind.config.ts
```

- [ ] **Step 4: Run the Standard Verification Cycle**

`npx tsc --noEmit` → clean. `npm run lint` → clean. `npm run build` → succeeds. In the route table, the existing routes are unchanged (`/`, `/about`, `/listings`, `/listings/[id]`, `/check-vendor`, `/login`).

- [ ] **Step 5: Smoke-check the existing pages**

`npm run dev`, then open `/`, `/about`, `/listings`, `/check-vendor`, `/login`. They should render without console errors. Colours may shift slightly (warm background, evolved blue) — that is expected and fine. Nothing should be unstyled or invisible. (No `.dark` class is applied yet — that arrives in Task 2.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(tokens): design-system token layer + retire tailwind.config

Primitive + semantic CSS-var tokens for light/dark, Tailwind v4 @theme
inline mapping, motion utilities, reduced-motion guard. Legacy utility
names kept as a compat layer for un-migrated pages (removed in Phase 1).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Dark mode — `next-themes` + root layout

**Files:**
- Modify: `package.json` (add `next-themes`)
- Create: `components/theme/ThemeProvider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `<ThemeProvider>` (default export-style named export) wrapping the app; the `.dark` class on `<html>` driven by `next-themes`; `useTheme()` from `next-themes` available to client components.

- [ ] **Step 1: Read the Next.js docs for layout + hydration**

Read `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` and skim `05-server-and-client-components.md`. Confirm: the root layout must render `<html>` and `<body>`; a client provider is composed by importing it into the server layout and wrapping `{children}`.

- [ ] **Step 2: Install `next-themes`**

```bash
npm install next-themes
```

Expected: adds `next-themes` to `dependencies`, no peer warnings that block (React 19 is supported).

- [ ] **Step 3: Create `components/theme/ThemeProvider.tsx`**

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 4: Wire it into `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export const metadata: Metadata = {
  // ... unchanged ...
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

Keep the existing `metadata` object exactly as-is. The only changes: `suppressHydrationWarning` on `<html>`, body classes `bg-white text-gray-900` → `bg-background text-ink`, and the `ThemeProvider` wrap.

- [ ] **Step 5: Run the Standard Verification Cycle**

`tsc`, `lint`, `build` all green. `npm run dev`, open `/`. In devtools console: **no hydration mismatch warning**. In the Elements panel, `<html>` gets `class="light"` or `class="dark"` matching your OS setting. Toggle your OS theme → the class flips and the page background swaps between warm-white and `#101216`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(theme): next-themes provider + class-based dark mode

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `ThemeToggle` + `/dev/ui` route + crawler exclusion

**Files:**
- Create: `components/ui/ThemeToggle.tsx`
- Create: `components/ui/index.ts`
- Create: `app/dev/layout.tsx`
- Create: `app/dev/ui/page.tsx`
- Modify: `app/sitemap.ts`, `app/robots.ts`

**Interfaces:**
- Consumes: `useTheme` from `next-themes` (Task 2).
- Produces: `ThemeToggle` (named export, no props); the `/dev/ui` page and its `DevSection` layout convention (each later task appends one `<section>` here); `components/ui/index.ts` barrel (each later task appends one line).

- [ ] **Step 1: Create `components/ui/ThemeToggle.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const active = mounted ? theme ?? 'system' : 'system'

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex rounded-pill border border-line bg-surface p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={active === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-pill transition-micro',
            active === value ? 'bg-primary text-on-primary' : 'text-ink-soft hover:text-ink'
          )}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the barrel `components/ui/index.ts`**

```ts
export { ThemeToggle } from './ThemeToggle'
```

- [ ] **Step 3: Create `app/dev/layout.tsx`**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dev — UI',
  robots: { index: false, follow: false },
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-ink">{children}</div>
}
```

- [ ] **Step 4: Create `app/dev/ui/page.tsx`**

```tsx
import { ThemeToggle } from '@/components/ui'

export default function DevUiPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.2em] text-ink-soft">Flagship v2 · Phase 0</p>
          <h1 className="mt-1 text-3xl">Component library</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="space-y-16">
        <section id="theme">
          <h2 className="mb-4 text-xl">Theme toggle</h2>
          <p className="text-ink-soft">Light / System / Dark. State persists across reloads via <code>next-themes</code>.</p>
          <div className="mt-4"><ThemeToggle /></div>
        </section>
        {/* LATER TASKS: append one <section> per component group here */}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Exclude `/dev` from `sitemap.ts` and `robots.ts`**

`app/robots.ts` — add `/dev/` to `disallow`:

```ts
disallow: ['/buyer/', '/vendor/', '/api/', '/dev/'],
```

`app/sitemap.ts` — no `/dev` entry exists, so no change is needed there. Add a one-line comment above the `staticPages` array so the intent is explicit:

```ts
  // NOTE: /dev/* is intentionally excluded from the sitemap (internal only).
  const staticPages = [
```

- [ ] **Step 6: Standard Verification Cycle**

Build succeeds; route table now shows `/dev/ui` (static). Open `/dev/ui`: the toggle switches theme, the whole page (bg, text, border) swaps, and the choice survives a reload. `curl localhost:3000/robots.txt` (or view source) shows `/dev/` disallowed. Check keyboard focus ring on the toggle buttons.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): ThemeToggle + /dev/ui kitchen-sink route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `Button` + `IconButton`

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/IconButton.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn` (`@/lib/utils`), `class-variance-authority`, `@radix-ui/react-slot` (installed).
- Produces:
  - `Button` — `React.forwardRef<HTMLButtonElement, ButtonProps>`; `ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean }`; `variant`: `'primary' | 'secondary' | 'ghost' | 'danger' | 'link'` (default `'primary'`); `size`: `'sm' | 'md' | 'lg'` (default `'md'`).
  - `buttonVariants` — the CVA function, exported for reuse (e.g. links styled as buttons).
  - `IconButton` — `React.forwardRef<HTMLButtonElement, IconButtonProps>`; `IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: 'sm' | 'md' | 'lg'; variant?: 'solid' | 'ghost' | 'outline' }`; renders `aria-label={label}`.

- [ ] **Step 1: Create `components/ui/Button.tsx`**

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-body font-600 whitespace-nowrap rounded-md transition-micro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:brightness-108 active:brightness-95',
        secondary: 'bg-surface text-ink border border-line hover:bg-primary-soft',
        ghost: 'bg-transparent text-ink hover:bg-primary-soft',
        danger: 'bg-danger text-white hover:brightness-108',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-7 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} aria-hidden />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
```

> Note: when `asChild` is true, do not also pass `loading` — Slot renders a single child.

- [ ] **Step 2: Create `components/ui/IconButton.tsx`**

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-micro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-primary text-on-primary hover:brightness-108',
        ghost: 'text-ink-soft hover:bg-primary-soft hover:text-ink',
        outline: 'border border-line text-ink hover:bg-primary-soft',
      },
      size: { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-13 w-13' },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  label: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, children, ...props }, ref) => (
    <button ref={ref} type="button" aria-label={label} className={cn(iconButtonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'
```

- [ ] **Step 3: Append to `components/ui/index.ts`**

```ts
export { Button, buttonVariants, type ButtonProps } from './Button'
export { IconButton, type IconButtonProps } from './IconButton'
```

- [ ] **Step 4: Add a `/dev/ui` section**

Insert before the `{/* LATER TASKS */}` comment in `app/dev/ui/page.tsx` (add imports at top: `import { Button, IconButton } from '@/components/ui'` and `import { Plus, Trash2 } from 'lucide-react'`):

```tsx
        <section id="buttons">
          <h2 className="mb-4 text-xl">Button</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <IconButton label="Add" variant="solid"><Plus size={16} /></IconButton>
            <IconButton label="Add" variant="outline"><Plus size={16} /></IconButton>
            <IconButton label="Delete" variant="ghost"><Trash2 size={16} /></IconButton>
          </div>
        </section>
```

- [ ] **Step 5: Standard Verification Cycle**

Verify every variant/size in light + dark at the three widths; `primary` on dark uses the lighter blue with dark text; focus rings visible; `loading` shows a spinner and blocks clicks; reduced-motion stops the spinner animation.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): Button + IconButton

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `Input` + `Textarea`

**Files:**
- Create: `components/ui/Input.tsx`, `components/ui/Textarea.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`.
- Produces:
  - `Field` — layout wrapper: `{ label?: string; hint?: string; error?: string; required?: boolean; htmlFor?: string; children: React.ReactNode }`. Exported from `Input.tsx`.
  - `Input` — `React.forwardRef<HTMLInputElement, InputProps>`; `InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }`.
  - `Textarea` — `React.forwardRef<HTMLTextAreaElement, TextareaProps>`; `TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }`.

- [ ] **Step 1: Create `components/ui/Input.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Field({
  label, hint, error, required, htmlFor, children,
}: {
  label?: string; hint?: string; error?: string; required?: boolean
  htmlFor?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="font-body text-sm font-600 text-ink">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-md border bg-surface px-3 font-body text-base text-ink placeholder:text-ink-soft transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-danger' : 'border-line',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 2: Create `components/ui/Textarea.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-24 w-full rounded-md border bg-surface px-3 py-2 font-body text-base text-ink placeholder:text-ink-soft transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-danger' : 'border-line',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
```

- [ ] **Step 3: Append to `components/ui/index.ts`**

```ts
export { Input, Field, type InputProps } from './Input'
export { Textarea, type TextareaProps } from './Textarea'
```

- [ ] **Step 4: Add a `/dev/ui` section** (import `{ Input, Field, Textarea }`)

```tsx
        <section id="inputs">
          <h2 className="mb-4 text-xl">Input &amp; Textarea</h2>
          <div className="grid gap-4 sm:max-w-sm">
            <Field label="Full name" htmlFor="f-name" hint="As it appears on your ID">
              <Input id="f-name" placeholder="Ada Obi" />
            </Field>
            <Field label="Email" htmlFor="f-email" required error="Enter a valid email address">
              <Input id="f-email" type="email" invalid defaultValue="not-an-email" />
            </Field>
            <Field label="Message" htmlFor="f-msg">
              <Textarea id="f-msg" placeholder="How can we help?" />
            </Field>
            <Field label="Disabled" htmlFor="f-dis">
              <Input id="f-dis" disabled defaultValue="Locked" />
            </Field>
          </div>
        </section>
```

- [ ] **Step 5: Standard Verification Cycle** — placeholder contrast in both themes, error state red border + red hint, focus ring, disabled styling.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): Input, Textarea, Field wrapper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: `Select` + `Checkbox` + `RadioGroup` (Radix)

**Files:**
- Modify: `package.json` (`@radix-ui/react-select`, `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`)
- Create: `components/ui/Select.tsx`, `components/ui/Checkbox.tsx`, `components/ui/RadioGroup.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, Radix Select/Checkbox/RadioGroup primitives, `lucide-react` (`Check`, `ChevronDown`).
- Produces:
  - `Select` — `{ value?: string; defaultValue?: string; onValueChange?: (v: string) => void; placeholder?: string; disabled?: boolean; invalid?: boolean; options: { value: string; label: string }[]; 'aria-label'?: string; className?: string }`. Client component.
  - `Checkbox` — `{ checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (c: boolean) => void; disabled?: boolean; id?: string; label?: string }`. Client component.
  - `RadioGroup` — `{ value?: string; defaultValue?: string; onValueChange?: (v: string) => void; options: { value: string; label: string }[]; name?: string; 'aria-label'?: string }`. Client component.

- [ ] **Step 1: Install**

```bash
npm install @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group
```

- [ ] **Step 2: Create `components/ui/Select.tsx`**

```tsx
'use client'

import * as RSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  options: { value: string; label: string }[]
  'aria-label'?: string
  className?: string
}

export function Select({
  value, defaultValue, onValueChange, placeholder = 'Select…',
  disabled, invalid, options, className, ...aria
}: SelectProps) {
  return (
    <RSelect.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        aria-label={aria['aria-label']}
        aria-invalid={invalid || undefined}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 font-body text-base text-ink transition-micro',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[placeholder]:text-ink-soft',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-danger' : 'border-line',
          className
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon><ChevronDown size={16} className="text-ink-soft" /></RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface-raised shadow-lg"
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className="relative flex h-9 cursor-pointer select-none items-center rounded-sm pl-8 pr-3 font-body text-sm text-ink outline-none data-[highlighted]:bg-primary-soft data-[state=checked]:font-600"
              >
                <RSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check size={14} className="text-primary" />
                </RSelect.ItemIndicator>
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
```

- [ ] **Step 3: Create `components/ui/Checkbox.tsx`**

```tsx
'use client'

import * as RCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function Checkbox({ checked, defaultChecked, onCheckedChange, disabled, id, label }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2 font-body text-sm text-ink', disabled && 'opacity-50')}>
      <RCheckbox.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(c) => onCheckedChange?.(c === true)}
        disabled={disabled}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line bg-surface transition-micro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      >
        <RCheckbox.Indicator><Check size={13} className="text-on-primary" /></RCheckbox.Indicator>
      </RCheckbox.Root>
      {label}
    </label>
  )
}
```

- [ ] **Step 4: Create `components/ui/RadioGroup.tsx`**

```tsx
'use client'

import * as RRadio from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

export interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options: { value: string; label: string }[]
  name?: string
  'aria-label'?: string
}

export function RadioGroup({ value, defaultValue, onValueChange, options, name, ...aria }: RadioGroupProps) {
  return (
    <RRadio.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      aria-label={aria['aria-label']}
      className="flex flex-col gap-2"
    >
      {options.map((o) => (
        <label key={o.value} className="inline-flex items-center gap-2 font-body text-sm text-ink">
          <RRadio.Item
            value={o.value}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-pill border border-line bg-surface transition-micro',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-primary'
            )}
          >
            <RRadio.Indicator className="h-2.5 w-2.5 rounded-pill bg-primary" />
          </RRadio.Item>
          {o.label}
        </label>
      ))}
    </RRadio.Root>
  )
}
```

- [ ] **Step 5: Append to `components/ui/index.ts`**

```ts
export { Select, type SelectProps } from './Select'
export { Checkbox, type CheckboxProps } from './Checkbox'
export { RadioGroup, type RadioGroupProps } from './RadioGroup'
```

- [ ] **Step 6: Add a `/dev/ui` section** (import `{ Select, Checkbox, RadioGroup, Field }`)

```tsx
        <section id="select-choice">
          <h2 className="mb-4 text-xl">Select, Checkbox, RadioGroup</h2>
          <div className="grid gap-6 sm:max-w-sm">
            <Field label="Condition" htmlFor="d-cond">
              <Select
                aria-label="Condition"
                placeholder="Any condition"
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'uk_used', label: 'UK Used' },
                  { value: 'refurbished', label: 'Refurbished' },
                  { value: 'used', label: 'Used' },
                ]}
              />
            </Field>
            <div className="flex flex-col gap-2">
              <Checkbox id="d-c1" label="Only verified vendors" defaultChecked />
              <Checkbox id="d-c2" label="In stock" />
              <Checkbox id="d-c3" label="Disabled" disabled />
            </div>
            <RadioGroup
              aria-label="Sort"
              defaultValue="featured"
              options={[
                { value: 'featured', label: 'Featured' },
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: low to high' },
              ]}
            />
          </div>
        </section>
```

- [ ] **Step 7: Standard Verification Cycle** — open the Select (portal content on `surface-raised`, highlighted item on `primary-soft`, check icon), toggle checkboxes/radios, keyboard-operate each (arrow keys in Select and RadioGroup), both themes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ui): Select, Checkbox, RadioGroup on Radix

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: `Badge` (refit) + `FilterPill`

**Files:**
- Modify: `lib/constants.ts` (`CONDITION_MAP`, `VENDOR_STATUS_MAP`)
- Rewrite: `components/ui/Badge.tsx`
- Create: `components/ui/FilterPill.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, `ProductCondition` (`@/types/product`), `lucide-react`.
- Produces:
  - `CONDITION_MAP: Record<ProductCondition, { label: string; className: string }>` — `className` is a token-based tint (e.g. `'text-verified bg-verified/12 border-verified/25'`). **API change:** `.color/.bg/.border` fields are removed; consumers updated in Task 14.
  - `VENDOR_STATUS_MAP` — each entry keeps `label` and `safe`, replaces `color/bg/border/headerBg` with `className: string` and `headerToken: string` (a CSS var name string like `'var(--verified)'`).
  - `Badge` — discriminated union unchanged in spirit: `{ variant: 'verified' } | { variant: 'featured' } | { variant: 'condition'; condition: ProductCondition } | { variant: 'neutral'; children: React.ReactNode }`.
  - `FilterPill` — `{ active?: boolean; onClick?: () => void; children: React.ReactNode; className?: string }`; renders a `<button type="button">`.

- [ ] **Step 1: Rebuild the maps in `lib/constants.ts`**

Replace the existing `CONDITION_MAP` and `VENDOR_STATUS_MAP` blocks:

```ts
export const CONDITION_MAP: Record<ProductCondition, { label: string; className: string }> = {
  new:         { label: 'New',         className: 'text-verified bg-verified/12 border-verified/30' },
  uk_used:     { label: 'UK Used',     className: 'text-primary bg-primary/12 border-primary/30' },
  refurbished: { label: 'Refurbished', className: 'text-refurb bg-refurb/12 border-refurb/30' },
  used:        { label: 'Used',        className: 'text-ink-soft bg-ink-soft/12 border-ink-soft/30' },
}

export const VENDOR_STATUS_MAP = {
  verified:  { label: 'Verified Vendor',        safe: true,  className: 'text-verified bg-verified/12 border-verified/30', headerToken: 'var(--verified)' },
  pending:   { label: 'Pending Verification',   safe: false, className: 'text-action bg-action/14 border-action/35',      headerToken: 'var(--action)' },
  suspended: { label: 'Vendor Suspended',       safe: false, className: 'text-danger bg-danger/12 border-danger/30',       headerToken: 'var(--danger)' },
  rejected:  { label: 'Registration Rejected',  safe: false, className: 'text-danger bg-danger/12 border-danger/30',       headerToken: 'var(--danger)' },
} as const
```

> `bg-verified/12` etc. rely on Tailwind v4's slash-opacity working on `@theme` colors — it does, because the tokens are real colors via `color-mix`. Confirm in the build.

- [ ] **Step 2: Rewrite `components/ui/Badge.tsx`**

```tsx
import * as React from 'react'
import { Shield, Sparkles } from 'lucide-react'
import { CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProductCondition } from '@/types/product'

type BadgeProps =
  | { variant: 'verified' }
  | { variant: 'featured' }
  | { variant: 'condition'; condition: ProductCondition }
  | { variant: 'neutral'; children: React.ReactNode }

const base = 'inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 font-body text-xs font-600'

export function Badge(props: BadgeProps) {
  if (props.variant === 'verified') {
    return <span className={cn(base, 'border-verified/30 bg-verified/12 text-verified')}><Shield size={11} />Verified</span>
  }
  if (props.variant === 'featured') {
    return <span className={cn(base, 'border-transparent bg-action text-on-action')}><Sparkles size={11} />Featured</span>
  }
  if (props.variant === 'condition') {
    const c = CONDITION_MAP[props.condition]
    return <span className={cn(base, c.className)}>{c.label}</span>
  }
  return <span className={cn(base, 'border-line bg-surface text-ink-soft')}>{props.children}</span>
}
```

- [ ] **Step 3: Create `components/ui/FilterPill.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FilterPillProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function FilterPill({ active, onClick, children, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center rounded-pill border px-3.5 py-1.5 font-body text-sm font-500 transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-line bg-surface text-ink-soft hover:border-primary/40 hover:text-ink',
        className
      )}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Append to `components/ui/index.ts`**

```ts
export { Badge } from './Badge'
export { FilterPill, type FilterPillProps } from './FilterPill'
```

- [ ] **Step 5: `/dev/ui` section** (import `{ Badge, FilterPill }`; `useState` is not allowed in this server page — render pills static with alternating `active`)

```tsx
        <section id="badges">
          <h2 className="mb-4 text-xl">Badge &amp; FilterPill</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="verified" />
            <Badge variant="featured" />
            <Badge variant="condition" condition="new" />
            <Badge variant="condition" condition="uk_used" />
            <Badge variant="condition" condition="refurbished" />
            <Badge variant="condition" condition="used" />
            <Badge variant="neutral">In stock</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FilterPill active>All</FilterPill>
            <FilterPill>Phones</FilterPill>
            <FilterPill>Laptops</FilterPill>
            <FilterPill>Under ₦500k</FilterPill>
          </div>
        </section>
```

- [ ] **Step 6: Standard Verification Cycle** — plus `npx tsc --noEmit` will now flag the old `CONDITION_MAP.bg` usages in `ProductCard.tsx` / `FilterBar.tsx` **only if** they were already type-erroring; they reference `.bg`/`.color`/`.border` which no longer exist, so **tsc will fail here**. That is expected — Task 14 fixes the consumers. To keep this task independently green, apply the minimal consumer patch now:
  - `components/ui/FilterBar.tsx` line ~56: replace `` `${CONDITION_MAP[condition].bg} ${CONDITION_MAP[condition].color} ${CONDITION_MAP[condition].border}` `` with `CONDITION_MAP[condition].className`.
  - `components/ui/ProductCard.tsx`: it uses `<Badge variant="condition" …>` only, no direct map access — no change needed.
  - Re-run `npx tsc --noEmit` → clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): token-based Badge + FilterPill, rebuild condition/vendor maps

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: `Card`

**Files:**
- Create: `components/ui/Card.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, `class-variance-authority`.
- Produces: `Card` — `React.forwardRef<HTMLDivElement, CardProps>`; `CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & { asChild?: boolean }`; `variant`: `'flat' | 'raised'` (default `'raised'`); `interactive?: boolean` (adds `hover-lift` + `transition-lift`). Also `CardBody`, `CardHeader`, `CardFooter` — thin padded `<div>` wrappers.

- [ ] **Step 1: Create `components/ui/Card.tsx`**

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-md border border-line bg-surface text-ink', {
  variants: {
    variant: { flat: '', raised: 'shadow-md' },
  },
  defaultVariants: { variant: 'raised' },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  interactive?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant }), interactive && 'transition-lift hover-lift', className)}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pb-0', className)} {...p} />
)
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...p} />
)
export const CardFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pt-0', className)} {...p} />
)
```

- [ ] **Step 2: Append to `components/ui/index.ts`**

```ts
export { Card, CardHeader, CardBody, CardFooter, type CardProps } from './Card'
```

- [ ] **Step 3: `/dev/ui` section** (import `{ Card, CardBody }`)

```tsx
        <section id="card">
          <h2 className="mb-4 text-xl">Card</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="flat"><CardBody><p className="font-600">Flat</p><p className="text-sm text-ink-soft">No shadow, border only.</p></CardBody></Card>
            <Card><CardBody><p className="font-600">Raised</p><p className="text-sm text-ink-soft">Default md shadow.</p></CardBody></Card>
            <Card interactive><CardBody><p className="font-600">Interactive</p><p className="text-sm text-ink-soft">Hover to lift.</p></CardBody></Card>
          </div>
        </section>
```

- [ ] **Step 4: Standard Verification Cycle** — shadow visible on light, deeper/darker on dark; hover-lift smooth; reduced-motion removes the lift transition.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ui): Card

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: `Dialog` + `Sheet`

**Files:**
- Create: `components/ui/Dialog.tsx`, `components/ui/Sheet.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, `@radix-ui/react-dialog` (installed), `lucide-react` (`X`).
- Produces:
  - `Dialog` — re-exports Radix `Root`, `Trigger`, `Close` as `Dialog`, `DialogTrigger`, `DialogClose`; plus `DialogContent` (`{ title: string; description?: string; children; className? }` — renders overlay + centered panel + close button; `title` wired to `aria-labelledby`).
  - `Sheet` — same Root/Trigger/Close re-export as `Sheet`, `SheetTrigger`, `SheetClose`; plus `SheetContent` (`{ side?: 'bottom' | 'right'; title: string; description?: string; children; className? }`).
  - Both are `"use client"`.

- [ ] **Step 1: Create `components/ui/Dialog.tsx`**

```tsx
'use client'

import * as React from 'react'
import * as RDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = RDialog.Root
export const DialogTrigger = RDialog.Trigger
export const DialogClose = RDialog.Close

export function DialogContent({
  title, description, children, className,
}: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-up" />
      <RDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-line bg-surface-raised p-6 shadow-lg focus:outline-none',
          className
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <RDialog.Title className="font-display text-xl">{title}</RDialog.Title>
          <RDialog.Close className="rounded-sm text-ink-soft transition-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Close">
            <X size={18} />
          </RDialog.Close>
        </div>
        {description && <RDialog.Description className="mb-4 text-sm text-ink-soft">{description}</RDialog.Description>}
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  )
}
```

- [ ] **Step 2: Create `components/ui/Sheet.tsx`**

```tsx
'use client'

import * as React from 'react'
import * as RDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = RDialog.Root
export const SheetTrigger = RDialog.Trigger
export const SheetClose = RDialog.Close

export function SheetContent({
  side = 'bottom', title, description, children, className,
}: {
  side?: 'bottom' | 'right'
  title: string; description?: string; children: React.ReactNode; className?: string
}) {
  const sideClasses =
    side === 'right'
      ? 'inset-y-0 right-0 h-full w-[min(24rem,90vw)] rounded-l-lg border-l'
      : 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-lg border-t'
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <RDialog.Content
        className={cn('fixed z-50 overflow-y-auto border-line bg-surface-raised p-5 shadow-lg focus:outline-none', sideClasses, className)}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <RDialog.Title className="font-display text-lg">{title}</RDialog.Title>
          <RDialog.Close className="rounded-sm text-ink-soft transition-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Close">
            <X size={18} />
          </RDialog.Close>
        </div>
        {description && <RDialog.Description className="mb-4 text-sm text-ink-soft">{description}</RDialog.Description>}
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  )
}
```

- [ ] **Step 3: Append to `components/ui/index.ts`**

```ts
export { Dialog, DialogTrigger, DialogClose, DialogContent } from './Dialog'
export { Sheet, SheetTrigger, SheetClose, SheetContent } from './Sheet'
```

- [ ] **Step 4: `/dev/ui` section** (import `{ Dialog, DialogTrigger, DialogContent, Sheet, SheetTrigger, SheetContent, Button }`)

```tsx
        <section id="overlays">
          <h2 className="mb-4 text-xl">Dialog &amp; Sheet</h2>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
              <DialogContent title="Confirm payout" description="Release the protection fee to the vendor?">
                <p className="text-sm text-ink-soft">This continues the deal on WhatsApp.</p>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild><Button variant="secondary">Open sheet (bottom)</Button></SheetTrigger>
              <SheetContent side="bottom" title="Filters">
                <p className="text-sm text-ink-soft">Filter controls would go here.</p>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="secondary">Open sheet (right)</Button></SheetTrigger>
              <SheetContent side="right" title="Menu">
                <p className="text-sm text-ink-soft">Nav links would go here.</p>
              </SheetContent>
            </Sheet>
          </div>
        </section>
```

- [ ] **Step 5: Standard Verification Cycle** — overlay dims the page, panel on `surface-raised`, `Esc` and outside-click close, focus is trapped and returns to the trigger, both themes, mobile width.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): Dialog + Sheet on Radix Dialog

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: `DropdownMenu`

**Files:**
- Create: `components/ui/DropdownMenu.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, `@radix-ui/react-dropdown-menu` (installed).
- Produces: `DropdownMenu`, `DropdownMenuTrigger` (Radix Root/Trigger re-exports); `DropdownMenuContent` (`{ children; align?: 'start' | 'end'; className? }`); `DropdownMenuItem` (`{ children; onSelect?: () => void; disabled?: boolean; destructive?: boolean }`); `DropdownMenuSeparator`, `DropdownMenuLabel`. `"use client"`.

- [ ] **Step 1: Create `components/ui/DropdownMenu.tsx`**

```tsx
'use client'

import * as React from 'react'
import * as RMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = RMenu.Root
export const DropdownMenuTrigger = RMenu.Trigger

export function DropdownMenuContent({
  children, align = 'start', className,
}: { children: React.ReactNode; align?: 'start' | 'end'; className?: string }) {
  return (
    <RMenu.Portal>
      <RMenu.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-44 overflow-hidden rounded-md border border-line bg-surface-raised p-1 shadow-lg',
          className
        )}
      >
        {children}
      </RMenu.Content>
    </RMenu.Portal>
  )
}

export function DropdownMenuItem({
  children, onSelect, disabled, destructive,
}: { children: React.ReactNode; onSelect?: () => void; disabled?: boolean; destructive?: boolean }) {
  return (
    <RMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex h-9 cursor-pointer select-none items-center rounded-sm px-3 font-body text-sm outline-none transition-micro',
        'data-[highlighted]:bg-primary-soft data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive ? 'text-danger' : 'text-ink'
      )}
    >
      {children}
    </RMenu.Item>
  )
}

export const DropdownMenuSeparator = () => <RMenu.Separator className="my-1 h-px bg-line" />
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <RMenu.Label className="px-3 py-1.5 font-body text-xs uppercase tracking-wide text-ink-soft">{children}</RMenu.Label>
)
```

- [ ] **Step 2: Append to `components/ui/index.ts`**

```ts
export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from './DropdownMenu'
```

- [ ] **Step 3: `/dev/ui` section** (import the menu parts + `Button`)

```tsx
        <section id="dropdown">
          <h2 className="mb-4 text-xl">DropdownMenu</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="secondary">Safety tools</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Verify</DropdownMenuLabel>
              <DropdownMenuItem>Check vendor</DropdownMenuItem>
              <DropdownMenuItem>Check device</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>Report stolen</DropdownMenuItem>
              <DropdownMenuItem disabled>Coming soon</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
```

- [ ] **Step 4: Standard Verification Cycle** — opens on click and keyboard, arrow-key navigation, highlight uses `primary-soft`, closes on `Esc`/outside/select, both themes.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ui): DropdownMenu

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: `Tabs` + `Tooltip` + `Accordion`

**Files:**
- Modify: `package.json` (`@radix-ui/react-tabs`, `@radix-ui/react-tooltip`, `@radix-ui/react-accordion`)
- Create: `components/ui/Tabs.tsx`, `components/ui/Tooltip.tsx`, `components/ui/Accordion.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, the three Radix packages, `lucide-react` (`ChevronDown`).
- Produces:
  - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — Radix re-exports with styling; `Tabs` takes `defaultValue`.
  - `Tooltip` — `{ content: React.ReactNode; children: React.ReactElement; side?: 'top'|'right'|'bottom'|'left' }`; includes its own `Provider`. `"use client"`.
  - `Accordion` — `{ items: { value: string; trigger: React.ReactNode; content: React.ReactNode }[]; type?: 'single' | 'multiple'; defaultValue?: string }`. `"use client"`.

- [ ] **Step 1: Install**

```bash
npm install @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-accordion
```

- [ ] **Step 2: Create `components/ui/Tabs.tsx`**

```tsx
'use client'

import * as RTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = RTabs.Root

export function TabsList({ className, ...p }: React.ComponentProps<typeof RTabs.List>) {
  return <RTabs.List className={cn('inline-flex items-center gap-1 rounded-md border border-line bg-surface p-1', className)} {...p} />
}

export function TabsTrigger({ className, ...p }: React.ComponentProps<typeof RTabs.Trigger>) {
  return (
    <RTabs.Trigger
      className={cn(
        'inline-flex h-9 items-center rounded-sm px-3 font-body text-sm font-500 text-ink-soft transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-[state=active]:bg-primary data-[state=active]:text-on-primary',
        className
      )}
      {...p}
    />
  )
}

export function TabsContent({ className, ...p }: React.ComponentProps<typeof RTabs.Content>) {
  return <RTabs.Content className={cn('mt-4 focus-visible:outline-none', className)} {...p} />
}
```

- [ ] **Step 3: Create `components/ui/Tooltip.tsx`**

```tsx
'use client'

import * as React from 'react'
import * as RTooltip from '@radix-ui/react-tooltip'

export function Tooltip({
  content, children, side = 'top',
}: { content: React.ReactNode; children: React.ReactElement; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <RTooltip.Provider delayDuration={200}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            side={side}
            sideOffset={6}
            className="z-50 rounded-sm bg-ink px-2.5 py-1.5 font-body text-xs text-background shadow-md"
          >
            {content}
            <RTooltip.Arrow className="fill-ink" />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  )
}
```

- [ ] **Step 4: Create `components/ui/Accordion.tsx`**

```tsx
'use client'

import * as React from 'react'
import * as RAccordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AccordionItemData {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
}

export function Accordion({
  items, type = 'single', defaultValue,
}: { items: AccordionItemData[]; type?: 'single' | 'multiple'; defaultValue?: string }) {
  const common = { className: 'divide-y divide-line rounded-md border border-line' }
  const inner = items.map((it) => (
    <RAccordion.Item key={it.value} value={it.value} className="px-4">
      <RAccordion.Header>
        <RAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left font-body font-600 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {it.trigger}
          <ChevronDown size={16} className="shrink-0 text-ink-soft transition-transform group-data-[state=open]:rotate-180" />
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className="overflow-hidden pb-4 text-sm text-ink-soft">
        {it.content}
      </RAccordion.Content>
    </RAccordion.Item>
  ))
  return type === 'single' ? (
    <RAccordion.Root type="single" collapsible defaultValue={defaultValue} {...common}>{inner}</RAccordion.Root>
  ) : (
    <RAccordion.Root type="multiple" {...common}>{inner}</RAccordion.Root>
  )
}
```

- [ ] **Step 5: Append to `components/ui/index.ts`**

```ts
export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'
export { Tooltip } from './Tooltip'
export { Accordion, type AccordionItemData } from './Accordion'
```

- [ ] **Step 6: `/dev/ui` section** (import `{ Tabs, TabsList, TabsTrigger, TabsContent, Tooltip, Accordion, Button }`)

```tsx
        <section id="tabs-tooltip-accordion">
          <h2 className="mb-4 text-xl">Tabs, Tooltip, Accordion</h2>
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
            </TabsList>
            <TabsContent value="specs"><p className="text-sm text-ink-soft">Spec rows…</p></TabsContent>
            <TabsContent value="delivery"><p className="text-sm text-ink-soft">Delivery info…</p></TabsContent>
            <TabsContent value="vendor"><p className="text-sm text-ink-soft">Vendor profile…</p></TabsContent>
          </Tabs>

          <div className="mt-6">
            <Tooltip content="Held in escrow until you confirm the device">
              <Button variant="ghost">Hover for protection info</Button>
            </Tooltip>
          </div>

          <div className="mt-6 max-w-lg">
            <Accordion
              defaultValue="a"
              items={[
                { value: 'a', trigger: 'How does the protection fee work?', content: 'We hold funds until you confirm the device in hand.' },
                { value: 'b', trigger: 'Where does the deal happen?', content: 'On WhatsApp, with the verified vendor.' },
              ]}
            />
          </div>
        </section>
```

- [ ] **Step 7: Standard Verification Cycle** — tab keyboard nav + active pill; tooltip appears on hover and focus, arrow matches; accordion expand/collapse, chevron rotates, reduced-motion drops the rotation transition; both themes.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(ui): Tabs, Tooltip, Accordion on Radix

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: `Toast` (sonner)

**Files:**
- Modify: `package.json` (`sonner`)
- Create: `components/ui/Toast.tsx`
- Modify: `app/layout.tsx`, `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `sonner`, `next-themes` `useTheme`.
- Produces: `Toaster` — themed `<Toaster />` wrapper, mounted once in the root layout. `toast` — re-export of sonner's `toast` function for imperative calls.

- [ ] **Step 1: Install**

```bash
npm install sonner
```

- [ ] **Step 2: Create `components/ui/Toast.tsx`**

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster, toast } from 'sonner'

export { toast }

export function Toaster() {
  const { resolvedTheme } = useTheme()
  return (
    <SonnerToaster
      theme={(resolvedTheme as 'light' | 'dark') ?? 'system'}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-md border border-line bg-surface-raised text-ink shadow-lg font-body',
          description: 'text-ink-soft',
          actionButton: 'bg-primary text-on-primary rounded-sm',
        },
      }}
    />
  )
}
```

- [ ] **Step 3: Mount in `app/layout.tsx`**

Import `import { Toaster } from '@/components/ui/Toast'` and render it inside `<ThemeProvider>`, after `{children}`:

```tsx
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
```

- [ ] **Step 4: Append to `components/ui/index.ts`**

```ts
export { Toaster, toast } from './Toast'
```

- [ ] **Step 5: `/dev/ui` section** — needs a client island. Create `app/dev/ui/ToastDemo.tsx`:

```tsx
'use client'
import { Button, toast } from '@/components/ui'

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast('Listing saved')}>Default</Button>
      <Button variant="secondary" onClick={() => toast.success('Vendor verified')}>Success</Button>
      <Button variant="secondary" onClick={() => toast.error('Could not reach vendor')}>Error</Button>
      <Button variant="secondary" onClick={() => toast('Payout released', { description: 'The deal continues on WhatsApp.' })}>With description</Button>
    </div>
  )
}
```

Then in `app/dev/ui/page.tsx` (import `{ ToastDemo } from './ToastDemo'`):

```tsx
        <section id="toast">
          <h2 className="mb-4 text-xl">Toast</h2>
          <ToastDemo />
        </section>
```

- [ ] **Step 6: Standard Verification Cycle** — toasts appear bottom-right on `surface-raised`, auto-dismiss, stack, swipe-dismiss; theme matches the page toggle (flip theme, fire a toast, confirm colours); both themes.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(ui): themed sonner Toaster

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 13: `Skeleton` + `Avatar` + `Separator` + `Breadcrumbs` + `Pagination`

**Files:**
- Create: `components/ui/Skeleton.tsx`, `Avatar.tsx`, `Separator.tsx`, `Breadcrumbs.tsx`, `Pagination.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: `cn`, `@radix-ui/react-separator` (installed), `next/link`, `lucide-react` (`ChevronRight`, `ChevronLeft`).
- Produces:
  - `Skeleton` — `{ className?: string }` → pulsing block.
  - `Avatar` — `{ src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }` → image or initials.
  - `Separator` — `{ orientation?: 'horizontal' | 'vertical'; className?: string }`.
  - `Breadcrumbs` — `{ items: { label: string; href?: string }[] }` (last item = current page, no link).
  - `Pagination` — `{ page: number; totalPages: number; hrefFor: (page: number) => string }` (server-friendly; renders `<Link>`s).

- [ ] **Step 1: Create `components/ui/Skeleton.tsx`**

```tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-ink-soft/15', className)} />
}
```

- [ ] **Step 2: Create `components/ui/Avatar.tsx`**

```tsx
import { cn } from '@/lib/utils'

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function Avatar({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-primary-soft font-body font-600 text-primary', sizes[size])}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials(name)}
    </span>
  )
}
```

- [ ] **Step 3: Create `components/ui/Separator.tsx`**

```tsx
import * as RSeparator from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

export function Separator({
  orientation = 'horizontal', className,
}: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return (
    <RSeparator.Root
      orientation={orientation}
      decorative
      className={cn('bg-line', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    />
  )
}
```

- [ ] **Step 4: Create `components/ui/Breadcrumbs.tsx`**

```tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-body text-sm text-ink-soft">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.label} className="inline-flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="transition-micro hover:text-ink">{item.label}</Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink' : undefined}>{item.label}</span>
              )}
              {!last && <ChevronRight size={14} aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 5: Create `components/ui/Pagination.tsx`**

```tsx
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({
  page, totalPages, hrefFor,
}: { page: number; totalPages: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  const cell = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-body text-sm transition-micro'
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <Link href={hrefFor(Math.max(1, page - 1))} aria-label="Previous page"
        className={cn(cell, 'border-line text-ink-soft hover:text-ink', page === 1 && 'pointer-events-none opacity-40')}>
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          {idx > 0 && p - pages[idx - 1] > 1 && <span className="px-1 text-ink-soft">…</span>}
          <Link href={hrefFor(p)} aria-current={p === page ? 'page' : undefined}
            className={cn(cell, p === page ? 'border-primary bg-primary text-on-primary' : 'border-line text-ink-soft hover:text-ink')}>
            {p}
          </Link>
        </span>
      ))}
      <Link href={hrefFor(Math.min(totalPages, page + 1))} aria-label="Next page"
        className={cn(cell, 'border-line text-ink-soft hover:text-ink', page === totalPages && 'pointer-events-none opacity-40')}>
        <ChevronRight size={16} />
      </Link>
    </nav>
  )
}
```

- [ ] **Step 6: Append to `components/ui/index.ts`**

```ts
export { Skeleton } from './Skeleton'
export { Avatar } from './Avatar'
export { Separator } from './Separator'
export { Breadcrumbs } from './Breadcrumbs'
export { Pagination } from './Pagination'
```

- [ ] **Step 7: `/dev/ui` section** (import the five)

```tsx
        <section id="misc">
          <h2 className="mb-4 text-xl">Skeleton, Avatar, Separator, Breadcrumbs, Pagination</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-pill" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name="TechHub Lagos" size="sm" />
              <Avatar name="GadgetPlug NG" size="md" />
              <Avatar name="Naija Devices" size="lg" />
            </div>
            <Separator />
            <Breadcrumbs items={[{ label: 'Listings', href: '/listings' }, { label: 'Phones', href: '/listings?category=Phones' }, { label: 'iPhone 13 Pro' }]} />
            <Pagination page={3} totalPages={8} hrefFor={(p) => `/dev/ui?page=${p}`} />
          </div>
        </section>
```

- [ ] **Step 8: Standard Verification Cycle** — skeleton pulse honors reduced-motion; avatar initials + image; breadcrumb current page not a link; pagination current page filled, prev/next disable at ends; both themes.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(ui): Skeleton, Avatar, Separator, Breadcrumbs, Pagination

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 14: `Reveal` (scroll-reveal motion)

**Files:**
- Create: `components/ui/Reveal.tsx`
- Modify: `components/ui/index.ts`, `app/dev/ui/page.tsx`

**Interfaces:**
- Consumes: the `[data-reveal]` / `[data-revealed]` CSS from Task 1.
- Produces: `Reveal` — `{ children: React.ReactNode; as?: keyof React.JSX.IntrinsicElements; delay?: number; once?: boolean; className?: string }`. `"use client"`. Renders children immediately (SSR-safe, no layout shift); adds `data-revealed="true"` when scrolled into view.

- [ ] **Step 1: Create `components/ui/Reveal.tsx`**

```tsx
'use client'

import * as React from 'react'

export interface RevealProps {
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
  once?: boolean
  className?: string
}

export function Reveal({ children, as = 'div', delay = 0, once = true, className }: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setRevealed(true); return }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          if (once) io.disconnect()
        } else if (!once) {
          setRevealed(false)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  const Tag = as as React.ElementType
  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal=""
      data-revealed={revealed ? 'true' : 'false'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 2: Append to `components/ui/index.ts`**

```ts
export { Reveal, type RevealProps } from './Reveal'
```

- [ ] **Step 3: `/dev/ui` section** (import `{ Reveal, Card, CardBody }`)

```tsx
        <section id="reveal">
          <h2 className="mb-4 text-xl">Reveal (scroll into view)</h2>
          <p className="text-ink-soft">Scroll so these enter from the bottom of the viewport.</p>
          <div className="mt-[60vh] space-y-4">
            {[1, 2, 3].map((n) => (
              <Reveal key={n} delay={n * 80}>
                <Card><CardBody>Revealed block {n}</CardBody></Card>
              </Reveal>
            ))}
          </div>
        </section>
```

- [ ] **Step 4: Standard Verification Cycle** — blocks start invisible, fade+rise as they enter; with OS reduce-motion on, they are immediately visible with no transform; SSR: view-source shows the block markup present (not JS-injected); both themes.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(ui): Reveal scroll-reveal wrapper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 15: Refit existing branch components onto the new system

**Files:**
- Modify: `components/ui/StatTile.tsx`, `components/ui/ProductCard.tsx`, `components/ui/Gallery.tsx`, `components/ui/SpecsTable.tsx`, `components/ui/FilterBar.tsx`
- Modify: `components/ui/index.ts` (add these to the barrel)

**Interfaces:**
- Consumes: `Badge`, `FilterPill`, `Select`, `Input`, `Field`, `Sheet`/`SheetContent`, `cn`, tokens.
- Produces: same public component APIs as today (`StatTile`, `ProductCard`, `Gallery`, `SpecsTable`, `FilterBar` — no prop changes) so their consuming pages compile unchanged.

- [ ] **Step 1: `StatTile.tsx` — tokens instead of `text-primary`/`text-white`/`text-gray-500`**

```tsx
import { cn } from '@/lib/utils'

interface StatTileProps {
  value: string
  label: string
  variant?: 'light' | 'dark'
}

export function StatTile({ value, label, variant = 'light' }: StatTileProps) {
  return (
    <div className="px-6 py-2 text-center">
      <p className={cn('font-display text-3xl font-extrabold sm:text-4xl', variant === 'dark' ? 'text-on-primary' : 'text-primary')}>
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  )
}
```

- [ ] **Step 2: `SpecsTable.tsx` — tokens**

```tsx
import type { ProductSpec } from '@/types/product'

export function SpecsTable({ specs }: { specs: ProductSpec[] | null }) {
  if (!specs || specs.length === 0) return null
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-display font-bold text-ink">Specifications</h3>
      <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ink-soft">{spec.label}</span>
            <span className="font-600 text-ink">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `Gallery.tsx` — tokens (keep behaviour)**

Replace `bg-white` → `bg-surface`, `border-gray-100` → `border-line`, `shadow-card` stays (compat) or → `shadow-md`, `text-gray-300` → `text-ink-soft`, active thumb `border-primary` stays, inactive `border-gray-100 hover:border-gray-300` → `border-line hover:border-primary/40`, `rounded-3xl` → `rounded-lg`, `rounded-xl` → `rounded-md`.

- [ ] **Step 4: `ProductCard.tsx` — tokens + `Card` shell**

```tsx
import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const whatsappMsg = `Hi, I'm interested in "${product.name}" on Zolarux. Can I get more details?`

  return (
    <Card interactive className="group overflow-hidden">
      <Link href={`/listings/${product.id}`} className="relative block aspect-square overflow-hidden bg-primary-soft">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><ShoppingBag size={32} className="text-ink-soft" /></div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_featured && <Badge variant="featured" />}
          {product.condition && <Badge variant="condition" condition={product.condition} />}
        </div>
        <div className="absolute right-3 top-3"><Badge variant="verified" /></div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 font-display text-sm font-bold text-ink transition-colors group-hover:text-primary">{product.name}</h3>
        </Link>
        <p className="mb-3 text-xs text-ink-soft">{product.brand ? `${product.brand} · ${product.category}` : product.category}</p>
        <div className="flex items-center justify-between">
          {product.pricing_type === 'quote' ? (
            <span className="text-sm font-bold text-primary">Price on request</span>
          ) : (
            <span className="font-display text-base font-extrabold text-ink [font-variant-numeric:tabular-nums]">{formatPrice(product.price)}</span>
          )}
          <Link href={buildWhatsAppUrl(whatsappMsg)} target="_blank" title="Inquire on WhatsApp"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-verified text-white transition-micro hover:brightness-110">
            <MessageCircle size={14} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 5: `FilterBar.tsx` — swap raw inputs for `Input`/`Select`/`FilterPill`, drawer → `Sheet`**

Keep all the `useSearchParams`/`updateParams` logic exactly as-is. Replace only the presentational layer:
- Condition buttons → `FilterPill` (`active={activeCondition === condition}`).
- Brand / price `<input>` → `Input`.
- Sort `<select>` → `Select` with `options={LISTING_SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}`.
- Search `<input>` → `Input` with the `Search` icon kept as an absolutely-positioned adornment.
- Mobile drawer block (`drawerOpen` state + fixed overlay) → `Sheet` + `SheetTrigger` (the `SlidersHorizontal` `IconButton`) + `SheetContent side="bottom" title="Filters"`. Remove the hand-rolled overlay and the `drawerOpen` state.
- `bg-white`/`border-gray-*`/`text-gray-*` → tokens.

- [ ] **Step 6: Append refitted components to `components/ui/index.ts`**

```ts
export { StatTile } from './StatTile'
export { ProductCard } from './ProductCard'
export { Gallery } from './Gallery'
export { SpecsTable } from './SpecsTable'
export { FilterBar } from './FilterBar'
```

- [ ] **Step 7: Add a `/dev/ui` section** rendering `StatTile` (both variants), `SpecsTable` with sample specs, and a note that `ProductCard` / `Gallery` / `FilterBar` are exercised on the live Listings pages. (Import from `@/components/ui`.)

```tsx
        <section id="refit">
          <h2 className="mb-4 text-xl">Refitted components</h2>
          <div className="grid grid-cols-2 gap-4 rounded-md bg-primary p-6 sm:grid-cols-4">
            <StatTile value="1,240" label="Listings" variant="dark" />
            <StatTile value="38" label="Vendors" variant="dark" />
          </div>
          <div className="mt-6 max-w-md">
            <SpecsTable specs={[{ label: 'Display', value: '6.1" OLED' }, { label: 'Storage', value: '128GB' }, { label: 'Battery', value: '3095 mAh' }]} />
          </div>
          <p className="mt-2 text-sm text-ink-soft">ProductCard, Gallery, and FilterBar are exercised on <code>/listings</code> and <code>/listings/[id]</code>.</p>
        </section>
```

- [ ] **Step 8: Standard Verification Cycle + existing-page pass**

`tsc`/`lint`/`build` green. Then `npm run dev` and open all six existing pages:
- `/` — StatTile bar, ProductCard rail render; colours are token-based.
- `/listings` — FilterBar (desktop sidebar + mobile Sheet), ProductCard grid, filtering still works (change condition pill, URL updates, results change).
- `/listings/[id]` (open one listing) — Gallery, SpecsTable, related ProductCards.
- `/about`, `/check-vendor`, `/login` — no regressions.
Check each in light + dark at the three widths. Note any purely-cosmetic rough edges for Phase 1 (do not fix pages here).

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "refactor(ui): refit StatTile/ProductCard/Gallery/SpecsTable/FilterBar onto tokens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 16: Phase 0 verification pass

**Files:**
- Modify: `docs/superpowers/specs/2026-08-28-flagship-v2-phase-0-foundation-design.md` (tick §11 open items with their resolutions)
- Modify: `components/ui/index.ts` (final review — every component exported once, no dupes)

**Interfaces:** none produced; this task gates Phase 0 completion.

- [ ] **Step 1: Full static check**

```bash
npx tsc --noEmit     # clean
npm run lint         # clean
npm run build        # succeeds
```

Copy the printed route table into the commit message. Confirm: `/dev/ui` present (static); the six existing routes unchanged in their static/dynamic classification vs. `git show flagship-redesign:` equivalents (Listings/Listing-Detail were dynamic due to `searchParams` — still dynamic; others static).

- [ ] **Step 2: Full manual QA matrix**

`npm run dev`, open `/dev/ui`. For **each** section, at **375 / 768 / 1280 px**, in **light** and **dark** (6 combinations):
- No invisible text, no theme-mismatched surface (light panel on dark page or vice-versa).
- Focus ring visible on every interactive element via keyboard.
- Overlays (Dialog, Sheet, Select, DropdownMenu, Tooltip) portal above everything and use `surface-raised`.

Then with **OS reduce-motion ON**: reload `/dev/ui` — `Reveal` blocks visible immediately, skeleton not pulsing, card hover-lift and accordion chevron do not animate.

Record the matrix result (pass/fail per section) in the commit body.

- [ ] **Step 3: Existing-pages regression sign-off**

Open `/`, `/listings`, `/listings/<real-id>`, `/about`, `/check-vendor`, `/login` in light + dark. Confirm: renders, no console errors, filtering on `/listings` works, WhatsApp CTAs still link out. Cosmetic imperfections are acceptable and belong to Phase 1 — list them in the commit body as a Phase-1 punch list.

- [ ] **Step 4: Resolve spec open items**

In the spec's §11, append resolutions:
- Branch name: `flagship-v2` — confirmed.
- Toasts: `sonner` — implemented.
- `/dev/ui`: stays on the branch through the program; removed before the final `main` merge (tracked as a Phase-4 / integration task).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(phase-0): verification pass — tokens + component library complete

Route table:
<paste>

QA matrix: <pass summary>
Phase-1 cosmetic punch list: <bullets>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Push the branch**

```bash
git push -u origin flagship-v2
```

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §2 branch strategy | Global Constraints + Task 16 |
| §5.1 Tailwind v4 `@theme`, primitives + semantic | Task 1 |
| §5.2 semantic color tokens (both themes) + `--color-refurb` | Task 1 |
| §5.3 shape / elevation / motion tokens | Task 1 |
| §5.4 typography (add dm-sans 600, resolve family-name inconsistency, scale, defaults) | Task 1 |
| §5.5 `CONDITION_MAP` / `VENDOR_STATUS_MAP` rebuilt on tokens | Task 7 |
| §6 dark mode — `next-themes`, `.dark` overrides, `ThemeToggle`, `suppressHydrationWarning` | Tasks 2, 3 |
| §7 motion — CSS-first utilities, `<Reveal>`, reduced-motion guard, no anim library | Tasks 1, 14 |
| §8 component library (full inventory, Radix + CVA, focus rings, both themes, `sonner`) | Tasks 3–14 |
| §8 refit existing branch components | Task 15 |
| §9 verification — `/dev/ui`, lint/tsc/build, QA matrix, reduced-motion | Task 3 (route), Task 16 (pass) |
| §10 out of scope (no page redesigns) | enforced in Global Constraints; Tasks 15–16 only smoke-test pages |
| §11 open items | Task 16 Step 4 |

No gaps.

**2. Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". Task 15 Steps 3 & 5 describe edits to existing files by naming exact class-swaps rather than repeating the full file — acceptable because the full current file contents are quoted in the plan's exploration and the transformation is mechanical; the interface block fixes the resulting public API. Every new component has full source.

**3. Type consistency:**
- `cn` — used consistently from `@/lib/utils` (verified it exists and has that signature).
- `buttonVariants` exported from Task 4, not re-referenced later (available for Phase 1).
- `CONDITION_MAP` shape change (`.className` replaces `.color/.bg/.border`) — introduced in Task 7, the only other consumer (`FilterBar.tsx`) is patched in Task 7 Step 6 and re-confirmed in Task 15 Step 5. `ProductCard` uses `<Badge>` only — no map access.
- `Field` is defined in `Input.tsx` (Task 5) and imported in Tasks 6, 15 — export path consistent (`@/components/ui`).
- `toast` exported from both `./Toast` and the barrel (Task 12) — single source, no dupe.
- `Toaster` uses `resolvedTheme` from `next-themes` — matches the `ThemeProvider` config in Task 2.
- Radix package installs are split across Tasks 6 and 11; Tasks 9 and 10 rely only on `react-dialog` / `react-dropdown-menu` which are already in `package.json` (verified).

Fixed inline during review: Task 3's `sitemap.ts` change was originally "add /dev to disallow list" (wrong file — sitemap has no disallow); corrected to a clarifying comment since no `/dev` URL is emitted.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-08-28-flagship-v2-phase-0-foundation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
