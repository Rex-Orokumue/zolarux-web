'use client'

import * as React from 'react'

export interface RevealProps {
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
  once?: boolean
  className?: string
}

export function Reveal({ children, as = 'div', delay = 0, once = true, className }: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    // Arm (hide) only after mount, via the DOM — never through render state, so
    // SSR and first client render stay identical (no hydration mismatch) and the
    // content is visible when JS is unavailable.
    el.dataset.revealArmed = 'true'

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.revealed = 'true'
          if (once) io.disconnect()
        } else if (!once) {
          el.dataset.revealed = 'false'
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  const Tag = as as React.ElementType
  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  )
}
