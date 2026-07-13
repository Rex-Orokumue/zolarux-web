import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { SentinelXOrdersTable } from './SentinelXOrdersTable'
import { SentinelXFilters } from './SentinelXFilters'
import { formatPrice } from '@/lib/utils'
import { parseStatusFilter, sanitizeSearch, parsePage, buildSentinelXHref } from '@/lib/sentinelx/admin-filters'
import type { SentinelXOrder } from '@/types/sentinelx'

const PAGE_SIZE = 20

export default async function SentinelXOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const supabase = createAdminClient()

  const statusFilter = parseStatusFilter(params.status)
  const search = sanitizeSearch(params.q)
  const currentPage = parsePage(params.page)

  let query = supabase
    .from('sentinelx_orders')
    .select('*', { count: 'exact' })
    .order('initiated_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)
  if (search) query = query.or(`order_ref.ilike.%${search}%,listing_title.ilike.%${search}%`)

  const { data: orders, count } = await query.range(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE - 1
  )

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE))

  const [heldRes, disputedRes, releasedRes, refundedRes, heldAmountsRes] = await Promise.all([
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'held'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'disputed'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'released'),
    supabase.from('sentinelx_orders').select('id', { count: 'exact', head: true }).eq('status', 'refunded'),
    supabase.from('sentinelx_orders').select('amount').eq('status', 'held'),
  ])

  const escrowValueKobo = (heldAmountsRes.data || []).reduce((sum, row: { amount: number }) => sum + row.amount, 0)

  const stats = [
    { label: 'Held', value: heldRes.count || 0, color: 'text-amber-600' },
    { label: 'Disputed', value: disputedRes.count || 0, color: 'text-red-600' },
    { label: 'Released', value: releasedRes.count || 0, color: 'text-green-600' },
    { label: 'Refunded', value: refundedRes.count || 0, color: 'text-gray-600' },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">SentinelX Escrow Orders</h1>
        <span className="text-sm text-gray-400">{count || 0} total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
            <p className={`font-display font-800 text-2xl ${color}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
          <p className="font-display font-800 text-2xl text-primary">{formatPrice(escrowValueKobo / 100)}</p>
          <p className="text-gray-400 text-xs mt-1">Value in Escrow</p>
        </div>
      </div>

      <SentinelXFilters activeStatus={statusFilter} search={params.q || ''} />

      <SentinelXOrdersTable orders={(orders as SentinelXOrder[]) || []} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {currentPage > 1 && (
            <Link
              href={buildSentinelXHref({ status: statusFilter, q: search, page: currentPage - 1 })}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildSentinelXHref({ status: statusFilter, q: search, page: currentPage + 1 })}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-600 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
