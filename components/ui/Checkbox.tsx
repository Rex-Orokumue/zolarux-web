'use client'

import * as RCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function Checkbox({ checked, defaultChecked, onCheckedChange, disabled, id, label }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn('inline-flex items-center gap-2 font-body text-sm text-ink', disabled && 'opacity-50')}
    >
      <RCheckbox.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(c) => onCheckedChange?.(c === true)}
        disabled={disabled}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line bg-surface transition-micro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      >
        <RCheckbox.Indicator>
          <Check size={13} className="text-on-primary" />
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      {label}
    </label>
  )
}
