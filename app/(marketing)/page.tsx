import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals } from '@/lib/products'
import { getReviewSummary } from '@/lib/reviews'
import { formatPriceMaybe } from '@/lib/utils'
import { HeroSequence } from '@/components/marketing/HeroSequence'
import { GuaranteeSteps } from '@/components/marketing/GuaranteeSteps'
import { ProductCard, Reveal } from '@/components/ui'

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

  // Consumed by the Task 9 proof section.
  void reviewSummary

  return (
    <div className="overflow-x-hidden">
      <HeroSequence product={hero} />

      {newArrivals.length > 0 && (
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">New arrivals</h2>
                <p className="mt-1 font-body text-ink-soft">Fresh stock, inspected and ready to ship.</p>
              </div>
              <Link
                href="/listings"
                className="hidden shrink-0 items-center gap-1 font-body text-sm font-semibold text-primary transition-micro hover:gap-2 sm:inline-flex"
              >
                Shop all <ArrowRight size={15} />
              </Link>
            </div>
            <Reveal>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newArrivals.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section id="the-guarantee" className="scroll-mt-20 bg-section py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              The Zolarux guarantee
            </p>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              You should never have to gamble on a gadget.
            </h2>
            <p className="mt-3 font-body text-lg text-ink-soft">
              Here is exactly what happens between you finding something and you being happy with it.
            </p>
          </div>
          <Reveal>
            <GuaranteeSteps />
          </Reveal>
          <p className="mt-10 font-display text-xl font-bold text-ink">
            If it is not exactly as described, you get a full refund. Every time.
          </p>
        </div>
      </section>

      {/* Task 9: <section id="reviews"> proof */}
      {/* Task 9: shop by category */}
      {/* Task 9: CTA band */}
    </div>
  )
}
