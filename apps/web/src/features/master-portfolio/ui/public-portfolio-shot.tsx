import Image from 'next/image'
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
        <Image
          className={styles.publicShotImage}
          src={item.url}
          alt={item.caption ?? 'Фото работы'}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          quality={90}
          priority={eager}
          draggable={false}
        />
      </button>
    </li>
  )
}
