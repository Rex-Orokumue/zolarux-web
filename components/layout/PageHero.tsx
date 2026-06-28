import { Shield } from 'lucide-react'

export default function PageHero({
  imageUrl, eyebrow, title, subtitle, chips = [],
}: {
  imageUrl: string
  eyebrow?: string
  title: string
  subtitle?: string
  chips?: string[]
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#121C42]/95 via-primary/75 to-primary/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm text-white/90 text-sm font-600 px-3 py-1.5 rounded-full">
            <Shield size={14} /> {eyebrow}
          </span>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-800 text-white mt-4 mb-3 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-white/80 text-lg max-w-2xl">{subtitle}</p>}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {chips.map((c) => (
              <span
                key={c}
                className="bg-white/14 border border-white/20 text-white text-xs font-600 px-3 py-1.5 rounded-lg"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
