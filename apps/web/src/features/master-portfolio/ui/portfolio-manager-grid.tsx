'use client'

import type { PortfolioItemView } from '@lumira/contracts'

import { PortfolioManagerCard } from '@/features/master-portfolio/ui/portfolio-manager-card'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'

type PortfolioManagerGridProps = {
  items: PortfolioItemView[]
  busy: boolean
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
}

export function PortfolioManagerGrid({
  items,
  busy,
  onSetCover,
  onRemove,
}: PortfolioManagerGridProps) {
  return (
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.id}>
          <PortfolioManagerCard
            item={item}
            busy={busy}
            onSetCover={onSetCover}
            onRemove={onRemove}
          />
        </li>
      ))}
    </ul>
  )
}
