import Link from 'next/link'
import { MessageCircle, ShoppingBag } from 'lucide-react'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const whatsappMsg = `Hi, I'm interested in "${product.name}" on Zolarux. Can I get more details?`

  return (
    <Card interactive className="group overflow-hidden">
      <Link
        href={`/listings/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-primary-soft"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={32} className="text-ink-soft" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_featured && <Badge variant="featured" />}
          {product.condition && <Badge variant="condition" condition={product.condition} />}
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="verified" />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 font-display text-sm font-bold text-ink transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 text-xs text-ink-soft">
          {product.brand ? `${product.brand} · ${product.category}` : product.category}
        </p>

        <div className="flex items-center justify-between">
          {product.pricing_type === 'quote' ? (
            <span className="text-sm font-bold text-primary">Price on request</span>
          ) : (
            <span className="font-display text-base font-extrabold text-ink [font-variant-numeric:tabular-nums]">
              {formatPrice(product.price ?? 0)}
            </span>
          )}
          <Link
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            title="Inquire on WhatsApp"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-verified text-white transition-micro hover:brightness-110"
          >
            <MessageCircle size={14} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
