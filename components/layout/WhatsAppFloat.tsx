'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppFloat() {
  const [tooltip, setTooltip] = useState(true)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {tooltip && (
        <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 px-4 py-3 max-w-[200px] relative">
          <button
            onClick={() => setTooltip(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <X size={10} className="text-gray-600" />
          </button>
          <p className="text-gray-700 text-xs font-600 leading-relaxed">
            Need help? Chat with us on WhatsApp 💬
          </p>
        </div>
      )}
      <a
        href="https://wa.me/2347063107314?text=Hi Zolarux, I need help with:"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 animate-nav-pulse"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} className="text-white" />
      </a>
    </div>
  )
}