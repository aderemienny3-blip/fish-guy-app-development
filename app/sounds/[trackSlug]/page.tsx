import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckoutForm, PlayTrackButton } from '@/components/music/checkout-form'
import { CoverArtwork } from '@/components/music/site-shell'
import { getSoundsPageData, getTrackBySlug } from '@/lib/music-data'
import { formatDuration, formatNaira } from '@/lib/music-format'

type TrackPageProps = { params: Promise<{ trackSlug: string }> }

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { trackSlug } = await params
  const track = await getTrackBySlug(trackSlug)
  return track ? { title: `${track.title} by ${track.artistName} | Fish Guy Sounds`, description: `${track.genre} from ${track.artistName} on Fish Guy Sounds.` } : { title: 'Track not found | Fish Guy Sounds' }
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackSlug } = await params
  const [track, catalog] = await Promise.all([getTrackBySlug(trackSlug), getSoundsPageData()])
  if (!track) notFound()
  const queue = catalog.tracks.some((item) => item.id === track.id) ? catalog.tracks : [track, ...catalog.tracks]

  return (
    <main className="page-width track-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/sounds">Sounds</Link><span aria-hidden="true">/</span><Link href={`/artists/${track.artistSlug}`}>{track.artistName}</Link><span aria-hidden="true">/</span><span>{track.title}</span></nav>
      <section className="track-detail-grid" aria-labelledby="track-title">
        <CoverArtwork src={track.coverImageUrl} alt={`${track.title} cover art`} className="track-detail-art" />
        <div className="track-info">
          <p className="eyebrow">{track.genre}{track.mood ? ` · ${track.mood}` : ''}</p>
          <h1 id="track-title">{track.title}</h1>
          <Link href={`/artists/${track.artistSlug}`} className="track-artist">{track.artistName}</Link>
          <div className="track-facts"><span className="track-fact">{formatDuration(track.durationSeconds)}</span><span className="track-fact">{track.isFreeToStream ? 'Free to stream' : '30-second preview'}</span></div>
          {track.isFreeToStream && <p className="track-description">This artist has marked the full track free to stream.</p>}
          <p className="track-price">{track.priceKobo === 0 ? 'Free' : formatNaira(track.priceKobo)}</p>
          <div className="track-actions">
            {track.canPlay && <PlayTrackButton track={track} queue={queue} label={track.isFreeToStream ? 'Play full track' : 'Play 30-second preview'} />}
            <Link className="button button-outline" href="/library">My Library</Link>
          </div>
          {track.priceKobo > 0 && <CheckoutForm trackId={track.id} title={track.title} priceKobo={track.priceKobo} />}
          {!track.canPlay && <p className="library-note">Audio for this release is not available yet.</p>}
        </div>
      </section>
    </main>
  )
}
