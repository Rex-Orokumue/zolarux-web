import type { ProductCondition } from '@/types/product'

export const SITE_NAME = 'Zolarux'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'
export const SITE_TAGLINE = 'Buy Gadgets Online Without Fear'
export const WHATSAPP_NUMBER = '2347063107314'

export const COLORS = {
  primary: '#4064D7',
  accent: '#FFA600',
} as const

// Gadgets-focused categories for Phase 1
export const LISTING_CATEGORIES = [
  'All',
  'Phones',
  'Laptops',
  'Accessories',
  'Electronics',
  'Gaming',
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

// Vendor registration categories (gadgets-first)
export const VENDOR_CATEGORIES = [
  'Phones & Tablets',
  'Laptops & Computers',
  'Accessories',
  'Electronics',
  'Gaming',
  'Other Gadgets',
] as const

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
  { label: 'For Buyers',   href: '/for-buyers' },
  { label: 'For Vendors',  href: '/for-vendors' },
  { label: 'Listings',     href: '/listings' },
  { label: 'About',        href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
] as const

export const TRUST_TOOLS = [
  { label: 'Check Vendor',    href: '/check-vendor',   icon: 'shield-check' },
  { label: 'Check Device',    href: '/check-device',   icon: 'smartphone' },
  { label: 'Verify Original', href: '/check-original', icon: 'scan' },
  { label: 'Report Stolen',   href: '/report-item',    icon: 'flag' },
  { label: 'Scan a Link',     href: '/scan-link',      icon: 'link' },
] as const
