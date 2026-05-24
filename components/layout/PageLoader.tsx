'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [prevPath, setPrevPath] = useState('')

  useEffect(() => {
    const current = pathname + searchParams.toString()
    if (prevPath && prevPath !== current) {
      setLoading(true)
      const timer = setTimeout(() => setLoading(false), 800)
      return () => clearTimeout(timer)
    }
    setPrevPath(current)
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        {/* Animated Logo */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-full bg-primary/10 animate-loader-ping" />

          {/* Spinning orbit ring */}
          <div className="absolute -inset-3 rounded-full border-[2.5px] border-transparent border-t-primary border-r-primary/40 animate-loader-spin" />

          {/* Secondary orbit ring (opposite direction) */}
          <div className="absolute -inset-5 rounded-full border-[1.5px] border-transparent border-b-accent/60 border-l-accent/20 animate-loader-spin-reverse" />

          {/* Logo container with breathing animation */}
          <div className="w-16 h-16 flex items-center justify-center animate-loader-breathe">
            <Image
              src="/zolarux_logo.png"
              alt="Zolarux"
              width={64}
              height={64}
              className="w-16 h-16 object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-loader-dot1" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-loader-dot2" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-loader-dot3" />
        </div>
      </div>
    </div>
  )
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  )
}