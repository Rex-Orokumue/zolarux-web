import type { Metadata } from 'next'
import './globals.css'
import PageLoader from '@/components/layout/PageLoader'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'

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
    'buy phones online Lagos',
    'escrow Nigeria gadgets',
    'check IMEI Nigeria',
    'verified gadget sellers',
  ],
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Zolarux',
    title: 'Zolarux | Buy Gadgets Online Without Fear',
    description: "Nigeria's safest place to buy phones, laptops, and electronics online.",
    url: BASE_URL,
    images: [
      {
        url: '/zolarux_logo.png',
        width: 512,
        height: 512,
        alt: 'Zolarux — Safe Gadget Commerce in Nigeria',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Zolarux | Buy Gadgets Online Without Fear',
    description: "Nigeria's safest place to buy phones, laptops, and electronics online.",
    images: ['/zolarux_logo.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  robots: { index: true, follow: true },
  // Uncomment and add your Bing Webmaster Tools verification code:
  // verification: { other: { 'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE' } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <PageLoader />
        {children}
      </body>
    </html>
  )
}

