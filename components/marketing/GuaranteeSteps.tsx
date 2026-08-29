import { PackageSearch, Camera, MessageCircle, BadgeCheck } from 'lucide-react'

const BEATS = [
  {
    icon: PackageSearch,
    title: 'We source & inspect every unit',
    body: 'Function, battery health, IMEI and cosmetic grade — checked before anything is listed for you.',
  },
  {
    icon: Camera,
    title: 'You see the real thing',
    body: 'Actual photos of the actual unit, honest condition notes, and full specs. No stock images.',
  },
  {
    icon: MessageCircle,
    title: 'Order on WhatsApp, then we ship',
    body: 'Message us to confirm stock and details. Pay, and your gadget is on its way.',
  },
  {
    icon: BadgeCheck,
    title: "Inspect on delivery — refund if it's wrong",
    body: 'Check it in hand. If it is not exactly as described, you get a full refund. No argument.',
  },
] as const

export function GuaranteeSteps() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {BEATS.map((beat) => {
        const Icon = beat.icon
        return (
          <div key={beat.title} className="rounded-md border border-line bg-surface p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Icon size={20} />
            </div>
            <h3 className="mb-2 font-display text-base font-bold text-ink">{beat.title}</h3>
            <p className="font-body text-sm leading-relaxed text-ink-soft">{beat.body}</p>
          </div>
        )
      })}
    </div>
  )
}
