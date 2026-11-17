import Link from 'next/link'

type OrderTrackingPageProps = { params: Promise<{ orderId: string }> }

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  await params

  return (
    <main className="page-width utility-page">
      <p className="eyebrow">FISH GUY ORDERS</p>
      <h1>Track your order</h1>
      <section className="orders-empty-state" role="status">
        <span className="orders-empty-mark" aria-hidden="true">—</span>
        <h2>Order tracking is not connected yet</h2>
        <p>Tracking can be shown once the food-order service is connected. No delivery status has been invented.</p>
        <Link href="/orders" className="button button-outline">View orders</Link>
      </section>
    </main>
  )
}
