import Link from 'next/link'
import type { CatalogMasterCard } from '@lumira/contracts'

import styles from '@/entities/master/ui/master-card.module.css'
import { masterCardTestId } from '@/shared/lib/test-id'

type MasterCardProps = {
  master: CatalogMasterCard
}

export function MasterCard({ master }: MasterCardProps) {
  const district = master.districtName ?? 'Минск'
  const ratingLabel =
    master.ratingCount > 0
      ? `${master.ratingAvg.toFixed(1)} · ${master.ratingCount}`
      : 'новый'
  const specialty =
    master.specialty ?? master.headline ?? 'Услуги уточняются'
  const priceLabel =
    master.priceFrom != null ? `от ${master.priceFrom} BYN` : 'цена по запросу'

  return (
    <Link
      href={`/m/${master.slug}`}
      className={styles.card}
      data-testid={masterCardTestId(master.slug)}
    >
      <div className={styles.cardTop}>
        <h2 className={styles.name}>{master.displayName}</h2>
        <span className={styles.rating}>{ratingLabel}</span>
      </div>
      <p className={styles.specialty}>{specialty}</p>
      <div className={styles.cardMeta}>
        <span>{district}</span>
        <span>{priceLabel}</span>
      </div>
    </Link>
  )
}
