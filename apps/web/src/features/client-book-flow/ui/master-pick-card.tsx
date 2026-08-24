'use client'

import type { BookMasterCandidate } from '@/features/client-book-flow/model/types'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { bookMasterOptionTestId } from '@/shared/lib/test-id'

const SOURCE_LABEL: Record<BookMasterCandidate['source'], string> = {
  last: 'Вы уже были',
  favorite: 'Избранное',
  catalog: 'Каталог',
}

type MasterPickCardProps = {
  master: BookMasterCandidate
  disabled: boolean
  onSelect: (master: BookMasterCandidate) => void
}

export function MasterPickCard({
  master,
  disabled,
  onSelect,
}: MasterPickCardProps) {
  const district = master.districtName ?? 'Минск'
  const ratingLabel =
    master.ratingCount > 0
      ? `${master.ratingAvg.toFixed(1)} · ${master.ratingCount}`
      : 'новый'

  return (
    <button
      type="button"
      className={styles.masterCard}
      disabled={disabled}
      onClick={() => onSelect(master)}
      data-testid={bookMasterOptionTestId(master.slug)}
    >
      <span className={styles.masterName}>{master.displayName}</span>
      <span className={styles.optionMeta}>
        {master.specialty ?? master.headline ?? SOURCE_LABEL[master.source]}
      </span>
      <span className={styles.masterMeta}>
        {district} · {ratingLabel} · {SOURCE_LABEL[master.source]}
      </span>
    </button>
  )
}
