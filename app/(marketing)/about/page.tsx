import type { Metadata } from 'next'
import { Search, Camera, MessageCircle, RotateCcw } from 'lucide-react'
import { StatTile, Card, Avatar, Reveal } from '@/components/ui'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Zolarux is a small Nigerian gadget store built on one rule: you get exactly what you ordered, or your money back. Meet the people behind it.',
}

const VALUES = [
  {
    icon: Search,
    title: 'We inspect everything',
    body: "Nothing ships that we haven't powered on, tested and graded ourselves.",
  },
  {
    icon: Camera,
    title: "We're honest about condition",
    body: 'Real photos of the real unit, real notes. No "as good as new" when it isn\'t.',
  },
  {
    icon: MessageCircle,
    title: "We're easy to reach",
    body: 'A person on WhatsApp who knows your order — not a ticket queue.',
  },
  {
    icon: RotateCcw,
    title: 'Guaranteed or refunded',
    body: "If it's not exactly as described when it reaches you, you get your money back.",
  },
]

// DRAFT — confirm names, roles and bios with the user.
const TEAM = [
  {
    name: 'Rex Orokumue',
    role: 'Founder',
    bio: 'Started Zolarux after one too many friends lost money to fake phones online. Handles what gets bought and how it gets checked.',
  },
  {
    name: 'Karen',
    role: 'Sourcing & Inspection',
    bio: 'Runs the bench — every device through her hands before it is listed or shipped.',
  },
  {
    name: 'Precious',
    role: 'Customer Care',
    bio: 'The voice on WhatsApp. Keeps every order moving and every buyer in the loop.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero — founder voice. Shares the <PageHeader> band treatment. */}
      <section className="bg-hero-primary py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Our story
            </p>
            {/* DRAFT headline — confirm */}
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
              I started Zolarux because I was tired of watching people get burned.
            </h1>
            <p className="mt-5 font-body text-lg leading-relaxed text-white/80">
              I&apos;m Rex. I&apos;ve been buying and selling gadgets in Nigeria for about five
              years — and for most of that time I watched people lose real money to fake phones,
              swapped parts and &ldquo;vendors&rdquo; who vanished the moment the transfer landed.
            </p>
          </div>
        </div>
      </section>

      {/* The story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4 font-body leading-relaxed text-ink-soft">
            {/* DRAFT story — confirm the specifics */}
            <p>
              The demand was never the problem. Everyone wants a clean iPhone or a solid work
              laptop at a fair price. The problem was trust — you send money to a stranger and
              hope.
            </p>
            <p>
              So I decided to be the seller people didn&apos;t have to hope about. Buy the stock
              myself. Test every unit properly — not a glance, a real check. Be honest about what
              it is, down to the scratch on the corner. And if I get it wrong, refund it, no
              argument.
            </p>
            <p>
              That&apos;s the whole business. Five years, ₦2M+ in orders, and nobody has ever
              lost money buying from us.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* DRAFT numbers — same placeholders as Home; confirm once */}
            {[
              { value: '₦2M+', label: 'In orders' },
              { value: '100+', label: 'Gadgets delivered' },
              { value: '5 yrs', label: 'Doing this' },
              { value: '0', label: 'Confirmed scams' },
            ].map((s) => (
              <div key={s.label} className="rounded-md border border-line bg-surface py-2">
                <StatTile value={s.value} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-10 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            What we stand for
          </h2>
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => {
                const Icon = v.icon
                return (
                  <div key={v.title} className="rounded-md border border-line bg-surface p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon size={20} />
                    </div>
                    <h3 className="mb-2 font-display text-base font-bold text-ink">{v.title}</h3>
                    <p className="font-body text-sm leading-relaxed text-ink-soft">{v.body}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            The people behind it
          </h2>
          <p className="mb-10 font-body text-ink-soft">
            Small team. Every order has a real person watching it.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((m) => (
              <Card key={m.name}>
                <div className="p-6">
                  <Avatar name={m.name} size="lg" />
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{m.name}</h3>
                  <p className="font-body text-sm font-semibold text-primary">{m.role}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">{m.bio}</p>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-6 font-body text-xs text-ink-soft">
            Draft — confirm team names, roles and bios.
          </p>
        </div>
      </section>
    </div>
  )
}
