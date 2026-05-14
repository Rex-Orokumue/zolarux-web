import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, Package, TrendingUp, Shield,
  AlertTriangle, CheckCircle, ArrowRight, Plus
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get vendor record
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('phone_number', user.phone ?? '')
    .single()

  if (!vendor) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
        <AlertTriangle size={28} className="text-amber-500 mx-auto mb-4" />
        <h2 className="font-display text-xl font-800 text-gray-900 mb-2">Vendor Profile Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your phone number is not linked to a verified vendor account.
          Apply to become a vendor or contact us for support.
        </p>
        <Link href="/register/vendor" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all">
          Apply as Vendor <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  // Get recent orders for this vendor
  const { data: ordersData } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendor.vendor_id)
    .order('created_at', { ascending: false })
    .limit(5)
  const orders = (ordersData as Order[]) || []

  // Get active listings count
  const { count: listingsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.vendor_id)
    .eq('is_active', true)

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalEarned = completedOrders.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Vendor header */}
      <div className="bg-gray-950 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-display font-800 text-white">{vendor.business_name?.[0]}</span>
              </div>
              <div>
                <h1 className="font-display text-xl font-800 text-white">{vendor.business_name}</h1>
                <p className="text-gray-400 text-xs font-mono">{vendor.vendor_id}</p>
              </div>
            </div>
          </div>
          {vendor.status === 'verified' ? (
            <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5 shrink-0">
              <Shield size={12} className="text-green-400" />
              <span className="text-green-400 text-xs font-700">Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5 shrink-0">
              <AlertTriangle size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-700">{vendor.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Listings',  value: listingsCount ?? 0,      icon: ShoppingBag,  color: 'text-primary bg-primary-light' },
          { label: 'Pending Orders',   value: pendingOrders.length,    icon: Package,      color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed Orders', value: completedOrders.length,  icon: CheckCircle,  color: 'text-green-600 bg-green-50' },
          { label: 'Total Earned',     value: formatPrice(totalEarned), icon: TrendingUp,   color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={15} />
            </div>
            <p className="font-display font-800 text-gray-900 text-sm">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-display font-700 text-gray-900">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-xs text-primary font-700 hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-700 text-gray-900 text-sm truncate">{order.product_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.order_ref} · {formatDate(order.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-700 text-gray-900 text-sm">{formatPrice(order.amount)}</p>
                  <span className={`text-xs font-700 ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'disputed' ? 'text-red-500' :
                    'text-amber-600'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="font-display font-700 text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Add New Listing',  href: '/vendor/listings/new', icon: Plus,         color: 'bg-primary text-white', primary: true },
            { label: 'View Listings',    href: '/vendor/listings',     icon: ShoppingBag,  color: 'bg-primary-light text-primary' },
            { label: 'View Orders',      href: '/vendor/orders',       icon: Package,      color: 'bg-amber-50 text-amber-600' },
            { label: 'Edit Profile',     href: '/vendor/profile',      icon: Shield,       color: 'bg-green-50 text-green-600' },
          ].map(({ label, href, icon: Icon, color, primary }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all group ${
                primary
                  ? 'bg-primary border-primary text-white hover:bg-primary-dark'
                  : 'bg-surface border-gray-100 hover:border-primary hover:bg-primary-light'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${primary ? 'bg-white/20' : color}`}>
                <Icon size={15} className={primary ? 'text-white' : ''} />
              </div>
              <span className={`font-600 text-sm ${primary ? 'text-white' : 'text-gray-700 group-hover:text-primary transition-colors'}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}