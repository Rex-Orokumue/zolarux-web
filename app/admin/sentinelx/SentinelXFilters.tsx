import Link from 'next/link'
import { buildSentinelXHref } from '@/lib/sentinelx/admin-filters'
import type { SentinelXOrderStatus } from '@/types/sentinelx'

const STATUS_PILLS: { label: string; value: SentinelXOrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Held', value: 'held' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Released', value: 'released' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Initiated', value: 'initiated' },
]

export function SentinelXFilters({
  activeStatus,
  search,
}: {
  activeStatus: SentinelXOrderStatus | undefined
  search: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {STATUS_PILLS.map((pill) => (
          <Link
            key={pill.label}
            href={buildSentinelXHref({ status: pill.value, q: search })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all ${
              activeStatus === pill.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {pill.label}
          </Link>
        ))}
      </div>

      <form method="GET" action="/admin/sentinelx" className="flex gap-2 sm:ml-auto">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search order ref or listing…"
          className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-600 hover:bg-primary-dark transition-all shrink-0"
        >
          Search
        </button>
      </form>
    </div>
  )
}
