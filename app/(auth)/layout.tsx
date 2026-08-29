import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <header className="flex h-14 items-center border-b border-line bg-surface-raised px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-display text-xs font-extrabold text-on-primary">
            Z
          </span>
          <span className="font-display font-bold text-ink">Zolarux</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
      <footer className="border-t border-line py-4 text-center font-body text-xs text-ink-soft">
        © {new Date().getFullYear()} Zolarux
      </footer>
    </div>
  )
}
