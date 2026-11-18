import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Beef, Clock3, CookingPot, Drumstick, Fish, MapPin, Shell, Soup } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DeliveryArea, FeaturedPromotion, MusicTrack } from '@/lib/music-data'
import { DeliveryAreaChecker } from '@/components/shop/delivery-area-checker'
import { FeaturedPromotionStrip } from '@/components/music/featured-promotion-strip'
import { FreeStreamStrip } from '@/components/shop/free-stream-strip'
import { ShopEmptyState } from '@/components/shop/shop-empty-state'

const categories: { label: string; slug: string; icon: LucideIcon }[] = [
  { label: 'Frozen fish', slug: 'fish', icon: Fish },
  { label: 'Chicken', slug: 'chicken', icon: Drumstick },
  { label: 'Turkey', slug: 'turkey', icon: Beef },
  { label: 'Shrimp', slug: 'shrimp', icon: Shell },
  { label: 'Meat', slug: 'meat', icon: Beef },
  { label: 'Ready meals', slug: 'ready-meals', icon: Soup },
]

const deliverySteps = [
  { title: 'Choose your area', detail: 'See delivery options for your Lagos address.', icon: MapPin },
  { title: 'Choose a time slot', detail: 'Pick from the slots available for your area.', icon: Clock3 },
  { title: 'Pay with Monnify', detail: 'Complete checkout securely in naira.', icon: CookingPot },
]

export function StorefrontHome({
  freeTracks,
  deliveryAreas,
  featuredPromotions,
}: {
  freeTracks: MusicTrack[]
  deliveryAreas: DeliveryArea[]
  featuredPromotions: FeaturedPromotion[]
}) {
  return (
    <main className="page-width shop-home">
      <section className="shop-hero" aria-labelledby="shop-title">
        <div className="shop-hero-copy">
          <p className="eyebrow">FISH GUY · FROZEN FOOD, LAGOS</p>
          <h1 id="shop-title">Good food,<br />kept cold.<br /><em>Delivered across Lagos.</em></h1>
          <p className="shop-hero-description">Your frozen-food shop for Lagos. Choose a delivery slot that works for your area, and get your order delivered cold.</p>
          <Link href="/shop" className="button button-gold">Order now <ArrowRight aria-hidden="true" /></Link>
          <p className="delivery-note">Delivery slots are shown for your area when you place an order.</p>
        </div>
        <div className="shop-hero-art">
          <Image src="/frozen-food-hero.png" alt="Vacuum-sealed frozen fish and prawns on crushed ice" fill priority sizes="(max-width: 680px) 100vw, 54vw" />
          <span className="hero-art-caption">FROZEN WITH CARE · LAGOS</span>
        </div>
      </section>

      <FeaturedPromotionStrip campaigns={featuredPromotions} title="Featured on Fish Guy" />
      <DeliveryAreaChecker areas={deliveryAreas} />

      <section className="shop-section category-section" id="categories" aria-labelledby="categories-title">
        <div className="shop-section-heading">
          <div><p className="eyebrow">FIND YOUR FAVOURITES</p><h2 id="categories-title">Shop by category</h2></div>
          <Link href="/shop" className="text-link">Browse all <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="category-grid">
          {categories.map(({ label, slug, icon: Icon }) => (
            <Link className="category-card" href={`/shop?category=${slug}`} key={slug}>
              <span className="category-icon"><Icon aria-hidden="true" /></span>
              <span>{label}</span>
              <ArrowRight className="category-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="shop-section product-section" id="products" aria-labelledby="products-title">
        <div className="shop-section-heading">
          <div><p className="eyebrow">FROM OUR FREEZER TO YOUR TABLE</p><h2 id="products-title">Frozen food</h2></div>
          <Link href="/shop" className="text-link">Shop all <ArrowRight aria-hidden="true" /></Link>
        </div>
        <ShopEmptyState
          title="No products yet"
          description="The food catalog is not connected to this store yet. Products and prices will appear here once the live catalog is available."
          actionHref="/shop"
          actionLabel="Browse the shop"
        />
      </section>

      <section className="shop-section delivery-section" aria-labelledby="delivery-title">
        <div className="shop-section-heading">
          <div><p className="eyebrow">SIMPLE FROM START TO DOOR</p><h2 id="delivery-title">How delivery works</h2></div>
        </div>
        <ol className="delivery-steps">
          {deliverySteps.map(({ title, detail, icon: Icon }, index) => (
            <li className="delivery-step" key={title}>
              <span className="step-number">0{index + 1}</span>
              <Icon className="step-icon" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <FreeStreamStrip tracks={freeTracks} />
    </main>
  )
}
