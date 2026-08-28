'use client'

import * as React from 'react'
import * as RAccordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

export interface AccordionItemData {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
}

export function Accordion({
  items,
  type = 'single',
  defaultValue,
}: {
  items: AccordionItemData[]
  type?: 'single' | 'multiple'
  defaultValue?: string
}) {
  const className = 'divide-y divide-line rounded-md border border-line'

  const inner = items.map((it) => (
    <RAccordion.Item key={it.value} value={it.value} className="px-4">
      <RAccordion.Header>
        <RAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left font-body font-600 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {it.trigger}
          <ChevronDown
            size={16}
            className="shrink-0 text-ink-soft transition-transform group-data-[state=open]:rotate-180"
          />
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className="overflow-hidden pb-4 text-sm text-ink-soft">
        {it.content}
      </RAccordion.Content>
    </RAccordion.Item>
  ))

  return type === 'single' ? (
    <RAccordion.Root type="single" collapsible defaultValue={defaultValue} className={className}>
      {inner}
    </RAccordion.Root>
  ) : (
    <RAccordion.Root type="multiple" className={className}>
      {inner}
    </RAccordion.Root>
  )
}
