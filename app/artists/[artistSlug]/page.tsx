import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NoTracksEmptyState } from '@/components/music/empty-state'
import { TrackCard } from '@/components/music/track-card'
import { getArtistBySlug } from '@/lib/music-data'

export default async function ArtistPage({ params }: { params: Promise<{ artistSlug: string }> }) {
  const { artistSlug } = await params
  const data = await getArtistBySlug(artistSlug)
  if (!data) notFound()

  return (
    <main className="page-width artist-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/sounds">Sounds</Link><span aria-hidden="true">/</span><span>{data.artist.name}</span></nav>
      <section className={`artist-hero ${data.artist.bannerUrl || data.artist.imageUrl ? 'has-image' : ''}`} aria-labelledby="artist-title">
        {(data.artist.bannerUrl || data.artist.imageUrl) && <Image src={data.artist.bannerUrl || data.artist.imageUrl || ''} alt="" fill sizes="100vw" unoptimized aria-hidden="true" />}
        <div className="artist-hero-content">
          {data.artist.isFeatured && <p className="eyebrow">FEATURED ON FISH GUY SOUNDS</p>}
          <h1 id="artist-title">{data.artist.name}</h1>
          {data.artist.bio && <p>{data.artist.bio}</p>}
        </div>
      </section>
      <section className="section-block" aria-labelledby="artist-releases-title">
        <div className="section-heading"><div><p className="eyebrow">FROM THE CATALOG</p><h2 id="artist-releases-title">Releases</h2></div></div>
        {data.tracks.length ? <div className="track-grid">{data.tracks.map((track) => <TrackCard key={track.id} track={track} queue={data.tracks} />)}</div> : <NoTracksEmptyState title="No tracks yet." />}
      </section>
    </main>
  )
}
