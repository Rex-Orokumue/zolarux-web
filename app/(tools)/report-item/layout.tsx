import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Report a Stolen Gadget',
  description: 'Flag a stolen phone or gadget to help buyers stay safe across Nigeria.',
  alternates: { canonical: '/report-item' },
  openGraph: {
    title: 'Report a Stolen Gadget | Zolarux',
    description: 'Flag a stolen phone or gadget to help buyers stay safe.',
    url: '/report-item',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
