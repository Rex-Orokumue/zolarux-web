import type { Metadata } from 'next'
import { getFeaturedProducts, getNewArrivals } from '@/lib/products'
import { getReviewSummary } from '@/lib/reviews'
import { formatPriceMaybe } from '@/lib/utils'
import { HeroSequence } from '@/components/marketing/HeroSequence'

export const metadata: Metadata = {
  title: 'Zolarux — Buy phones, laptops & gadgets you can trust',
  description:
    'We source and inspect every gadget before it ships. You inspect it on delivery. Not as described? Full refund. Order on WhatsApp.',
}

export default async function HomePage() {
  const [featured, newArrivals, reviewSummary] = await Promise.all([
    getFeaturedProducts(4),
    getNewArrivals(8),
    getReviewSummary(),
  ])

  const heroProduct = featured[0] ?? newArrivals[0] ?? null
  const hero = heroProduct
    ? {
        id: heroProduct.id,
        name: heroProduct.name,
        imageUrl:
          heroProduct.main_image_url || heroProduct.image_url || heroProduct.image_urls?.[0] || null,
        price: formatPriceMaybe(heroProduct.price),
      }
    : null

  // `newArrivals` and `reviewSummary` are consumed by Tasks 8–9 sections.
  void newArrivals
  void reviewSummary

  return (
    <div className="overflow-x-hidden">
      <HeroSequence product={hero} />

      {/* Task 8: new-arrivals rail */}
      {/* Task 8: <section id="the-guarantee"> */}
      {/* Task 9: <section id="reviews"> proof */}
      {/* Task 9: shop by category */}
      {/* Task 9: CTA band */}
    </div>
  )
}
