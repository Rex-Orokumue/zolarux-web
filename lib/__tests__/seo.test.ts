import { describe, it, expect } from 'vitest'
import { productSchema, faqSchema, breadcrumbSchema } from '@/lib/seo'

describe('seo schemas', () => {
  it('builds a Product with offers for fixed price', () => {
    const s: any = productSchema({ id: '1', name: 'iPhone 12', price: 320000, pricing_type: 'fixed' })
    expect(s['@type']).toBe('Product')
    expect(s.offers.price).toBe(320000)
    expect(s.offers.priceCurrency).toBe('NGN')
    expect(s.offers.availability).toContain('schema.org')
  })
  it('omits price for quote items', () => {
    const s: any = productSchema({ id: '1', name: 'Generator', price: 0, pricing_type: 'quote' })
    expect(s.offers.price).toBeUndefined()
  })
  it('builds FAQPage with questions', () => {
    const s: any = faqSchema([{ q: 'Is it safe?', a: 'Yes, escrow.' }])
    expect(s['@type']).toBe('FAQPage')
    expect(s.mainEntity[0]['@type']).toBe('Question')
    expect(s.mainEntity[0].acceptedAnswer.text).toBe('Yes, escrow.')
  })
  it('builds breadcrumb positions', () => {
    const s: any = breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Listings', path: '/listings' }])
    expect(s.itemListElement[1].position).toBe(2)
  })
})
