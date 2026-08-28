'use client'

import * as React from 'react'
import * as RMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export const DropdownMenu = RMenu.Root
export const DropdownMenuTrigger = RMenu.Trigger

export function DropdownMenuContent({
  children,
  align = 'start',
  className,
}: {
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  return (
    <RMenu.Portal>
      <RMenu.Content
        align={align}
        sideOffset={6}
        className={cn(
          'z-50 min-w-44 overflow-hidden rounded-md border border-line bg-surface-raised p-1 shadow-lg',
          className
        )}
      >
        {children}
      </RMenu.Content>
    </RMenu.Portal>
  )
}

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  destructive,
}: {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <RMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex h-9 cursor-pointer select-none items-center rounded-sm px-3 font-body text-sm outline-none transition-micro',
        'data-[highlighted]:bg-primary-soft data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive ? 'text-danger' : 'text-ink'
      )}
    >
      {children}
    </RMenu.Item>
  )
}

export const DropdownMenuSeparator = () => <RMenu.Separator className="my-1 h-px bg-line" />

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <RMenu.Label className="px-3 py-1.5 font-body text-xs uppercase tracking-wide text-ink-soft">
    {children}
  </RMenu.Label>
)
