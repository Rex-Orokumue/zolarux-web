'use client'

import * as React from 'react'
import * as RTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = RTabs.Root

export function TabsList({ className, ...p }: React.ComponentProps<typeof RTabs.List>) {
  return (
    <RTabs.List
      className={cn('inline-flex items-center gap-1 rounded-md border border-line bg-surface p-1', className)}
      {...p}
    />
  )
}

export function TabsTrigger({ className, ...p }: React.ComponentProps<typeof RTabs.Trigger>) {
  return (
    <RTabs.Trigger
      className={cn(
        'inline-flex h-9 items-center rounded-sm px-3 font-body text-sm font-500 text-ink-soft transition-micro',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-[state=active]:bg-primary data-[state=active]:text-on-primary',
        className
      )}
      {...p}
    />
  )
}

export function TabsContent({ className, ...p }: React.ComponentProps<typeof RTabs.Content>) {
  return <RTabs.Content className={cn('mt-4 focus-visible:outline-none', className)} {...p} />
}
