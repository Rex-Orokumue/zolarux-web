import { Shield, Sparkles } from 'lucide-react'
import { CONDITION_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProductCondition } from '@/types/product'

type BadgeProps =
  | { variant: 'verified' }
  | { variant: 'featured' }
  | { variant: 'condition'; condition: ProductCondition }

export function Badge(props: BadgeProps) {
  if (props.variant === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-green-200 text-green-700 text-xs font-700 px-2 py-1 rounded-full">
        <Shield size={10} />
        Verified
      </span>
    )
  }

  if (props.variant === 'featured') {
    return (
      <span className="inline-flex items-center gap-1 bg-accent text-white text-xs font-700 px-2.5 py-1 rounded-full">
        <Sparkles size={10} />
        Featured
      </span>
    )
  }

  const config = CONDITION_MAP[props.condition]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-700 px-2.5 py-1 rounded-full border',
      config.color, config.bg, config.border
    )}>
      {config.label}
    </span>
  )
}
