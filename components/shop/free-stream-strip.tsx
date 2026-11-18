'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { useMusicPlayer } from '@/components/music/music-player'
import type { MusicTrack } from '@/lib/music-data'

function FreeTrack({ track, queue }: { track: MusicTrack; queue: MusicTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlayback } = useMusicPlayer()
  const active = currentTrack?.id === track.id

  return (
    <div className="free-track">
      {track.coverImageUrl ? (
        <Image className="free-track-cover" src={track.coverImageUrl} alt="" width={42} height={42} unoptimized />
      ) : <span className="free-track-cover free-track-cover-empty" aria-hidden="true" />}
      <div className="free-track-copy">
        <Link href={`/sounds/${track.slug}`}>{track.title}</Link>
        <span>{track.artistName}</span>
      </div>
      <button
        className="free-track-play"
        type="button"
        aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        disabled={!track.canPlay}
        onClick={() => active ? togglePlayback() : playTrack(track, queue)}
      >
        {active && isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
    </div>
  )
}

export function FreeStreamStrip({ tracks }: { tracks: MusicTrack[] }) {
  return (
    <section className="listen-strip" aria-labelledby="listen-title">
      <div className="listen-intro">
        <p className="eyebrow">FISH GUY SOUNDS</p>
        <h2 id="listen-title">Listen while you shop</h2>
        <Link href="/sounds" className="listen-link">Explore Sounds <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="listen-tracks">
        {tracks.length > 0 ? tracks.map((track) => <FreeTrack key={track.id} track={track} queue={tracks} />) : (
          <p className="listen-empty">Free-to-stream tracks will appear here when artists publish them.</p>
        )}
      </div>
    </section>
  )
}
