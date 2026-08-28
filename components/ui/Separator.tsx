import * as RSeparator from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

export function Separator({
  orientation = 'horizontal',
  className,
}: {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <RSeparator.Root
      orientation={orientation}
      decorative
      className={cn('bg-line', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    />
  )
}
