import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const whatsappMsg = `Hi, I'm interested in "${product.name}" on Zolarux. Can I get more details?`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <Link href={`/listings/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.is_featured && <Badge variant="featured" />}
          {product.condition && <Badge variant="condition" condition={product.condition} />}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="verified" />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="font-display font-700 text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-3">
          {product.brand ? `${product.brand} · ${product.category}` : product.category}
        </p>

        <div className="flex items-center justify-between">
          <div>
            {product.pricing_type === 'quote' ? (
              <span className="text-primary font-700 text-sm">Price on request</span>
            ) : (
              <span className="font-display font-800 text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
          <Link
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            title="Inquire on WhatsApp"
          >
            <MessageCircle size={14} className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
}
