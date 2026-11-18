import Link from 'next/link'

export default function OrdersPage() {
  return (
    <main className="page-width utility-page">
      <p className="eyebrow">YOUR FISH GUY ACCOUNT</p>
      <h1>Orders</h1>
      <section className="orders-empty-state" role="status">
        <span className="orders-empty-mark" aria-hidden="true">—</span>
        <h2>Order history is not connected yet</h2>
        <p>There is no food-order data source in this workspace, so orders and tracking updates cannot be displayed.</p>
        <Link href="/shop" className="button button-outline">Browse frozen food</Link>
      </section>
    </main>
  )
}
