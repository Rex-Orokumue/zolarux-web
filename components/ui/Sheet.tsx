'use client'

import * as React from 'react'
import * as RDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = RDialog.Root
export const SheetTrigger = RDialog.Trigger
export const SheetClose = RDialog.Close

export function SheetContent({
  side = 'bottom',
  title,
  description,
  children,
  className,
}: {
  side?: 'bottom' | 'right'
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const sideClasses =
    side === 'right'
      ? 'inset-y-0 right-0 h-full w-[min(24rem,90vw)] rounded-l-lg border-l'
      : 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-lg border-t'
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <RDialog.Content
        className={cn(
          'fixed z-50 overflow-y-auto border-line bg-surface-raised p-5 shadow-lg focus:outline-none',
          sideClasses,
          className
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <RDialog.Title className="font-display text-lg">{title}</RDialog.Title>
          <RDialog.Close
            className="rounded-sm text-ink-soft transition-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Close"
          >
            <X size={18} />
          </RDialog.Close>
        </div>
        {description && (
          <RDialog.Description className="mb-4 text-sm text-ink-soft">{description}</RDialog.Description>
        )}
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  )
}
