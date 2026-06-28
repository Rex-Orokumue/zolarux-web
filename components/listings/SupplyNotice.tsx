'use client'

import { useEffect, useState } from 'react'
import { Info, X } from 'lucide-react'

const KEY = 'zlx_supply_notice_dismissed'

export default function SupplyNotice() {
  const [hidden, setHidden] = useState(true)
  // Read dismiss state after mount (client-only; avoids SSR/hydration mismatch).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHidden(localStorage.getItem(KEY) === '1') }, [])
  if (hidden) return null
  return (
    <div className="bg-primary-light dark:bg-primary-900/30 border-b border-primary-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-700 text-primary dark:text-primary-100">
            Live catalogue from verified partner vendors.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Prices and stock can change fast — we confirm the final price and availability with you before any payment.
          </p>
        </div>
        <button
          onClick={() => { localStorage.setItem(KEY, '1'); setHidden(true) }}
          className="ml-auto shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function PriceNote() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
      <Info size={10} /> Confirmed at checkout
    </span>
  )
}
