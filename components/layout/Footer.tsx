import Link from 'next/link'
import { Shield, MessageCircle } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'How It Works',     href: '/how-it-works' },
    { label: 'Verified Listings', href: '/listings' },
    { label: 'Verified Vendors', href: '/verified-vendors' },
    { label: 'For Buyers',       href: '/for-buyers' },
    { label: 'For Vendors',      href: '/for-vendors' },
  ],
  'Safety Tools': [
    { label: 'Check Vendor',     href: '/check-vendor' },
    { label: 'Check Device',     href: '/check-device' },
    { label: 'Verify Original',  href: '/check-original' },
    { label: 'Report Stolen',    href: '/report-item' },
    { label: 'Scan a Link',      href: '/scan-link' },
  ],
  Company: [
    { label: 'About Us',         href: '/about' },
    { label: 'Blog',             href: '/blog' },
    { label: 'Contact',          href: '/contact' },
    { label: 'FAQ',              href: '/faq' },
    { label: 'Download App',     href: '/downloads' },
  ],
  Legal: [
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy',    href: '/refund-policy' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-800 text-sm">Z</span>
              </div>
              <span className="font-display font-700 text-white text-lg">Zolarux</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Nigeria&apos;s trust infrastructure for gadget commerce. Verified vendors,
              escrow protection, and real transaction safety.
            </p>
            <a
              href="https://wa.me/2347063107314"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-display font-700 text-white text-sm mb-4 tracking-wide">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Zolarux Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield size={14} className="text-primary" />
            <span>Escrow Protected · Vendor Verified · Dispute Resolved</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
