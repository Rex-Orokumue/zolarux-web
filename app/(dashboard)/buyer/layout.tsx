import Link from 'next/link'
import { Home, Package, ShoppingCart, Heart, User } from 'lucide-react'

const NAV = [
  { label: 'Dashboard',  href: '/buyer',          icon: Home },
  { label: 'My Orders',  href: '/buyer/orders',   icon: Package },
  { label: 'Cart',       href: '/buyer/cart',      icon: ShoppingCart },
  { label: 'Wishlist',   href: '/buyer/wishlist',  icon: Heart },
  { label: 'Profile',    href: '/buyer/profile',   icon: User },
]

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <aside className="w-48 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-20">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-600 text-gray-600 hover:bg-white hover:text-primary hover:shadow-card transition-all"
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400 hover:text-primary transition-colors"
          >
            <Icon size={18} />
            <span className="text-xs font-600">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
