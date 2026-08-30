import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/marketing/PageHeader'
import { ContactForm } from '@/components/marketing/ContactForm'
import { buildWhatsAppUrl } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to a real person at Zolarux. Message us on WhatsApp — we reply fast.',
}

const WA_HREF = buildWhatsAppUrl("Hi Zolarux, I'd like to ask a question.")

export default function ContactPage() {
  return (
    <div className="bg-background">
      <PageHeader
        eyebrow="Contact"
        title="Talk to a human"
        // DRAFT — confirm hours / response time
        lede="We're on WhatsApp most of the day and reply quickly — usually within an hour."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
              WhatsApp is fastest
            </h2>
            <p className="mb-6 font-body text-sm leading-relaxed text-ink-soft">
              For anything about a specific order or product, message us directly — it&apos;s the
              quickest way to get a real answer.
            </p>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-verified px-6 py-3.5 font-display text-base font-bold text-white transition-micro hover:brightness-110"
            >
              <MessageCircle size={18} />
              Message us on WhatsApp
            </a>
            <p className="mt-6 font-body text-sm text-ink-soft">
              Looking for a quick answer? Check the{' '}
              <Link href="/faq" className="font-semibold text-primary hover:underline">
                FAQ
              </Link>{' '}
              first.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Or send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
