'use client'

import { Button, toast } from '@/components/ui'

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast('Listing saved')}>
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success('Vendor verified')}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.error('Could not reach vendor')}>
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast('Payout released', { description: 'The deal continues on WhatsApp.' })}
      >
        With description
      </Button>
    </div>
  )
}
