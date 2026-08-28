'use client'

import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster, toast } from 'sonner'

export { toast }

export function Toaster() {
  const { resolvedTheme } = useTheme()
  return (
    <SonnerToaster
      theme={(resolvedTheme as 'light' | 'dark') ?? 'system'}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-md border border-line bg-surface-raised text-ink shadow-lg font-body',
          description: 'text-ink-soft',
          actionButton: 'bg-primary text-on-primary rounded-sm',
        },
      }}
    />
  )
}
