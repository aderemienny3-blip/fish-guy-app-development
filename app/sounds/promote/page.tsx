import Link from 'next/link'
import { PromotionBookingForm } from '@/components/music/promotion-booking-form'

export const metadata = {
  title: 'Book an artist feature | Fish Guy Sounds',
  description: 'Request a Fish Guy homepage or Fish Guy Sounds campaign placement for your next release.',
}

export default function PromotionBookingPage() {
  return (
    <main className="page-width application-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/sounds">Sounds</Link><span aria-hidden="true">/</span><span>Artist promotion</span></nav>
      <div className="application-layout">
        <section className="application-intro">
          <p className="eyebrow">FOR ARTISTS BUILDING THEIR NEXT MOMENT</p>
          <h1>Put your next release in the spotlight.</h1>
          <p>Request a homepage or Fish Guy Sounds feature. The team reviews campaign dates and availability before confirming the booking.</p>
          <p className="promotion-review-note">Sending a request does not guarantee placement or charge you. If approved, the team will confirm the schedule and payment separately.</p>
        </section>
        <section className="application-card" aria-label="Artist promotion request form">
          <PromotionBookingForm />
        </section>
      </div>
    </main>
  )
}
