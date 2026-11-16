import Link from 'next/link'
import { PaymentReturnStatus } from '@/components/music/payment-return-status'
import { getMusicSessionHash } from '@/lib/music-session'
import { confirmMusicOrderForSession } from '@/lib/monnify'

export const metadata = { title: 'Payment status | Fish Guy Sounds', description: 'Check the status of your Fish Guy Sounds order.' }

type ReturnPageProps = { searchParams: Promise<{ paymentReference?: string }> }

export default async function PaymentReturnPage({ searchParams }: ReturnPageProps) {
  const { paymentReference = '' } = await searchParams
  const sessionHash = await getMusicSessionHash()
  let paid = false
  if (sessionHash && /^FGS-[A-F0-9]{32}$/.test(paymentReference)) {
    try {
      paid = await confirmMusicOrderForSession(paymentReference, sessionHash)
    } catch {
      paid = false
    }
  }

  return (
    <main className="page-width payment-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/sounds">Sounds</Link><span aria-hidden="true">/</span><span>Payment status</span></nav>
      {paymentReference && sessionHash ? <PaymentReturnStatus paymentReference={paymentReference} initiallyPaid={paid} /> : (
        <section className="payment-status"><p className="eyebrow">MONNIFY PAYMENT</p><h1>Order not found.</h1><p>This payment could not be matched to this browser session. Visit My Library or contact Fish Guy support if you have been charged.</p><Link href="/library" className="button button-gold">Open My Library</Link></section>
      )}
    </main>
  )
}
