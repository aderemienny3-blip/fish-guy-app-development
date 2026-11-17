import { StorefrontHome } from '@/components/shop/storefront-home'
import { getSoundsPageData } from '@/lib/music-data'

export default async function HomePage() {
  const sounds = await getSoundsPageData()
  const freeTracks = sounds.tracks.filter((track) => track.isFreeToStream && track.canPlay).slice(0, 3)

  return <StorefrontHome freeTracks={freeTracks} />
}
