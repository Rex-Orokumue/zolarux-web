import type { ProductSpec } from '@/types/product'

export default function SpecsTable({ specs }: { specs: ProductSpec[] | null }) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="font-display font-700 text-gray-900 dark:text-gray-100 mb-2">Specifications</h3>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{spec.label}</span>
            <span className="text-gray-900 dark:text-gray-100 font-600">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
