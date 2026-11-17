import Link from 'next/link'
import { PackageSearch } from 'lucide-react'

export function ShopEmptyState({ title, description, actionHref, actionLabel }: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="shop-empty-state" role="status">
      <span className="shop-empty-icon"><PackageSearch aria-hidden="true" /></span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actionHref && actionLabel && <Link href={actionHref} className="button button-outline">{actionLabel}</Link>}
    </div>
  )
}
