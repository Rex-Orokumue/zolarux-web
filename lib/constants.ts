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
