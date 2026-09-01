import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals } from '@/lib/products'
import { getReviewSummary } from '@/lib/reviews'
import { formatPriceMaybe } from '@/lib/utils'
import { HeroSequence } from '@/components/marketing/HeroSequence'
import { GuaranteeSteps } from '@/components/marketing/GuaranteeSteps'
import { Button, Card, ProductCard, Reveal, ReviewSummary, StatTile } from '@/components/ui'
import { LISTING_CATEGORIES } from '@/lib/constants'

const TESTIMONIALS = [
  {
    quote:
      'Ordered a UK-used MacBook. It arrived exactly as described — I checked it fully before paying the delivery guy. Smooth.',
    name: 'Adebayo O.',
    city: 'Abuja',
  },
  {
    quote:
      'I was nervous buying a phone online after being scammed once. Zolarux let me inspect first. That changed everything.',
    name: 'Chioma N.',
    city: 'Lagos',
  },
  {
    quote:
      'Fast replies on WhatsApp, honest about a small scratch before I ordered. Will buy again.',
    name: 'Tunde M.',
    city: 'Port Harcourt',
  },
]

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

      <section id="reviews" className="scroll-mt-20 bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 rounded-lg bg-hero-primary p-8 sm:grid-cols-4 sm:p-10">
            <StatTile value="₦2M+" label="Protected in orders" variant="dark" />
            <StatTile value="100+" label="Gadgets delivered" variant="dark" />
            <StatTile value="0" label="Confirmed scams" variant="dark" />
            <StatTile value="5 yrs" label="Doing this" variant="dark" />
          </div>

          <div className="mt-12">
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">What buyers say</h2>
            {reviewSummary.count > 0 && (
              <div className="mt-3">
                <ReviewSummary average={reviewSummary.average} count={reviewSummary.count} compact />
              </div>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name}>
                  <div className="p-6">
                    <p className="font-body text-sm leading-relaxed text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-4 font-body text-sm font-semibold text-ink">
                      {t.name} · {t.city}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-4 font-body text-xs text-ink-soft">
              Placeholder — replace with real buyer quotes (spec §17).
            </p>
          </div>
        </div>
      </section>

      <section className="bg-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-8 font-display text-2xl font-extrabold text-ink sm:text-3xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {LISTING_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <Link
                key={cat}
                href={`/listings?category=${encodeURIComponent(cat)}`}
                className="rounded-md border border-line bg-surface p-5 text-center font-display text-sm font-bold text-ink transition-lift hover-lift"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-hero-primary py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Ready to buy without the anxiety?
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-lg text-white/80">
            Browse the catalogue. Every unit is inspected. Every order is guaranteed or refunded.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings">
                Shop gadgets <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
