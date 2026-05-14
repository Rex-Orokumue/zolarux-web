import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, ShoppingBag, Shield, ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:          { label: 'Pending',         color: 'text-amber-600 bg-amber-50',  icon: Clock },
  confirmed:        { label: 'Confirmed',        color: 'text-blue-600 bg-blue-50',    icon: CheckCircle },
  in_transit:       { label: 'In Transit',       color: 'text-purple-600 bg-purple-50', icon: Package },
  delivered:        { label: 'Delivered',        color: 'text-green-600 bg-green-50',  icon: CheckCircle },
  completed:        { label: 'Completed',        color: 'text-green-700 bg-green-100', icon: CheckCircle },
  disputed:         { label: 'Disputed',         color: 'text-red-600 bg-red-50',      icon: AlertTriangle },
  dispute_resolved: { label: 'Resolved',         color: 'text-gray-600 bg-gray-100',   icon: CheckCircle },
  cancelled:        { label: 'Cancelled',        color: 'text-gray-500 bg-gray-50',    icon: AlertTriangle },
}

async function getBuyerOrders(phone: string): Promise<Order[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_phone', phone)
    .order('created_at', { ascending: false })
    .limit(5)
  return (data as Order[]) || []
}

export default async function BuyerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const phone = user?.phone ?? ''
  const orders = await getBuyerOrders(phone)

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.amount, 0)

  // Get buyer name from buyers table
  const { data: profile } = await supabase
    .from('buyers')
    .select('full_name')
    .eq('id', user?.id ?? '')
    .single()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm mb-1">Welcome back</p>
        <h1 className="font-display text-2xl font-800">Hi, {firstName}! 👋</h1>
        <p className="text-white/60 text-sm mt-1">{phone}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Orders',    value: activeOrders.length,    icon: Package,     color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed',        value: completedOrders.length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Total Spent',      value: totalSpent > 0 ? formatPrice(totalSpent) : '₦0', icon: Shield, color: 'text-primary bg-primary-light' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card text-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
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
          <Link href="/buyer/orders" className="text-xs text-primary font-700 hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No orders yet</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 mt-4 bg-primary text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all"
            >
              Browse Listings <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
                      <Package size={15} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-700 text-gray-900 text-sm truncate">{order.product_name}</p>
                      <p className="text-gray-400 text-xs font-mono">{order.order_ref}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="font-700 text-gray-900 text-sm">{formatPrice(order.amount)}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-700 px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <Icon size={10} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="font-display font-700 text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Browse Listings',  href: '/listings',      icon: ShoppingBag, color: 'bg-primary-light text-primary' },
            { label: 'Check a Vendor',   href: '/check-vendor',  icon: Shield,      color: 'bg-green-50 text-green-600' },
            { label: 'Check Device',     href: '/check-device',  icon: Package,     color: 'bg-red-50 text-red-500' },
            { label: 'Scan a Link',      href: '/scan-link',     icon: ArrowRight,  color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 p-3.5 bg-surface rounded-xl border border-gray-100 hover:border-primary hover:bg-primary-light transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={15} />
              </div>
              <span className="font-600 text-gray-700 text-sm group-hover:text-primary transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}