import type { ProductCondition } from '@/types/product'

export const SITE_NAME = 'Zolarux'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'
export const SITE_TAGLINE = 'Buy Gadgets Online Without Fear'
export const WHATSAPP_NUMBER = '2347063107314'

export const COLORS = {
  primary: '#4064D7',
  accent: '#FFA600',
} as const

// Real top categories in the catalogue (free-text column, matched with ilike '%cat%').
export const LISTING_CATEGORIES = [
  'All',
  'Phones & Tablets',
  'Laptops & Computers',
  'Accessories',
  'Home & Kitchen',
  'Gaming',
  'Cameras & Photography',
] as const

export type ListingCategory = typeof LISTING_CATEGORIES[number]

export const PRODUCT_CONDITIONS: readonly ProductCondition[] = ['new', 'uk_used', 'refurbished', 'used']

export const CONDITION_MAP: Record<ProductCondition, { label: string; className: string }> = {
  new:         { label: 'New',         className: 'text-verified bg-verified/12 border-verified/30' },
  uk_used:     { label: 'UK Used',     className: 'text-primary bg-primary/12 border-primary/30' },
  refurbished: { label: 'Refurbished', className: 'text-refurb bg-refurb/12 border-refurb/30' },
  used:        { label: 'Used',        className: 'text-ink-soft bg-ink-soft/12 border-ink-soft/30' },
}

export const LISTING_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const

export type ListingSort = typeof LISTING_SORT_OPTIONS[number]['value']

// Kept only for the unlinked app/(tools)/check-vendor page (out of Phase 1 scope).
export const VENDOR_STATUS_MAP = {
  verified:  { label: 'Verified Vendor',       safe: true,  className: 'text-verified bg-verified/12 border-verified/30', headerToken: 'var(--verified)' },
  pending:   { label: 'Pending Verification',  safe: false, className: 'text-action bg-action/14 border-action/35',       headerToken: 'var(--action)' },
  suspended: { label: 'Vendor Suspended',      safe: false, className: 'text-danger bg-danger/12 border-danger/30',        headerToken: 'var(--danger)' },
  rejected:  { label: 'Registration Rejected', safe: false, className: 'text-danger bg-danger/12 border-danger/30',        headerToken: 'var(--danger)' },
} as const

export const ORDER_PIPELINE = [
  { status: 'pending',   label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'completed', label: 'Completed' },
] as const

export const NAV_LINKS = [
  { label: 'The Guarantee', href: '/#the-guarantee' },
  { label: 'Reviews',       href: '/#reviews' },
  { label: 'About',         href: '/about' },
] as const

export const SHOP_MENU = [
  { label: 'Phones & Tablets',    href: '/listings?category=Phones+%26+Tablets' },
  { label: 'Laptops & Computers', href: '/listings?category=Laptops+%26+Computers' },
  { label: 'Accessories',         href: '/listings?category=Accessories' },
  { label: 'Home & Kitchen',      href: '/listings?category=Home+%26+Kitchen' },
  { label: 'Gaming',              href: '/listings?category=Gaming' },
  { label: 'New arrivals',        href: '/listings?sort=newest' },
  { label: 'Under ₦200k',    href: '/listings?maxPrice=200000' },
] as const
