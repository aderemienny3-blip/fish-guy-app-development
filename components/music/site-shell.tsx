import Image from 'next/image'
import Link from 'next/link'
import { Disc3 } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/sounds" className="brand-lockup" aria-label="Fish Guy Sounds home">
        <span className="brand-mark" aria-hidden="true">FG</span>
        <span className="brand-wordmark"><strong>FISH GUY</strong><span>SOUNDS</span></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/sounds" className="nav-link">Discover</Link>
        <Link href="/library" className="nav-link">My Library</Link>
        <Link href="/sounds/apply" className="nav-apply">Artist application <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/sounds" className="footer-brand">FISH GUY SOUNDS</Link>
      <p>Independent Lagos hip-hop. Direct from the artists.</p>
      <Link href="/sounds/apply">Artists: apply to upload</Link>
    </footer>
  )
}

export function CoverArtwork({ src, alt, className = '' }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={`cover-art ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 640px) 45vw, 240px" unoptimized />
      ) : (
        <div className="cover-art-empty" role="img" aria-label={`${alt} artwork not available`}>
          <Disc3 aria-hidden="true" />
          <span>Artwork pending</span>
        </div>
      )}
    </div>
  )
}
