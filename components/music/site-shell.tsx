import Image from 'next/image'
import Link from 'next/link'
import { Disc3 } from 'lucide-react'
import { CartDrawer } from '@/components/shop/cart-drawer'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="Fish Guy home">
        <span className="brand-wordmark"><strong>FISH GUY</strong></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/" className="nav-link">Shop</Link>
        <Link href="/shop?category=fish" className="nav-link">Frozen Fish</Link>
        <Link href="/orders" className="nav-link">Orders</Link>
        <Link href="/sounds" className="nav-link">Sounds</Link>
      </nav>
      <div className="header-utilities">
        <span className="store-status"><span className="store-status-dot" aria-hidden="true" />Open 8:30 AM – 9:00 PM</span>
        <CartDrawer />
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/" className="footer-brand">FISH GUY</Link>
      <p>Frozen food for Lagos. Independent sounds for the kitchen.</p>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/shop">Shop</Link>
        <Link href="/sounds">Sounds</Link>
        <Link href="/library">My library</Link>
        <Link href="/sounds/apply">Artist application</Link>
      </nav>
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
