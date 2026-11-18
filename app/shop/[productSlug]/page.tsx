import { ShopEmptyState } from '@/components/shop/shop-empty-state'

export default function ProductPage() {
  return (
    <main className="page-width utility-page">
      <p className="eyebrow">FISH GUY · FROZEN FOOD</p>
      <h1>Product details</h1>
      <ShopEmptyState title="Product details are not available yet" description="This store does not have a connected food catalog, so product, price, and stock information cannot be shown." actionHref="/shop" actionLabel="Back to the shop" />
    </main>
  )
}
