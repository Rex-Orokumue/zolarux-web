import type { ProductSpec } from '@/types/product'

export function SpecsTable({ specs }: { specs: ProductSpec[] | null }) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-display font-bold text-ink">Specifications</h3>
      <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-ink-soft">{spec.label}</span>
            <span className="font-600 text-ink">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
