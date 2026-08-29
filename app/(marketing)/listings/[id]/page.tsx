import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import { formatPriceMaybe } from '@/lib/utils'
import { Gallery } from '@/components/ui/Gallery'
import { SpecsTable } from '@/components/ui/SpecsTable'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

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

  const imageUrl =
    product.main_image_url || product.image_url || product.image_urls?.[0] || null
  const images = Array.from(
    new Set([imageUrl, ...(product.image_urls || [])].filter(Boolean) as string[])
  )
  const price = formatPriceMaybe(product.price)

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

            {/* Task 12: trust panel + Order on WhatsApp + what-happens-next */}
          </div>
        </div>

        {/* Task 12: related products + ProductReviews */}
      </div>
    </div>
  )
}
