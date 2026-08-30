export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string
  title: string
  lede?: string
}) {
  return (
    <section className="bg-primary py-16 text-on-primary sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-on-primary/70">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {title}
          </h1>
          {lede && (
            <p className="mt-4 font-body text-lg leading-relaxed text-on-primary/80">{lede}</p>
          )}
        </div>
      </div>
    </section>
  )
}
