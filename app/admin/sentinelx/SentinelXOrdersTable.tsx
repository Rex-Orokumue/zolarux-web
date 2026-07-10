'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SentinelXOrder } from '@/types/sentinelx'

const ACTIONS_BY_STATUS: Record<string, { action: 'release' | 'refund' | 'dispute'; label: string }[]> = {
  held: [
    { action: 'release', label: 'Release to seller' },
    { action: 'refund', label: 'Refund buyer' },
    { action: 'dispute', label: 'Mark disputed' },
  ],
  disputed: [
    { action: 'release', label: 'Release to seller' },
    { action: 'refund', label: 'Refund buyer' },
  ],
}

export function SentinelXOrdersTable({ orders }: { orders: SentinelXOrder[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAction(id: string, action: 'release' | 'refund' | 'dispute') {
    setPendingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/sentinelx/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Action failed')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 pr-4">Order Ref</th>
            <th className="py-2 pr-4">Listing</th>
            <th className="py-2 pr-4">Buyer</th>
            <th className="py-2 pr-4">Seller</th>
            <th className="py-2 pr-4">Amount (kobo)</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50">
              <td className="py-2 pr-4 font-mono text-xs">{order.order_ref}</td>
              <td className="py-2 pr-4">{order.listing_title}</td>
              <td className="py-2 pr-4">{order.buyer_id}</td>
              <td className="py-2 pr-4">{order.seller_id}</td>
              <td className="py-2 pr-4">{order.amount.toLocaleString()}</td>
              <td className="py-2 pr-4">{order.status}</td>
              <td className="py-2 pr-4 flex gap-2">
                {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label }) => (
                  <button
                    key={action}
                    disabled={pendingId === order.id}
                    onClick={() => runAction(order.id, action)}
                    className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
