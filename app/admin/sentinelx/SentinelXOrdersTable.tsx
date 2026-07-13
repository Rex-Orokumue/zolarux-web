'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package } from 'lucide-react'
import { formatPrice, formatDate, truncate } from '@/lib/utils'
import type { SentinelXOrder, SentinelXOrderStatus } from '@/types/sentinelx'

const STATUS_CONFIG: Record<SentinelXOrderStatus, { label: string; color: string; bg: string; border: string }> = {
  initiated: { label: 'Initiated', color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-200' },
  held:      { label: 'In Escrow', color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200' },
  released:  { label: 'Released',  color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300' },
  refunded:  { label: 'Refunded',  color: 'text-gray-700',  bg: 'bg-gray-100',  border: 'border-gray-200' },
  disputed:  { label: 'Disputed',  color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
}

const ACTIONS_BY_STATUS: Record<string, { action: 'release' | 'refund' | 'dispute'; label: string; classes: string }[]> = {
  held: [
    { action: 'release', label: 'Release to seller', classes: 'text-green-700 border-green-200 hover:bg-green-50' },
    { action: 'refund',  label: 'Refund buyer',       classes: 'text-gray-600 border-gray-200 hover:bg-gray-50' },
    { action: 'dispute', label: 'Mark disputed',      classes: 'text-red-700 border-red-200 hover:bg-red-50' },
  ],
  disputed: [
    { action: 'release', label: 'Release to seller', classes: 'text-green-700 border-green-200 hover:bg-green-50' },
    { action: 'refund',  label: 'Refund buyer',       classes: 'text-gray-600 border-gray-200 hover:bg-gray-50' },
  ],
}

function StatusBadge({ status }: { status: SentinelXOrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-600 border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
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

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
        <Package size={32} className="text-gray-200 mx-auto mb-4" />
        <h3 className="font-display font-700 text-gray-900 mb-2">No orders match these filters</h3>
        <p className="text-gray-400 text-sm">Try a different status or search term.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {error && <p className="text-red-600 text-sm px-4 pt-4">{error}</p>}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-3 px-4">Order Ref</th>
              <th className="py-3 px-4">Listing</th>
              <th className="py-3 px-4">Buyer</th>
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Initiated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 px-4 font-mono text-xs">{order.order_ref}</td>
                <td className="py-3 px-4">{order.listing_title}</td>
                <td className="py-3 px-4 text-gray-500" title={order.buyer_id}>{truncate(order.buyer_id, 10)}</td>
                <td className="py-3 px-4 text-gray-500" title={order.seller_id}>{truncate(order.seller_id, 10)}</td>
                <td className="py-3 px-4 font-600">{formatPrice(order.amount / 100)}</td>
                <td className="py-3 px-4 text-gray-500">{formatDate(order.initiated_at)}</td>
                <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label, classes }) => (
                      <button
                        key={action}
                        disabled={pendingId === order.id}
                        onClick={() => runAction(order.id, action)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${classes}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-50">
        {orders.map((order) => (
          <div key={order.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-500">{order.order_ref}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="font-600 text-gray-900">{order.listing_title}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p title={order.buyer_id}>Buyer: {truncate(order.buyer_id, 14)}</p>
              <p title={order.seller_id}>Seller: {truncate(order.seller_id, 14)}</p>
              <p>Initiated: {formatDate(order.initiated_at)}</p>
            </div>
            <p className="font-display font-700 text-gray-900">{formatPrice(order.amount / 100)}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {(ACTIONS_BY_STATUS[order.status] || []).map(({ action, label, classes }) => (
                <button
                  key={action}
                  disabled={pendingId === order.id}
                  onClick={() => runAction(order.id, action)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-all ${classes}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
