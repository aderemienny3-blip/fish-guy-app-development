import Link from 'next/link'
import { getDeliveryAreas } from '@/lib/music-data'

export default async function CheckoutPage() {
  const areas = await getDeliveryAreas()

  return (
    <main className="page-width utility-page">
      <p className="eyebrow">SECURE CHECKOUT</p>
      <h1>Delivery details</h1>
      <p className="utility-intro">Food checkout remains paused while the live catalog, time slots, and shared order service are connected. No payment will be started from this page.</p>
      <form className="checkout-shell" aria-describedby="checkout-status">
        <fieldset disabled>
          <legend>Contact and delivery</legend>
          <label>Full name<input autoComplete="name" name="name" /></label>
          <label>Phone number<input autoComplete="tel" name="phone" type="tel" /></label>
          <label>Delivery address<input autoComplete="street-address" name="address" /></label>
          <label>Delivery area
            <select name="area">
              <option value="">{areas.length ? 'Choose your delivery area' : 'No delivery areas available'}</option>
              {areas.map((area) => <option value={area.slug} key={area.id}>{area.name}</option>)}
            </select>
          </label>
          <label>Delivery time slot<select name="slot"><option value="">No time slots available</option></select></label>
          <button className="button button-gold" type="button" disabled>Pay securely with Monnify</button>
        </fieldset>
        <p id="checkout-status" role="status">Checkout is unavailable because the food-order data model and delivery slots are not connected. Existing music purchases continue to use the current Monnify flow.</p>
        <Link href="/shop" className="text-link">Return to frozen food</Link>
      </form>
    </main>
  )
}
