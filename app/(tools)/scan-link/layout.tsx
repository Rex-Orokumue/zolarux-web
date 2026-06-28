import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scan a Link for Safety',
  description: "Paste a product link and we'll check if it's safe before you pay — free scam scanner.",
  alternates: { canonical: '/scan-link' },
  openGraph: {
    title: 'Scan a Link for Safety | Zolarux',
    description: "Paste a product link and we'll check if it's safe before you pay.",
    url: '/scan-link',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
