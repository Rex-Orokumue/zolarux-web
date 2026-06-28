import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verified Vendors',
  description: "Browse Zolarux's verified gadget vendors — checked identities and escrow-protected sales.",
  alternates: { canonical: '/verified-vendors' },
  openGraph: {
    title: 'Verified Vendors | Zolarux',
    description: "Browse Zolarux's verified gadget vendors.",
    url: '/verified-vendors',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
