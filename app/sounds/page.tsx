import Link from 'next/link'
import { ArtistSpotlight } from '@/components/music/artist-spotlight'
import { FeaturedPromotionStrip } from '@/components/music/featured-promotion-strip'
import { GenreChips } from '@/components/music/genre-chips'
import { NoTracksEmptyState } from '@/components/music/empty-state'
import { TrackCard } from '@/components/music/track-card'
import { getActivePromotionCampaigns, getSoundsPageData } from '@/lib/music-data'

const genres = ['Afrobeats-hip-hop', 'Street rap', 'Drill', 'Trap', 'Boom bap']

type SoundsPageProps = { searchParams: Promise<{ genre?: string }> }

export default async function SoundsPage({ searchParams }: SoundsPageProps) {
  const { genre } = await searchParams
  const selectedGenre = genres.find((item) => item.toLowerCase() === genre?.toLowerCase())
  const [data, featuredPromotions] = await Promise.all([
    getSoundsPageData(selectedGenre),
    getActivePromotionCampaigns('sounds_featured'),
  ])

  return (
    <main className="page-width sounds-main">
      <section className="hero-grid" aria-labelledby="sounds-title">
        <div className="hero-copy">
          <p className="eyebrow">THE SOUND OF THE STREETS, ON YOUR SPEAKERS</p>
          <h1 id="sounds-title">Lagos has<br />its own <em>sound.</em></h1>
          <p>Fish Guy Sounds puts independent hip-hop up front. Discover new voices, stream what&apos;s free, and buy direct from the artists.</p>
          <div className="hero-actions">
            <a href="#new-releases" className="button button-gold">Explore the releases <span aria-hidden="true">↓</span></a>
            <Link href="/shop" className="button button-outline">Shop frozen food</Link>
            <Link href="/library" className="button button-outline">Open my library</Link>
            <Link href="/sounds/promote" className="button button-outline">Book an artist feature</Link>
          </div>
        </div>
        <div className="hero-card" aria-label="Fish Guy Sounds, independent Lagos hip-hop">
          <div className="hero-card-top"><span>FISH GUY SOUNDS</span><span>NG · 01</span></div>
          <div className="waveform" aria-hidden="true">{Array.from({ length: 17 }, (_, index) => <span key={index} />)}</div>
          <div className="hero-card-bottom"><div><strong>Independent by nature.</strong><span>Music moves better when it moves direct.</span></div><span className="hero-card-tag">Lagos, Nigeria</span></div>
        </div>
      </section>

      <ArtistSpotlight artist={data.featuredArtist} />
      <FeaturedPromotionStrip campaigns={featuredPromotions} title="Featured on Fish Guy Sounds" />

      <section className="genre-area" aria-label="Browse genres">
        <p>Find your frequency</p>
        <GenreChips selected={selectedGenre} />
      </section>

      <section className="section-block" id="new-releases" aria-labelledby="new-releases-title">
        <div className="section-heading">
          <div><p className="eyebrow">FRESH FROM THE STUDIO</p><h2 id="new-releases-title">New releases</h2></div>
          <span className="text-link">{selectedGenre || 'All genres'}</span>
        </div>
        {data.newReleases.length > 0 ? (
          <div className="track-grid">{data.newReleases.map((track) => <TrackCard key={track.id} track={track} queue={data.tracks} />)}</div>
        ) : data.hasPublishedTracks ? (
          <NoTracksEmptyState title={`No ${selectedGenre} tracks yet.`} />
        ) : (
          <NoTracksEmptyState />
        )}
      </section>

      <section className="section-block" aria-labelledby="trending-title">
        <div className="section-heading">
          <div><p className="eyebrow">HEARD AROUND TOWN</p><h2 id="trending-title">Trending now</h2></div>
          <span className="text-link">Last 30 days · real plays</span>
        </div>
        {data.trending.length > 0 ? (
          <div className="track-grid">{data.trending.map((track) => <TrackCard key={track.id} track={track} queue={data.trending} showPlays />)}</div>
        ) : (
          <div className="quiet-empty"><span className="quiet-empty-line" /><p>{data.hasPublishedTracks ? 'No trending tracks yet. Play a release to help it rise.' : 'Trending will appear as artists release music and listeners press play.'}</p></div>
        )}
      </section>
    </main>
  )
}
