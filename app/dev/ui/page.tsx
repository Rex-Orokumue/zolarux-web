import { Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Field,
  FilterPill,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Textarea,
  ThemeToggle,
} from '@/components/ui'

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
        <section id="card">
          <h2 className="mb-4 text-xl">Card</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="flat">
              <CardBody>
                <p className="font-600">Flat</p>
                <p className="text-sm text-ink-soft">No shadow, border only.</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-600">Raised</p>
                <p className="text-sm text-ink-soft">Default md shadow.</p>
              </CardBody>
            </Card>
            <Card interactive>
              <CardBody>
                <p className="font-600">Interactive</p>
                <p className="text-sm text-ink-soft">Hover to lift.</p>
              </CardBody>
            </Card>
          </div>
        </section>
        {/* LATER TASKS: append one <section> per component group here */}
      </div>
    </main>
  )
}
