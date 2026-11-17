import Link from 'next/link'
import { ShopEmptyState } from '@/components/shop/shop-empty-state'

const categories = [
  { label: 'Frozen fish', slug: 'fish' },
  { label: 'Chicken', slug: 'chicken' },
  { label: 'Turkey', slug: 'turkey' },
  { label: 'Shrimp', slug: 'shrimp' },
  { label: 'Meat', slug: 'meat' },
  { label: 'Ready meals', slug: 'ready-meals' },
]

type ShopPageProps = { searchParams: Promise<{ category?: string }> }

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams
  const selectedCategory = categories.find((item) => item.slug === category)

  return (
    <main className="page-width shop-listing-page">
      <p className="eyebrow">FISH GUY · FROZEN FOOD, LAGOS</p>
      <div className="shop-listing-heading">
        <div><h1>{selectedCategory?.label ?? 'Shop frozen food'}</h1><p>Browse the current frozen-food catalog.</p></div>
        <Link href="/" className="text-link">Back to home</Link>
      </div>
      <nav className="shop-filter-list" aria-label="Product categories">
        <Link href="/shop" aria-current={!selectedCategory ? 'page' : undefined}>All products</Link>
        {categories.map((item) => <Link href={`/shop?category=${item.slug}`} aria-current={selectedCategory?.slug === item.slug ? 'page' : undefined} key={item.slug}>{item.label}</Link>)}
      </nav>
      <section id="products" aria-label="Products">
        <ShopEmptyState title="No products yet" description="The food catalog is not connected to this store yet. Product details, prices, and stock will appear here when the live catalog is available." actionHref="/" actionLabel="Return to the shop home" />
      </section>
    </main>
  )
}
