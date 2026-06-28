import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify a Product is Original',
  description: 'Spot clones and fakes before you pay — Zolarux authenticity checks for gadgets.',
  alternates: { canonical: '/check-original' },
  openGraph: {
    title: 'Verify a Product is Original | Zolarux',
    description: 'Spot clones and fakes before you pay.',
    url: '/check-original',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
