import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dev — UI',
  robots: { index: false, follow: false },
}

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-ink">{children}</div>
}
