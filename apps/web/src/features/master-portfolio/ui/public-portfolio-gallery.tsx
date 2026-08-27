import type { PortfolioItemView } from '@lustra/contracts'

import { PublicPortfolioFeed } from '@/features/master-portfolio/ui/public-portfolio-feed'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type PublicPortfolioGalleryProps = {
  items: PortfolioItemView[]
}

export function PublicPortfolioGallery({ items }: PublicPortfolioGalleryProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      className={styles.publicSection}
      aria-label="Портфолио"
      data-testid={TEST_ID.publicPortfolioGallery}
    >
      <h2 className={styles.publicTitle}>Работы</h2>
      <PublicPortfolioFeed items={items} />
    </section>
  )
}
