import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers about buying safely, escrow, verification, payments, and vendors on Zolarux.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Frequently Asked Questions | Zolarux',
    description: 'Answers about buying safely, escrow, verification, and vendors on Zolarux.',
    url: '/faq',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
