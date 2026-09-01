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

export const ORDER_PIPELINE = [
  { status: 'pending',   label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'completed', label: 'Completed' },
] as const

export const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Reviews',      href: '/#reviews' },
  { label: 'About',        href: '/about' },
] as const

export const HELP_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'FAQ',          href: '/faq' },
  { label: 'Contact',      href: '/contact' },
] as const

export const SAFETY_TOOLS = [
  { label: 'Check a device',         href: '/check-device',   icon: 'smartphone',  desc: 'Is this used phone stolen? Check the IMEI.' },
  { label: "Verify it's genuine",    href: '/check-original', icon: 'scan-search', desc: "Confirm a serial number on the maker's own site." },
  { label: 'Report a stolen device', href: '/report-item',    icon: 'flag',        desc: 'Add a stolen phone or laptop to the registry.' },
  { label: 'Scan a link',            href: '/scan-link',      icon: 'link',        desc: 'Paste a listing link — we check it for scam signs.' },
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
