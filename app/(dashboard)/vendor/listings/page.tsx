import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ShoppingBag, Edit, Eye, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

export default async function VendorListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('vendor_id, business_name')
    .eq('phone_number', user.phone ?? '')
    .single()

  if (!vendor) redirect('/vendor')

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.vendor_id)
    .order('created_at', { ascending: false })

  const products = (data as Product[]) || []
  const active = products.filter(p => p.is_active)
  const inactive = products.filter(p => !p.is_active)

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">My Listings</h1>
        <Link
          href="/vendor/listings/new"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all"
        >
          <Plus size={15} /> Add Listing
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: products.length },
          { label: 'Active',   value: active.length },
          { label: 'Inactive', value: inactive.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-card text-center">
            <p className="font-display font-800 text-gray-900 text-xl">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
          <ShoppingBag size={32} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-700 text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first product to start receiving orders</p>
          <Link
            href="/vendor/listings/new"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            <Plus size={15} /> Add First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0]
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-card flex items-center gap-4 p-4">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-gray-900 text-sm truncate">{product.name}</p>
                  <p className="text-gray-400 text-xs">{product.category}</p>
                  <p className="text-primary font-700 text-sm mt-0.5">
                    {product.pricing_type === 'quote' ? 'Price on request' : formatPrice(product.price)}
                  </p>
                </div>

                {/* Status + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                    product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listings/${product.id}`}
                      className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all"
                      title="View listing"
                    >
                      <Eye size={13} className="text-gray-400" />
                    </Link>
                    <Link
                      href={`/vendor/listings/${product.id}/edit`}
                      className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all"
                      title="Edit listing"
                    >
                      <Edit size={13} className="text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}