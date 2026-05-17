'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [prevPath, setPrevPath] = useState('')

  useEffect(() => {
    const current = pathname + searchParams.toString()
    if (prevPath && prevPath !== current) {
      setLoading(true)
      const timer = setTimeout(() => setLoading(false), 600)
      return () => clearTimeout(timer)
    }
    setPrevPath(current)
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="relative">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-primary animate-pulse">
            <span className="font-display font-800 text-white text-2xl">Z</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute -inset-1.5 rounded-[18px] border-2 border-transparent border-t-primary border-r-primary/30 animate-spin" />
        </div>
        <p className="text-gray-400 text-xs font-600 tracking-wide">Loading...</p>
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