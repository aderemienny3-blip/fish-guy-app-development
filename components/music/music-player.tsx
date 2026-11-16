'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { MusicTrack } from '@/lib/music-data'
import { formatDuration } from '@/lib/music-format'
import { CoverArtwork } from '@/components/music/site-shell'

type MusicPlayerContextValue = {
  currentTrack: MusicTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playTrack: (track: MusicTrack, queue: MusicTrack[]) => void
  togglePlayback: () => void
  playNext: () => void
  toggleMute: () => void
  setVolume: (value: number) => void
  seek: (value: number) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null)
const MUTE_PREFERENCE_KEY = 'fish-guy-sounds-muted-v1'

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playedTrackIds = useRef(new Set<string>())
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [queue, setQueue] = useState<MusicTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.78)
  const [isMuted, setIsMuted] = useState(false)

  const playTrack = useCallback((track: MusicTrack, nextQueue: MusicTrack[]) => {
    const audio = audioRef.current
    setCurrentTrack(track)
    setQueue(nextQueue.length ? nextQueue : [track])
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(true)

    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    audio.src = `/api/music/stream/${encodeURIComponent(track.id)}`
    audio.load()
    void audio.play().catch(() => setIsPlaying(false))
  }, [])

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack || !audio.paused) return
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [currentTrack])

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (audioRef.current?.paused) resumePlayback()
    else pausePlayback()
  }, [pausePlayback, resumePlayback])

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length < 2) return
    const currentIndex = queue.findIndex((track) => track.id === currentTrack.id)
    const nextTrack = queue[(currentIndex + 1) % queue.length]
    if (nextTrack) playTrack(nextTrack, queue)
  }, [currentTrack, playTrack, queue])

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => {
      const next = !previous
      try {
        window.localStorage.setItem(MUTE_PREFERENCE_KEY, String(next))
      } catch {
        // The player still works if browser storage is unavailable.
      }
      return next
    })
  }, [])

  const setVolume = useCallback((value: number) => {
    const safeValue = Math.min(1, Math.max(0, value))
    setVolumeState(safeValue)
    if (safeValue > 0) {
      setIsMuted(false)
      try {
        window.localStorage.setItem(MUTE_PREFERENCE_KEY, 'false')
      } catch {
        // The player still works if browser storage is unavailable.
      }
    }
  }, [])

  const seek = useCallback((value: number) => {
    if (audioRef.current && Number.isFinite(value)) audioRef.current.currentTime = value
  }, [])

  useEffect(() => {
    try {
      setIsMuted(window.localStorage.getItem(MUTE_PREFERENCE_KEY) === 'true')
    } catch {
      setIsMuted(false)
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
    audioRef.current.muted = isMuted
  }, [isMuted, volume])

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator) || !('MediaMetadata' in window)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artistName,
      album: 'Fish Guy Sounds',
      artwork: currentTrack.coverImageUrl ? [{ src: currentTrack.coverImageUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
    })
    try {
      navigator.mediaSession.setActionHandler('play', () => resumePlayback())
      navigator.mediaSession.setActionHandler('pause', () => pausePlayback())
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext())
      navigator.mediaSession.setActionHandler('seekto', (event) => {
        if (typeof event.seekTime === 'number') seek(event.seekTime)
      })
    } catch {
      return
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
        navigator.mediaSession.setActionHandler('seekto', null)
      } catch {
        return
      }
    }
  }, [currentTrack, pausePlayback, playNext, resumePlayback, seek])

  const recordCurrentPlay = () => {
    if (!currentTrack || playedTrackIds.current.has(currentTrack.id)) return
    playedTrackIds.current.add(currentTrack.id)
    void fetch(`/api/music/plays/${encodeURIComponent(currentTrack.id)}`, { method: 'POST' }).catch(() => undefined)
  }

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    if (audio.currentTime >= 30) recordCurrentPlay()
  }

  const onEnded = () => {
    if ((audioRef.current?.currentTime ?? 0) >= 30) recordCurrentPlay()
    if (queue.length > 1) {
      const currentIndex = queue.findIndex((track) => track.id === currentTrack?.id)
      const nextTrack = queue[(currentIndex + 1) % queue.length]
      if (nextTrack) {
        playTrack(nextTrack, queue)
        return
      }
    }
    setIsPlaying(false)
  }

  const value = useMemo(() => ({
    currentTrack, isPlaying, currentTime, duration, volume, isMuted,
    playTrack, togglePlayback, playNext, toggleMute, setVolume, seek,
  }), [currentTrack, isPlaying, currentTime, duration, volume, isMuted, playTrack, togglePlayback, playNext, toggleMute, setVolume, seek])

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => { if (audioRef.current && Number.isFinite(audioRef.current.duration)) setDuration(audioRef.current.duration) }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
      />
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (!context) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider.')
  return context
}

export function MiniPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, volume, isMuted, togglePlayback, playNext, toggleMute, setVolume, seek } = useMusicPlayer()
  const canSkip = Boolean(currentTrack)
  const maxDuration = duration || currentTrack?.durationSeconds || 0

  return (
    <aside className="mini-player" aria-label="Music player">
      <div className="player-track">
        {currentTrack ? (
          <>
            <CoverArtwork src={currentTrack.coverImageUrl} alt={`${currentTrack.title} cover art`} className="player-cover" />
            <div className="player-track-copy"><strong>{currentTrack.title}</strong><span>{currentTrack.artistName}</span></div>
          </>
        ) : <div className="player-empty">Choose a track to start listening</div>}
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button className="player-icon-button player-play-button" type="button" aria-label={isPlaying ? 'Pause music' : 'Play music'} disabled={!currentTrack} onClick={togglePlayback}>
            {isPlaying ? <Pause fill="currentColor" aria-hidden="true" /> : <Play fill="currentColor" aria-hidden="true" />}
          </button>
          <button className="player-icon-button" type="button" aria-label="Play next track" disabled={!canSkip} onClick={playNext}><SkipForward aria-hidden="true" /></button>
        </div>
        <div className="player-progress">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <input aria-label="Track position" type="range" min="0" max={maxDuration || 1} step="1" value={Math.min(currentTime, maxDuration || 0)} disabled={!currentTrack || !duration} onChange={(event) => seek(Number(event.target.value))} />
          <span>{formatDuration(Math.floor(maxDuration))}</span>
        </div>
      </div>
      <div className="player-volume">
        <button className="player-icon-button" type="button" aria-label={isMuted ? 'Unmute music' : 'Mute music'} onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
        <input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} />
      </div>
    </aside>
  )
}
