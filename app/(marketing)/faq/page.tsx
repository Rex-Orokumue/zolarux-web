import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/PageHeader'
import { Accordion } from '@/components/ui'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about buying from Zolarux — ordering, payment, delivery, condition grades and refunds.',
}

// DRAFT — every answer. Confirm specifics (coverage, timeframes, warranty, refund window).
const GROUPS = [
  {
    heading: 'Ordering & payment',
    items: [
      {
        value: 'order',
        trigger: 'How do I place an order?',
        content:
          'Find what you want in the shop and tap "Order on WhatsApp". That opens a chat with your item pre-filled. We confirm stock, condition, final price and delivery, then you pay.',
      },
      {
        value: 'pay',
        trigger: 'How do I pay?',
        content:
          'Bank transfer, once you are happy with the details we send you. We do not ask for payment before confirming your order.',
      },
      {
        value: 'pod',
        trigger: 'Can I pay on delivery?',
        content:
          'In some areas, yes — ask us on WhatsApp for your location. Where pay-on-delivery is available you inspect the unit first, then pay the rider.',
      },
      {
        value: 'account',
        trigger: 'Do I need an account?',
        content:
          'No. You can order entirely over WhatsApp. An account just lets you keep track of past orders.',
      },
    ],
  },
  {
    heading: 'Delivery',
    items: [
      {
        value: 'where',
        trigger: 'Where do you deliver?',
        content:
          'Nationwide. We deliver across Lagos, Abuja, Port Harcourt and other cities — tell us your area and we will confirm.',
      },
      {
        value: 'how-long',
        trigger: 'How long does delivery take?',
        content: 'Usually 1–5 business days depending on your location.',
      },
      {
        value: 'cost',
        trigger: 'How much is delivery?',
        content:
          'It depends on your location and the item. We tell you the exact delivery fee before you pay — no surprises.',
      },
    ],
  },
  {
    heading: 'Condition & warranty',
    items: [
      {
        value: 'grades',
        trigger: 'What do the condition grades mean?',
        content:
          'New, UK Used, Refurbished and Used — each is defined on our How It Works page, with an honest sentence about what to expect.',
      },
      {
        value: 'warranty',
        trigger: 'Do devices come with a warranty?',
        content:
          'Every order is covered by our guarantee: if it is not as described when it reaches you, you get a full refund. Longer hardware warranty depends on the item — ask us before ordering.',
      },
      {
        value: 'photos',
        trigger: 'Are the photos of the actual unit?',
        content:
          'Yes. The photos on a listing are the actual unit you would receive, including any marks. We never use stock images.',
      },
    ],
  },
  {
    heading: 'Refunds',
    items: [
      {
        value: 'not-as-described',
        trigger: "What if it's not as described?",
        content:
          'Tell us within 48 hours with a photo or video. We arrange the return and refund everything you paid.',
      },
      {
        value: 'refund-time',
        trigger: 'How long do refunds take?',
        content:
          'Once we have the unit back and confirm the issue, your refund goes out within a few business days to the account you paid from.',
      },
      {
        value: 'change-mind',
        trigger: 'Can I return it if I just change my mind?',
        content:
          'The guarantee covers items that are not as described. For change-of-mind returns, message us — we handle these case by case.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered"
        lede="If your question isn't here, message us on WhatsApp — we reply fast."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-4 sm:px-6">
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-4 font-display text-xl font-extrabold text-ink">{group.heading}</h2>
              <Accordion type="single" items={group.items} />
            </div>
          ))}

          <p className="font-body text-sm text-ink-soft">
            Draft answers — confirm the specifics. Still stuck?{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
