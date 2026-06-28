import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check if a Device is Stolen',
  description: 'Check a phone or gadget against reported-stolen records before you buy — free on Zolarux.',
  alternates: { canonical: '/check-device' },
  openGraph: {
    title: 'Check if a Device is Stolen | Zolarux',
    description: 'Check a phone or gadget against reported-stolen records before you buy.',
    url: '/check-device',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
