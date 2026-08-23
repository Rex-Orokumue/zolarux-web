'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-3xl border border-gray-100 shadow-card flex items-center justify-center text-gray-300">
        <ShoppingBag size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-card group">
        <img
          src={images[activeIndex]}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === i ? 'border-primary' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
