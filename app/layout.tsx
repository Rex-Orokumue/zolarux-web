import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: {
    default: 'Zolarux — Phones, Laptops & Gadgets You Can Trust',
    template: '%s | Zolarux',
  },
  description:
    'Zolarux sources and inspects every phone, laptop and gadget before it ships. You inspect it on delivery — if it is not exactly as described, you get a full refund. Order on WhatsApp.',
  keywords: [
    'buy phones Nigeria',
    'buy laptops Nigeria',
    'buy gadgets Nigeria',
    'UK used phones Nigeria',
    'trusted gadget store Nigeria',
    'guaranteed or refunded gadgets',
    'Zolarux',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Zolarux',
    title: 'Zolarux — Phones, Laptops & Gadgets You Can Trust',
    description:
      'Every unit inspected before dispatch. You inspect it on delivery. Not as described? Full refund. Order on WhatsApp.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-ink">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
