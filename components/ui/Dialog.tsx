'use client'

import * as React from 'react'
import * as RDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = RDialog.Root
export const DialogTrigger = RDialog.Trigger
export const DialogClose = RDialog.Close

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-up" />
      <RDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-line bg-surface-raised p-6 shadow-lg focus:outline-none',
          className
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <RDialog.Title className="font-display text-xl">{title}</RDialog.Title>
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
