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
          <p className="text-ink-soft">
            Light / System / Dark. State persists across reloads via <code>next-themes</code>.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </section>
        {/* LATER TASKS: append one <section> per component group here */}
      </div>
    </main>
  )
}
