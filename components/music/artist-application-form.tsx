'use client'

import { useState, type FormEvent } from 'react'

export function ArtistApplicationForm() {
  const [message, setMessage] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setMessage('Sending your application…')
    const form = event.currentTarget
    const formData = new FormData(form)
    try {
      const response = await fetch('/api/music/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your application could not be sent.')
      form.reset()
      setMessage('Application received. The Fish Guy Sounds team will review it.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Your application could not be sent.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="artist-name">Artist or group name</label><input id="artist-name" name="artistName" required maxLength={120} /></div>
      <div className="form-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="contactName" autoComplete="name" required maxLength={120} /></div>
      <div className="form-field"><label htmlFor="artist-email">Email address</label><input id="artist-email" name="email" type="email" autoComplete="email" required maxLength={254} /></div>
      <div className="form-field"><label htmlFor="artist-links">Links to your music</label><textarea id="artist-links" name="links" placeholder="Paste your public listening or social links" required maxLength={1500} /></div>
      <div className="form-field"><label htmlFor="artist-message">A note about your sound <span>(optional)</span></label><textarea id="artist-message" name="message" maxLength={1200} /></div>
      <button className="button button-gold" type="submit" disabled={isPending}>{isPending ? 'Sending…' : 'Submit application'}</button>
      <p className={`form-message ${message && !isPending && message.includes('could not') ? 'is-error' : ''}`} aria-live="polite">{message}</p>
    </form>
  )
}
