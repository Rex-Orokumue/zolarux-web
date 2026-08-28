import * as React from 'react'
import { Shield, Sparkles } from 'lucide-react'
import { CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProductCondition } from '@/types/product'

type BadgeProps =
  | { variant: 'verified' }
  | { variant: 'featured' }
  | { variant: 'condition'; condition: ProductCondition }
  | { variant: 'neutral'; children: React.ReactNode }

const base = 'inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 font-body text-xs font-600'

export function Badge(props: BadgeProps) {
  if (props.variant === 'verified') {
    return (
      <span className={cn(base, 'border-verified/30 bg-verified/12 text-verified')}>
        <Shield size={11} />
        Verified
      </span>
    )
  }
  if (props.variant === 'featured') {
    return (
      <span className={cn(base, 'border-transparent bg-action text-on-action')}>
        <Sparkles size={11} />
        Featured
      </span>
    )
  }
  if (props.variant === 'condition') {
    const c = CONDITION_MAP[props.condition]
    return <span className={cn(base, c.className)}>{c.label}</span>
  }
  return <span className={cn(base, 'border-line bg-surface text-ink-soft')}>{props.children}</span>
}
