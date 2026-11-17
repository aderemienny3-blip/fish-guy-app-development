import { StorefrontHome } from '@/components/shop/storefront-home'
import { getActivePromotionCampaigns, getDeliveryAreas, getSoundsPageData } from '@/lib/music-data'

export default async function HomePage() {
  const [sounds, deliveryAreas, featuredPromotions] = await Promise.all([
    getSoundsPageData(),
    getDeliveryAreas(),
    getActivePromotionCampaigns('home_featured'),
  ])
  const freeTracks = sounds.tracks.filter((track) => track.isFreeToStream && track.canPlay).slice(0, 3)

  return <StorefrontHome freeTracks={freeTracks} deliveryAreas={deliveryAreas} featuredPromotions={featuredPromotions} />
}
