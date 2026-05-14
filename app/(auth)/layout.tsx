import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-800 text-xs">Z</span>
          </div>
          <span className="font-display font-700 text-gray-900">Zolarux</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>

      <footer className="py-4 text-center text-gray-400 text-xs border-t border-gray-100">
        © {new Date().getFullYear()} Zolarux Limited ·{' '}
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
      </footer>
    </div>
  )
}
