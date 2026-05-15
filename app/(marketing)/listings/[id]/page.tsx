import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, calculateProtectionFee } from '@/lib/utils'
import { Shield, ArrowLeft, CheckCircle, Lock, MessageCircle, Info } from 'lucide-react'
import type { Product } from '@/types/product'
import ListingActions from './ListingActions'

interface Props {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  if (error || !data) return null
  return data as Product
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: `Buy ${product.name} safely on Zolarux. Vendor verified, escrow protected.`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const allImages = [imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[]
  const protectionFee = product.pricing_type === 'fixed' ? calculateProtectionFee(product.price) : 2000
  const whatsappMsg = `Hi, I want to buy "${product.name}" on Zolarux. Can you help me start the escrow process?`

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-card">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.slice(0, 5).map((img, i) => (
                  <div key={i} className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-100">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-700 px-3 py-1.5 rounded-full mb-4">
              <Shield size={11} /> Verified Listing · Escrow Protected
            </div>

            <h1 className="font-display text-3xl font-800 text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{product.category}</p>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
              {product.pricing_type === 'quote' ? (
                <p className="font-display text-2xl font-800 text-primary">Price on Request</p>
              ) : (
                <>
                  <p className="font-display text-3xl font-800 text-gray-900">{formatPrice(product.price)}</p>
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Product price</span>
                      <span className="font-600 text-gray-700">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        Protection fee
                        <Info size={12} className="text-gray-400" />
                      </span>
                      <span className="font-600 text-primary">{formatPrice(protectionFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-700 pt-1.5 border-t border-gray-50">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(product.price + protectionFee)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-display font-700 text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Vendor */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-display font-700">{product.vendor_name?.[0] || 'V'}</span>
                </div>
                <div>
                  <p className="font-700 text-gray-900 text-sm">{product.vendor_name || 'Verified Vendor'}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={11} />
                    <span>Zolarux Verified Vendor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons — client component */}
            <ListingActions
              product={product}
              protectionFee={protectionFee}
              isLoggedIn={!!user}
              userEmail={user?.email || ''}
              userId={user?.id || ''}
            />

            {/* Trust note */}
            <div className="flex items-start gap-2 bg-primary-light rounded-xl p-4 mt-4">
              <Lock size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-primary text-xs leading-relaxed">
                Your payment is held by Zolarux — not the vendor. Released only after you confirm delivery and satisfaction.
              </p>
            </div>

            {/* WhatsApp fallback */}
            <Link
              href={`https://wa.me/2347063107314?text=${encodeURIComponent(`Hi, I'm interested in "${product.name}" on Zolarux`)}`}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 text-sm font-600 py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <MessageCircle size={15} />
              Have questions? Chat on WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}