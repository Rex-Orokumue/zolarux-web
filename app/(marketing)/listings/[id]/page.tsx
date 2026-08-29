import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { CheckCircle, Lock, ArrowLeft, MessageCircle } from 'lucide-react'
import { Gallery } from '@/components/ui/Gallery'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/ui/ProductCard'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: `Buy ${product.name} safely on Zolarux. Vendor verified, escrow protected. ${product.pricing_type === 'fixed' ? formatPrice(product.price ?? 0) : 'Price on request'}.`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const allImages = [imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[]
  const uniqueImages = Array.from(new Set(allImages))
  const whatsappMsg = `Hi, I want to buy "${product.name}" on Zolarux. Can you help me start the escrow process?`
  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className="py-10 bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Gallery images={uniqueImages} alt={product.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="verified" />
              {product.condition && <Badge variant="condition" condition={product.condition} />}
            </div>

            <h1 className="font-display text-3xl font-800 text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-4">
              {product.brand ? `${product.brand} · ${product.category}` : product.category}
            </p>

            <div className="mb-6">
              {product.pricing_type === 'quote' ? (
                <p className="font-display text-2xl font-800 text-primary">Price on Request</p>
              ) : (
                <p className="font-display text-3xl font-800 text-gray-900">{formatPrice(product.price ?? 0)}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">+ small escrow protection fee</p>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-display font-700 text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <SpecsTable specs={product.specs} />

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

            <Link
              href={buildWhatsAppUrl(whatsappMsg)}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 mb-4"
            >
              <MessageCircle size={18} />
              Start Escrow Purchase
            </Link>

            <div className="flex items-start gap-2 bg-primary-light rounded-xl p-4">
              <Lock size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-primary text-xs leading-relaxed">
                Your payment is held by Zolarux — not the vendor. It is only released
                after you confirm you have received your item and are satisfied.
              </p>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-800 text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
