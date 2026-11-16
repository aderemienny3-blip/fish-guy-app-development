import Image from 'next/image'
import Link from 'next/link'
import type { MusicArtist } from '@/lib/music-data'

export function ArtistSpotlight({ artist }: { artist: MusicArtist | null }) {
  if (!artist) {
    return (
      <section className="spotlight-card spotlight-empty" aria-labelledby="spotlight-title">
        <div>
          <p className="eyebrow">ARTIST OF THE WEEK</p>
          <h2 id="spotlight-title">A spotlight waiting for its next voice.</h2>
          <p>Featured artists are selected from the Fish Guy Sounds catalog.</p>
        </div>
        <Link href="/sounds/apply" className="text-link">Apply to upload <span aria-hidden="true">↗</span></Link>
      </section>
    )
  }

  return (
    <section className="spotlight-card" aria-labelledby="spotlight-title">
      <div className="spotlight-copy">
        <p className="eyebrow">ARTIST OF THE WEEK</p>
        <h2 id="spotlight-title">{artist.name}</h2>
        <p>{artist.bio || 'A featured voice from the Fish Guy Sounds community.'}</p>
        <Link href={`/artists/${artist.slug}`} className="button button-gold">Meet the artist <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="spotlight-image">
        {artist.bannerUrl || artist.imageUrl ? (
          <Image src={artist.bannerUrl || artist.imageUrl || ''} alt={`${artist.name}`} fill sizes="(max-width: 700px) 90vw, 50vw" unoptimized />
        ) : <div className="spotlight-image-empty" aria-label={`${artist.name} image not available`}>{artist.name.slice(0, 1).toUpperCase()}</div>}
      </div>
    </section>
  )
}
