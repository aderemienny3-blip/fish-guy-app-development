'use client'

import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { useMusicPlayer } from '@/components/music/music-player'
import type { MusicTrack } from '@/lib/music-data'
import { formatNaira } from '@/lib/music-format'
import { CoverArtwork } from '@/components/music/site-shell'

export function TrackCard({ track, queue, showPlays = false }: { track: MusicTrack; queue: MusicTrack[]; showPlays?: boolean }) {
  const { currentTrack, isPlaying, playTrack, togglePlayback } = useMusicPlayer()
  const active = currentTrack?.id === track.id

  return (
    <article className="track-card">
      <div className="track-card-art-wrap">
        <Link href={`/sounds/${track.slug}`} aria-label={`View ${track.title} by ${track.artistName}`}>
          <CoverArtwork src={track.coverImageUrl} alt={`${track.title} cover art`} className="track-card-art" />
        </Link>
        <button
          type="button"
          className="cover-play"
          aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          onClick={() => active ? togglePlayback() : playTrack(track, queue)}
          disabled={!track.canPlay}
        >
          {active && isPlaying ? <Pause fill="currentColor" aria-hidden="true" /> : <Play fill="currentColor" aria-hidden="true" />}
        </button>
      </div>
      <div className="track-card-meta">
        <div className="track-card-title-line">
          <Link href={`/sounds/${track.slug}`} className="track-title">{track.title}</Link>
          {track.isFreeToStream && <span className="free-tag">FREE STREAM</span>}
        </div>
        <Link href={`/artists/${track.artistSlug}`} className="track-artist">{track.artistName}</Link>
        <div className="track-card-bottom">
          <span>{track.genre}</span>
          {showPlays && <span>{track.playCount.toLocaleString()} plays</span>}
          <strong>{track.priceKobo === 0 ? 'Free' : formatNaira(track.priceKobo)}</strong>
        </div>
      </div>
    </article>
  )
}
