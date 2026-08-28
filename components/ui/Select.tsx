'use client'

import * as RSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  options: { value: string; label: string }[]
  'aria-label'?: string
  className?: string
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  disabled,
  invalid,
  options,
  className,
  ...aria
}: SelectProps) {
  return (
    <RSelect.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        aria-label={aria['aria-label']}
        aria-invalid={invalid || undefined}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 font-body text-base text-ink transition-micro',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[placeholder]:text-ink-soft',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-danger' : 'border-line',
          className
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <ChevronDown size={16} className="text-ink-soft" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface-raised shadow-lg"
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                className="relative flex h-9 cursor-pointer select-none items-center rounded-sm pl-8 pr-3 font-body text-sm text-ink outline-none data-[highlighted]:bg-primary-soft data-[state=checked]:font-600"
              >
                <RSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check size={14} className="text-primary" />
                </RSelect.ItemIndicator>
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
