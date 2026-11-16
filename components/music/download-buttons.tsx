'use client'

import { useState } from 'react'

type DownloadFormat = 'mp3' | 'wav'

export function DownloadButtons({ orderItemId, hasMp3, hasWav }: { orderItemId: string; hasMp3: boolean; hasWav: boolean }) {
  const [busyFormat, setBusyFormat] = useState<DownloadFormat | null>(null)
  const [message, setMessage] = useState('')

  async function download(format: DownloadFormat) {
    setBusyFormat(format)
    setMessage('Creating a secure download link…')
    try {
      const response = await fetch('/api/music/download-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, format }),
      })
      const result = await response.json()
      if (!response.ok || typeof result.url !== 'string') throw new Error(result.error || 'A download link could not be created.')
      setMessage(`Link expires ${new Date(result.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`)
      window.location.assign(result.url)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'A download link could not be created.')
    } finally {
      setBusyFormat(null)
    }
  }

  return (
    <div className="download-actions">
      {hasMp3 && <button type="button" className="download-button" disabled={busyFormat !== null} onClick={() => download('mp3')}>{busyFormat === 'mp3' ? 'Preparing…' : 'Download MP3'}</button>}
      {hasWav && <button type="button" className="download-button" disabled={busyFormat !== null} onClick={() => download('wav')}>{busyFormat === 'wav' ? 'Preparing…' : 'Download WAV'}</button>}
      <span className="sr-only" aria-live="polite">{message}</span>
    </div>
  )
}
