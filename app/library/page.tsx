import Link from 'next/link'
import { DownloadButtons } from '@/components/music/download-buttons'
import { CoverArtwork } from '@/components/music/site-shell'
import { getLibraryItems } from '@/lib/music-data'
import { getMusicSessionHash } from '@/lib/music-session'
import { formatNaira } from '@/lib/music-format'

export const metadata = { title: 'My Library | Fish Guy Sounds', description: 'Your Fish Guy Sounds purchases and secure music downloads.' }

export default async function LibraryPage() {
  const sessionHash = await getMusicSessionHash()
  const items = sessionHash ? await getLibraryItems(sessionHash) : []

  return (
    <main className="page-width library-page">
      <section className="library-intro">
        <p className="eyebrow">YOUR MUSIC, YOURS TO KEEP</p>
        <h1>My Library</h1>
        <p>Purchased releases show here after Monnify confirms payment. Download links are private, expire after 15 minutes, and can be generated again whenever you need them.</p>
      </section>
      {items.length ? (
        <div className="library-list" aria-label="Purchased tracks">
          {items.map((item) => (
            <article className="library-item" key={item.orderItemId}>
              <CoverArtwork src={item.coverImageUrl} alt={`${item.title} cover art`} className="library-cover" />
              <div><h2>{item.title}</h2><p>{item.artistName} · {formatNaira(item.priceKobo)}</p><p>Purchased {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('en-NG') : '—'}</p></div>
              <DownloadButtons orderItemId={item.orderItemId} hasMp3={Boolean(item.hasMp3)} hasWav={Boolean(item.hasWav)} />
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state library-empty">
          <span className="empty-icon" aria-hidden="true">♪</span>
          <p className="eyebrow">YOUR NEXT FAVORITE IS OUT THERE</p>
          <h2>No tracks purchased yet.</h2>
          <p>Buy a release and it will appear here after your payment is verified.</p>
          <Link href="/sounds" className="button button-gold">Explore Fish Guy Sounds <span aria-hidden="true">↗</span></Link>
        </section>
      )}
      {items.length > 0 && <p className="library-note">This library is tied to the secure browser session used at checkout. Keep this browser session to access your purchases.</p>}
    </main>
  )
}
