import type { ProductCondition } from '@/types/product'

export const SITE_NAME = 'Zolarux'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zolarux.com.ng'
export const SITE_TAGLINE = 'Buy Gadgets Online Without Fear'
export const WHATSAPP_NUMBER = '2348120288390'

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

export const CONDITION_MAP: Record<ProductCondition, { label: string; color: string; bg: string; border: string }> = {
  new: {
    label: 'New',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-900',
  },
  uk_used: {
    label: 'UK Used',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900',
  },
  refurbished: {
    label: 'Refurbished',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900',
  },
  used: {
    label: 'Used',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
  },
}

export const LISTING_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const

export type ListingSort = typeof LISTING_SORT_OPTIONS[number]['value']

// Keyword groups so a broad filter also matches sub-type products
// (e.g. clicking "Accessories" surfaces earpods, power banks, selfie sticks).
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Phones: ['phone', 'smartphone', 'iphone', 'android', 'tablet', 'ipad', 'galaxy'],
  Laptops: ['laptop', 'computer', 'macbook', 'notebook', 'desktop', 'monitor'],
  Accessories: ['accessor', 'earpod', 'airpod', 'earphone', 'headphone', 'headset',
    'charger', 'cable', 'power bank', 'powerbank', 'selfie', 'tripod', 'case',
    'cover', 'screen protector', 'adapter', 'smartwatch', 'watch band',
    'memory card', 'flash drive', 'mouse', 'keyboard'],
  Electronics: ['electronic', 'iron', 'kettle', 'blender', 'fan', 'microwave',
    'appliance', 'speaker', 'soundbar', 'television', 'home theatre',
    'home theater', 'generator', 'stabilizer', 'inverter', 'camera',
    'projector', 'woofer'],
  Gaming: ['game', 'gaming', 'console', 'playstation', 'ps4', 'ps5', 'xbox',
    'nintendo', 'controller', 'joystick'],
}

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
  verified: {
    label: 'Verified Vendor',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerBg: '#16a34a',
    safe: true,
  },
  pending: {
    label: 'Pending Verification',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    headerBg: '#d97706',
    safe: false,
  },
  suspended: {
    label: 'Vendor Suspended',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    headerBg: '#dc2626',
    safe: false,
  },
  rejected: {
    label: 'Registration Rejected',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    headerBg: '#dc2626',
    safe: false,
  },
} as const

export const ORDER_PIPELINE = [
  { status: 'pending',   label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'completed', label: 'Completed' },
] as const

export const NAV_LINKS = [
  { label: 'Gadgets',      href: '/listings' },
  { label: 'How to Buy',   href: '/for-buyers' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About',        href: '/about' },
  { label: 'Contact',      href: '/contact' },
] as const

export const TRUST_TOOLS = [
  { label: 'Check Vendor',    href: '/check-vendor',   icon: 'shield-check' },
  { label: 'Check Device',    href: '/check-device',   icon: 'smartphone' },
  { label: 'Verify Original', href: '/check-original', icon: 'scan' },
  { label: 'Report Stolen',   href: '/report-item',    icon: 'flag' },
  { label: 'Scan a Link',     href: '/scan-link',      icon: 'link' },
] as const
