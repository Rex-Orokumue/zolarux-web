import { Plus, Trash2 } from 'lucide-react'
import { Button, Field, IconButton, Input, Textarea, ThemeToggle } from '@/components/ui'

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
        {/* LATER TASKS: append one <section> per component group here */}
      </div>
    </main>
  )
}
