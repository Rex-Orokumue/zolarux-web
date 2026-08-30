'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'
import { Field, Input, Textarea, Select, Button } from '@/components/ui'

const SUBJECTS = [
  { value: 'Order help', label: 'Order help' },
  { value: 'Product question', label: 'Product question' },
  { value: 'Refund', label: 'Refund' },
  { value: 'Something else', label: 'Something else' },
]

export function ContactForm() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0].value)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: { name?: string; message?: string } = {}
    if (!name.trim()) next.name = 'Tell us your name'
    if (!message.trim()) next.message = 'Add a short message'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const composed = `Hi Zolarux — ${subject}\n\nFrom: ${name.trim()}\n\n${message.trim()}`
    window.open(buildWhatsAppUrl(composed), '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your name" htmlFor="c-name" error={errors.name}>
        <Input
          id="c-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          invalid={!!errors.name}
          placeholder="Ada Obi"
        />
      </Field>

      <Field label="What's it about?" htmlFor="c-subject">
        <Select
          aria-label="What's it about?"
          value={subject}
          onValueChange={setSubject}
          options={SUBJECTS}
        />
      </Field>

      <Field label="Message" htmlFor="c-message" error={errors.message}>
        <Textarea
          id="c-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          invalid={!!errors.message}
          placeholder="How can we help?"
          className="min-h-32"
        />
      </Field>

      <Button type="submit" className="w-full">
        <MessageCircle size={16} />
        Send on WhatsApp
      </Button>
      <p className="font-body text-xs text-ink-soft">
        This opens WhatsApp with your message ready to send.
      </p>
    </form>
  )
}
