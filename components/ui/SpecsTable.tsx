import type { ProductSpec } from '@/types/product'

export function SpecsTable({ specs }: { specs: ProductSpec[] | null }) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="font-display font-700 text-gray-900 mb-3">Specifications</h3>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-gray-500">{spec.label}</span>
            <span className="text-gray-900 font-600">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
