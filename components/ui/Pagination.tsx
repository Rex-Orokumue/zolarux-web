import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )
  const cell = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-body text-sm transition-micro'

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-label="Previous page"
        className={cn(cell, 'border-line text-ink-soft hover:text-ink', page === 1 && 'pointer-events-none opacity-40')}
      >
        <ChevronLeft size={16} />
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          {idx > 0 && p - pages[idx - 1] > 1 && <span className="px-1 text-ink-soft">…</span>}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              cell,
              p === page ? 'border-primary bg-primary text-on-primary' : 'border-line text-ink-soft hover:text-ink'
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        className={cn(cell, 'border-line text-ink-soft hover:text-ink', page === totalPages && 'pointer-events-none opacity-40')}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  )
}
