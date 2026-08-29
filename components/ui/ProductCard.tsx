import Link from 'next/link'
import { MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react'
import { formatPriceMaybe, buildWhatsAppUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const price = formatPriceMaybe(product.price)
  const whatsappMsg = `Hi Zolarux, I'd like to order: ${product.name}${price ? ` (${price})` : ''}. Is it available?`

  return (
    <Card interactive className="group flex flex-col overflow-hidden">
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
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/listings/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 font-display text-sm font-bold text-ink transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 inline-flex items-center gap-1 text-xs text-ink-soft">
          <ShieldCheck size={12} className="text-verified" />
          Inspected by Zolarux
        </p>

        <div className="mt-auto flex items-center justify-between">
          {price ? (
            <span className="font-display text-base font-extrabold text-ink [font-variant-numeric:tabular-nums]">
              {price}
            </span>
          ) : (
            <span className="text-sm font-bold text-primary">Price on request</span>
          )}
          <Link
            href={buildWhatsAppUrl(whatsappMsg)}
            target="_blank"
            title="Order on WhatsApp"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-verified text-white transition-micro hover:brightness-110"
          >
            <MessageCircle size={14} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
