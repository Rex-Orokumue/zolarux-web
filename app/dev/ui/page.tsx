import { Plus, Trash2 } from 'lucide-react'
import { ToastDemo } from './ToastDemo'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FilterPill,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Sheet,
  SheetContent,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  ThemeToggle,
  Tooltip,
  Accordion,
  Skeleton,
  Avatar,
  Separator,
  Breadcrumbs,
  Pagination,
  Reveal,
  StatTile,
  SpecsTable,
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
        <section id="overlays">
          <h2 className="mb-4 text-xl">Dialog &amp; Sheet</h2>
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Open dialog</Button>
              </DialogTrigger>
              <DialogContent title="Confirm payout" description="Release the protection fee to the vendor?">
                <p className="text-sm text-ink-soft">This continues the deal on WhatsApp.</p>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Open sheet (bottom)</Button>
              </SheetTrigger>
              <SheetContent side="bottom" title="Filters">
                <p className="text-sm text-ink-soft">Filter controls would go here.</p>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">Open sheet (right)</Button>
              </SheetTrigger>
              <SheetContent side="right" title="Menu">
                <p className="text-sm text-ink-soft">Nav links would go here.</p>
              </SheetContent>
            </Sheet>
          </div>
        </section>
        <section id="dropdown">
          <h2 className="mb-4 text-xl">DropdownMenu</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Safety tools</Button>
            </DropdownMenuTrigger>
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
        <section id="tabs-tooltip-accordion">
          <h2 className="mb-4 text-xl">Tabs, Tooltip, Accordion</h2>
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
            </TabsList>
            <TabsContent value="specs">
              <p className="text-sm text-ink-soft">Spec rows…</p>
            </TabsContent>
            <TabsContent value="delivery">
              <p className="text-sm text-ink-soft">Delivery info…</p>
            </TabsContent>
            <TabsContent value="vendor">
              <p className="text-sm text-ink-soft">Vendor profile…</p>
            </TabsContent>
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
        <section id="toast">
          <h2 className="mb-4 text-xl">Toast</h2>
          <ToastDemo />
        </section>
        <section id="misc">
          <h2 className="mb-4 text-xl">Skeleton, Avatar, Separator, Breadcrumbs, Pagination</h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-pill" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar name="TechHub Lagos" size="sm" />
              <Avatar name="GadgetPlug NG" size="md" />
              <Avatar name="Naija Devices" size="lg" />
            </div>
            <Separator />
            <Breadcrumbs
              items={[
                { label: 'Listings', href: '/listings' },
                { label: 'Phones', href: '/listings?category=Phones' },
                { label: 'iPhone 13 Pro' },
              ]}
            />
            <Pagination page={3} totalPages={8} hrefFor={(p) => `/dev/ui?page=${p}`} />
          </div>
        </section>
        <section id="reveal">
          <h2 className="mb-4 text-xl">Reveal (scroll into view)</h2>
          <p className="text-ink-soft">Scroll so these enter from the bottom of the viewport.</p>
          <div className="mt-[60vh] space-y-4">
            {[1, 2, 3].map((n) => (
              <Reveal key={n} delay={n * 80}>
                <Card>
                  <CardBody>Revealed block {n}</CardBody>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="refit">
          <h2 className="mb-4 text-xl">Refitted components</h2>
          <div className="grid grid-cols-2 gap-4 rounded-md bg-primary p-6 sm:grid-cols-4">
            <StatTile value="1,240" label="Listings" variant="dark" />
            <StatTile value="38" label="Vendors" variant="dark" />
          </div>
          <div className="mt-6 max-w-md">
            <SpecsTable
              specs={[
                { label: 'Display', value: '6.1" OLED' },
                { label: 'Storage', value: '128GB' },
                { label: 'Battery', value: '3095 mAh' },
              ]}
            />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            ProductCard, Gallery, and FilterBar are exercised on <code>/listings</code> and{' '}
            <code>/listings/[id]</code>.
          </p>
        </section>
        {/* LATER TASKS: append one <section> per component group here */}
      </div>
    </main>
  )
}
