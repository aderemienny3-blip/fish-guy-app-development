import Link from 'next/link'

export default function CheckoutPage() {
  return (
    <main className="page-width utility-page">
      <p className="eyebrow">SECURE CHECKOUT</p>
      <h1>Delivery details</h1>
      <p className="utility-intro">Food checkout is paused until the live catalog, delivery areas, time slots, and shared order service are connected. No payment will be started from this page.</p>
      <form className="checkout-shell" aria-describedby="checkout-status">
        <fieldset disabled>
          <legend>Contact and delivery</legend>
          <label>Full name<input autoComplete="name" name="name" /></label>
          <label>Phone number<input autoComplete="tel" name="phone" type="tel" /></label>
          <label>Delivery address<input autoComplete="street-address" name="address" /></label>
          <label>Delivery area<select name="area"><option value="">No delivery areas available</option></select></label>
          <label>Delivery time slot<select name="slot"><option value="">No time slots available</option></select></label>
          <button className="button button-gold" type="button" disabled>Pay securely with Monnify</button>
        </fieldset>
        <p id="checkout-status" role="status">Checkout is unavailable because the food-order data model is not connected. Existing music purchases continue to use the current Monnify flow.</p>
        <Link href="/shop" className="text-link">Return to frozen food</Link>
      </form>
    </main>
  )
}
