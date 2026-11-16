import Link from 'next/link'
import { ArtistApplicationForm } from '@/components/music/artist-application-form'

export const metadata = { title: 'Apply to upload | Fish Guy Sounds', description: 'Submit your music to Fish Guy Sounds for review.' }

export default function ArtistApplicationPage() {
  return (
    <main className="page-width application-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/sounds">Sounds</Link><span aria-hidden="true">/</span><span>Artist application</span></nav>
      <div className="application-layout">
        <section className="application-intro">
          <p className="eyebrow">FOR THE NEXT VOICE OUT OF LAGOS</p>
          <h1>Put your sound<br />in the room.</h1>
          <p>Tell us who you are and where we can hear your music. Applications are stored for the Fish Guy Sounds team to review; there is no upload or release until your submission is approved.</p>
        </section>
        <section className="application-card" aria-label="Artist application form"><ArtistApplicationForm /></section>
      </div>
    </main>
  )
}
