'use client'

import * as RRadio from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

export interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  options: { value: string; label: string }[]
  name?: string
  'aria-label'?: string
}

export function RadioGroup({ value, defaultValue, onValueChange, options, name, ...aria }: RadioGroupProps) {
  return (
    <RRadio.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      aria-label={aria['aria-label']}
      className="flex flex-col gap-2"
    >
      {options.map((o) => (
        <label key={o.value} className="inline-flex items-center gap-2 font-body text-sm text-ink">
          <RRadio.Item
            value={o.value}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-pill border border-line bg-surface transition-micro',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-primary'
            )}
          >
            <RRadio.Indicator className="h-2.5 w-2.5 rounded-pill bg-primary" />
          </RRadio.Item>
          {o.label}
        </label>
      ))}
    </RRadio.Root>
  )
}
