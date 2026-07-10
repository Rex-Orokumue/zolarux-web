import { createAdminClient } from '@/lib/supabase/admin'
import { SentinelXOrdersTable } from './SentinelXOrdersTable'
import type { SentinelXOrder } from '@/types/sentinelx'

export default async function SentinelXOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('sentinelx_orders')
    .select()
    .order('initiated_at', { ascending: false })
    .limit(100)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-lg font-display font-700 text-gray-900 mb-4">SentinelX Escrow Orders</h1>
      <SentinelXOrdersTable orders={(orders as SentinelXOrder[]) || []} />
    </main>
  )
}
