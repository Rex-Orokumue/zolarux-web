import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Shield, MessageCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react'
import type { Product } from '@/types/product'

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
    description: `Buy ${product.name} safely on Zolarux. Vendor verified, escrow protected. ${product.pricing_type === 'fixed' ? formatPrice(product.price) : 'Price on request'}.`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const imageUrl = product.main_image_url || product.image_url || (product.image_urls?.[0]) || null
  const allImages = [imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[]
  const whatsappMsg = `Hi, I want to buy "${product.name}" on Zolarux. Can you help me start the escrow process?`

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-card">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No image available
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.slice(0, 5).map((img, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-100"
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Verified badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-700 px-3 py-1.5 rounded-full mb-4">
              <Shield size={11} />
              Verified Listing · Escrow Protected
            </div>

            <h1 className="font-display text-3xl font-800 text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-4">{product.category}</p>

            <div className="mb-6">
              {product.pricing_type === 'quote' ? (
                <p className="font-display text-2xl font-800 text-primary">Price on Request</p>
              ) : (
                <p className="font-display text-3xl font-800 text-gray-900">{formatPrice(product.price)}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">+ small escrow protection fee</p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-display font-700 text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Vendor */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
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

            {/* CTA */}
            <Link
              href={`https://wa.me/2347063107314?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 mb-4"
            >
              <MessageCircle size={18} />
              Start Escrow Purchase
            </Link>

            {/* Trust note */}
            <div className="flex items-start gap-2 bg-primary-light rounded-xl p-4">
              <Lock size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-primary text-xs leading-relaxed">
                Your payment is held by Zolarux — not the vendor. It is only released
                after you confirm you have received your item and are satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
