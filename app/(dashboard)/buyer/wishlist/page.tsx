'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Heart, Trash2, ShoppingCart, ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import type { WishlistItem } from '@/types/order'

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('buyer_id', user.id)
      .order('added_at', { ascending: false })

    setItems((data as WishlistItem[]) || [])
    setLoading(false)
  }

  const removeItem = async (id: string) => {
    setRemoving(id)
    const supabase = createClient()
    await supabase.from('wishlist_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setRemoving(null)
  }

  const moveToCart = async (item: WishlistItem) => {
    setAddingToCart(item.id)
    try {
      const supabase = createClient()

      // Check if already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('buyer_id', userId)
        .eq('product_id', item.product_id)
        .single()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({
          buyer_id: userId,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          vendor_id: item.vendor_id,
          vendor_name: item.vendor_name,
          price: item.price,
          pricing_type: item.pricing_type,
          quantity: 1,
          added_at: new Date().toISOString(),
        })
      }

      // Remove from wishlist after moving
      await removeItem(item.id)
    } catch (e) {
      console.error(e)
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-400">{items.length} saved item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
          <Heart size={32} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-700 text-gray-900 mb-2">No saved items yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Browse listings and tap the heart icon to save items for later
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all"
          >
            Browse Listings <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Image */}
              <Link href={`/listings/${item.product_id}`} className="block relative aspect-square bg-surface overflow-hidden">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={28} className="text-gray-300" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); removeItem(item.id) }}
                  disabled={removing === item.id}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                >
                  {removing === item.id
                    ? <Loader2 size={13} className="animate-spin text-gray-400" />
                    : <Heart size={13} className="text-red-500 fill-red-500" />}
                </button>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link href={`/listings/${item.product_id}`}>
                  <h3 className="font-display font-700 text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {item.product_name}
                  </h3>
                </Link>
                <p className="text-gray-400 text-xs mb-3">{item.vendor_name}</p>

                <div className="flex items-center justify-between mb-3">
                  {item.pricing_type === 'quote' ? (
                    <span className="text-primary font-700 text-sm">Price on request</span>
                  ) : (
                    <span className="font-display font-800 text-gray-900 text-sm">{formatPrice(item.price)}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => moveToCart(item)}
                    disabled={addingToCart === item.id || item.pricing_type === 'quote'}
                    className="flex items-center justify-center gap-1.5 bg-primary-light text-primary text-xs font-700 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    {addingToCart === item.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <ShoppingCart size={12} />}
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={removing === item.id}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 text-xs font-700 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-between items-center pt-2">
          <Link href="/listings" className="text-sm text-primary font-700 hover:underline">
            Continue browsing
          </Link>
          <Link
            href="/buyer/cart"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all"
          >
            <ShoppingCart size={14} /> View Cart
          </Link>
        </div>
      )}
    </div>
  )
}