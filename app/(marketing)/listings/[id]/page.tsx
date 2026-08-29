import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { formatPriceMaybe, buildWhatsAppUrl } from '@/lib/utils'
import { Gallery } from '@/components/ui/Gallery'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductReviews } from '@/components/ui/ProductReviews'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product not found' }
  const price = formatPriceMaybe(product.price)
  return {
    title: product.name,
    description: `${product.name} — inspected by Zolarux, guaranteed or refunded.${price ? ` ${price}.` : ''}`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, product.id)

  const imageUrl =
    product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const images = Array.from(
    new Set([imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[])
  )
  const price = formatPriceMaybe(product.price)
  const orderMsg = `Hi Zolarux, I'd like to order: ${product.name}${price ? ` (${price})` : ''}. Is it available?`

  return (
    <div className="bg-background py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/listings' },
            ...(product.category
              ? [{ label: product.category, href: `/listings?category=${encodeURIComponent(product.category)}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Gallery images={images} alt={product.name} />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.is_featured && <Badge variant="featured" />}
              {product.condition && <Badge variant="condition" condition={product.condition} />}
            </div>

            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{product.name}</h1>

            <div className="mt-4">
              {price ? (
                <p className="font-display text-3xl font-extrabold text-ink [font-variant-numeric:tabular-nums]">
                  {price}
                </p>
              ) : (
                <p className="font-display text-2xl font-extrabold text-primary">Price on request</p>
              )}
              <p className="mt-1 font-body text-sm text-ink-soft">
                Inspected before dispatch · Delivery arranged when you order
              </p>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-display font-bold text-ink">Description</h2>
                <p className="whitespace-pre-line font-body text-sm leading-relaxed text-ink-soft">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-6">
              <SpecsTable specs={product.specs} />
            </div>

            <div className="mt-6 space-y-4">
              <a
                href={buildWhatsAppUrl(orderMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-verified py-4 font-display text-base font-bold text-white transition-micro hover:brightness-110"
              >
                <MessageCircle size={18} />
                Order on WhatsApp
              </a>

              <Card variant="flat">
                <div className="space-y-3 p-5">
                  <p className="inline-flex items-center gap-2 font-display text-sm font-bold text-ink">
                    <ShieldCheck size={16} className="text-verified" />
                    Guaranteed or refunded
                  </p>
                  <ol className="space-y-2 font-body text-sm text-ink-soft">
                    <li>1. Message us — we confirm stock, condition and delivery.</li>
                    <li>2. Pay, and we dispatch your inspected unit.</li>
                    <li>3. Inspect it on delivery. Not as described? Full refund.</li>
                  </ol>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} />

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">More gadgets like this</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
