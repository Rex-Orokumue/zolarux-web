import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Check a Vendor's Verification",
  description: 'Confirm a vendor is verified on Zolarux before you send money — free vendor check.',
  alternates: { canonical: '/check-vendor' },
  openGraph: {
    title: "Check a Vendor's Verification | Zolarux",
    description: 'Confirm a vendor is verified on Zolarux before you send money.',
    url: '/check-vendor',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
