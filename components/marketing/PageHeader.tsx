import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  lede,
  tone = 'primary',
}: {
  eyebrow?: string
  title: string
  lede?: string
  tone?: 'primary' | 'danger'
}) {
  return (
    <section
      className={cn(
        'py-16 sm:py-20',
        tone === 'danger' ? 'bg-danger text-white' : 'bg-primary text-on-primary'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {title}
          </h1>
          {lede && <p className="mt-4 font-body text-lg leading-relaxed opacity-80">{lede}</p>}
        </div>
      </div>
    </section>
  )
}
