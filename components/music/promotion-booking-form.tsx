'use client'

import { useState, type FormEvent } from 'react'

type Feedback = { kind: 'pending' | 'success' | 'error'; text: string } | null

export function PromotionBookingForm() {
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [isPending, setIsPending] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    setFeedback({ kind: 'pending', text: 'Sending your campaign request…' })
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/music/advertising-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : 'Your request could not be sent.')
      form.reset()
      setFeedback({ kind: 'success', text: 'Request received. The Fish Guy Sounds team will confirm availability and next steps.' })
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof Error ? error.message : 'Your request could not be sent.' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form className="application-form promotion-form" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="promotion-artist-name">Artist or group name</label>
        <input id="promotion-artist-name" name="artistName" autoComplete="organization" required maxLength={120} />
      </div>
      <div className="form-field">
        <label htmlFor="promotion-contact-name">Contact name</label>
        <input id="promotion-contact-name" name="contactName" autoComplete="name" required maxLength={120} />
      </div>
      <div className="form-field">
        <label htmlFor="promotion-contact-email">Email address</label>
        <input id="promotion-contact-email" name="contactEmail" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className="form-field">
        <label htmlFor="promotion-contact-phone">Phone number <span>(optional)</span></label>
        <input id="promotion-contact-phone" name="contactPhone" type="tel" autoComplete="tel" maxLength={40} />
      </div>
      <div className="form-field">
        <label htmlFor="promotion-placement">Placement</label>
        <select id="promotion-placement" name="placement" required defaultValue="">
          <option value="" disabled>Choose a placement</option>
          <option value="home_featured">Fish Guy homepage feature</option>
          <option value="sounds_featured">Fish Guy Sounds feature</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="promotion-campaign-title">Campaign title</label>
        <input id="promotion-campaign-title" name="campaignTitle" required maxLength={160} />
      </div>
      <div className="promotion-date-fields">
        <div className="form-field">
          <label htmlFor="promotion-start-date">Start date</label>
          <input id="promotion-start-date" name="startsOn" type="date" min={today} required />
        </div>
        <div className="form-field">
          <label htmlFor="promotion-end-date">End date</label>
          <input id="promotion-end-date" name="endsOn" type="date" min={today} required />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="promotion-budget">Campaign budget (NGN)</label>
        <input id="promotion-budget" name="budgetNaira" type="number" inputMode="decimal" min="0.01" max="21474836.47" step="0.01" required />
        <p className="promotion-budget-note">This is a request for review, not a payment. If approved, the team will confirm availability and payment separately.</p>
      </div>
      <div className="form-field">
        <label htmlFor="promotion-message">Campaign notes <span>(optional)</span></label>
        <textarea id="promotion-message" name="message" maxLength={1200} placeholder="Tell us what you are promoting and any dates to avoid." />
      </div>
      <input className="visually-hidden" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="button button-gold" type="submit" disabled={isPending}>{isPending ? 'Sending…' : 'Send campaign request'}</button>
      <p className={`form-message ${feedback?.kind === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">{feedback?.text ?? ''}</p>
    </form>
  )
}
