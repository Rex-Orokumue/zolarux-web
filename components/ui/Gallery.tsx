'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border border-line bg-surface text-ink-soft shadow-md">
        <ShoppingBag size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="group aspect-square overflow-hidden rounded-lg border border-line bg-surface shadow-md">
        <img
          src={images[activeIndex]}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-micro',
                activeIndex === i ? 'border-primary' : 'border-line hover:border-primary/40'
              )}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
