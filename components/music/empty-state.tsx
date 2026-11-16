import Link from 'next/link'
import { Disc3 } from 'lucide-react'

export function NoTracksEmptyState({ title = 'No tracks yet.' }: { title?: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Disc3 aria-hidden="true" /></span>
      <p className="eyebrow">THE NEXT SOUND STARTS HERE</p>
      <h3>{title}</h3>
      <p>Artists can apply to upload music to Fish Guy Sounds.</p>
      <Link href="/sounds/apply" className="button button-outline">Apply to upload <span aria-hidden="true">↗</span></Link>
    </div>
  )
}
