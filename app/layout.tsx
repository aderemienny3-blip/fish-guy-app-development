import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { MusicPlayerProvider, MiniPlayer } from '@/components/music/music-player'
import { SiteFooter, SiteHeader } from '@/components/music/site-shell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fish Guy Sounds | Lagos Hip-Hop',
  description: 'Discover independent Lagos hip-hop, stream free releases, and buy music directly from the artists on Fish Guy Sounds.',
  applicationName: 'Fish Guy Sounds',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG">
      <body className="antialiased">
        <MusicPlayerProvider>
          <div className="site-shell">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
          <MiniPlayer />
        </MusicPlayerProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
