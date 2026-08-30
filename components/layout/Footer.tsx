import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'
import { SHOP_MENU, NAV_LINKS, HELP_LINKS } from '@/lib/constants'

const WA_HREF = buildWhatsAppUrl('Hi Zolarux, I have a question about an order.')

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-extrabold text-on-primary">
              Z
            </span>
            <span className="font-display text-lg font-bold text-ink">Zolarux</span>
          </Link>
          <p className="mb-5 max-w-xs font-body text-sm leading-relaxed text-ink-soft">
            Phones, laptops and gadgets you can trust. We inspect every unit before it ships —
            you inspect it on delivery. Not as described? Full refund.
          </p>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-verified transition-micro hover:brightness-110"
          >
            <MessageCircle size={16} />
            Chat with us on WhatsApp
          </a>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Shop</h4>
          <ul className="space-y-2.5">
            {SHOP_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Zolarux</h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold tracking-wide text-ink">Help</h4>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-ink-soft transition-micro hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="font-body text-sm text-ink-soft">© {year} Zolarux. All rights reserved.</p>
          <p className="inline-flex items-center gap-2 font-body text-sm text-ink-soft">
            <ShieldCheck size={14} className="text-verified" />
            Inspected before dispatch · Guaranteed or refunded
          </p>
        </div>
      </div>
    </footer>
  )
}
