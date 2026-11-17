import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { FeaturedPromotion } from '@/lib/music-data'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
}

export function FeaturedPromotionStrip({ campaigns, title }: { campaigns: FeaturedPromotion[]; title: string }) {
  if (campaigns.length === 0) return null

  return (
    <section className="featured-promotion-strip" aria-labelledby="featured-promotion-title">
      <div className="featured-promotion-intro">
        <p className="eyebrow">FISH GUY ARTIST SPOTLIGHT</p>
        <h2 id="featured-promotion-title">{title}</h2>
        <p>Campaigns currently live across the Fish Guy community.</p>
        <Link href="/sounds/promote" className="featured-promotion-link">Book a campaign <ArrowRight aria-hidden="true" /></Link>
      </div>
      <ul className="featured-promotion-list">
        {campaigns.map((campaign) => (
          <li className="featured-promotion-card" key={campaign.id}>
            <span className="featured-promotion-placement">
              {campaign.placement === 'home_featured' ? 'Homepage feature' : 'Sounds feature'}
            </span>
            <h3>{campaign.campaignTitle}</h3>
            <p>{campaign.artistName}</p>
            <time dateTime={campaign.endsOn}>Live through {formatDate(campaign.endsOn)}</time>
          </li>
        ))}
      </ul>
    </section>
  )
}
