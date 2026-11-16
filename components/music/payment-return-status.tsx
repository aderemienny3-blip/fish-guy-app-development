'use client'

import Link from 'next/link'
import { useState } from 'react'

export function PaymentReturnStatus({ paymentReference, initiallyPaid }: { paymentReference: string; initiallyPaid: boolean }) {
  const [paid, setPaid] = useState(initiallyPaid)
  const [message, setMessage] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function verifyAgain() {
    setIsPending(true)
    setMessage('Checking payment with Monnify…')
    try {
      const response = await fetch('/api/music/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentReference }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Payment status could not be checked.')
      setPaid(Boolean(result.paid))
      setMessage(result.paid ? 'Payment confirmed. Your track is ready in My Library.' : 'Payment is not confirmed yet. If you just paid, wait a moment and check again.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment status could not be checked.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <section className="payment-status" aria-labelledby="payment-status-title">
      <p className="eyebrow">MONNIFY PAYMENT</p>
      <h1 id="payment-status-title">{paid ? 'You’re all set.' : 'Checking your order.'}</h1>
      <p>{paid ? 'Payment confirmed. Your purchased music is now available in My Library.' : 'We verify every payment directly with Monnify before adding a track to your library.'}</p>
      <p className="form-message" aria-live="polite">{message}</p>
      <div className="hero-actions">
        {paid ? <Link href="/library" className="button button-gold">Go to My Library</Link> : <button type="button" className="button button-gold" disabled={isPending} onClick={verifyAgain}>{isPending ? 'Checking…' : 'Check payment again'}</button>}
        <Link href="/sounds" className="button button-outline">Back to Sounds</Link>
      </div>
    </section>
  )
}
