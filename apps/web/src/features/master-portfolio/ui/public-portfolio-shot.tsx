import type { PortfolioItemView } from '@lustra/contracts'

import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { publicPortfolioShotTestId } from '@/shared/lib/test-id'

type PublicPortfolioShotProps = {
  item: PortfolioItemView
  eager: boolean
  onOpen: () => void
}

export function PublicPortfolioShot({
  item,
  eager,
  onOpen,
}: PublicPortfolioShotProps) {
  return (
    <li className={styles.publicShot}>
      <button
        type="button"
        className={styles.publicShotButton}
        data-testid={publicPortfolioShotTestId(item.id)}
        onClick={onOpen}
      >
        <img
          className={styles.publicShotImage}
          src={item.url}
          alt={item.caption ?? 'Фото работы'}
          width={item.width}
          height={item.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'low'}
          draggable={false}
        />
      </button>
    </li>
  )
}
