import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Zolarux',
  description: 'Reach the Zolarux team — support, vendor onboarding, and general enquiries.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Zolarux',
    description: 'Reach the Zolarux team — support, vendor onboarding, and enquiries.',
    url: '/contact',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
