import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Zolarux | Buy Gadgets Online Without Fear',
    template: '%s | Zolarux',
  },
  description:
    "Zolarux is Nigeria's trust infrastructure for gadget commerce. We verify vendors, hold funds in escrow, and inspect products before you approve payout.",
  keywords: [
    'buy gadgets safely Nigeria',
    'verified phone vendors Nigeria',
    'escrow payment Nigeria',
    'check stolen phone Nigeria',
    'safe online shopping Nigeria',
    'Zolarux',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Zolarux',
    title: 'Zolarux | Buy Gadgets Online Without Fear',
    description: "Nigeria's safest place to buy phones, laptops, and electronics online.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
