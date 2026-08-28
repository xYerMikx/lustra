import cn from 'classnames'

import type {
  ClientFlowRow,
  ClientFlowSlide,
} from '@/features/app-home/model/client-flow-slides'
import styles from '@/features/app-home/ui/client-flow-slide-card.module.css'

const ROW_TONE_CLASS: Record<NonNullable<ClientFlowRow['tone']>, string> = {
  ok: styles.rowOk,
  free: styles.rowFree,
  hold: styles.rowHold,
}

const ROW_META_TONE_CLASS: Partial<
  Record<NonNullable<ClientFlowRow['tone']>, string>
> = {
  ok: styles.rowOkMeta,
}

type ClientFlowSlideCardProps = {
  slide: ClientFlowSlide
}

export function ClientFlowSlideCard({ slide }: ClientFlowSlideCardProps) {
  return (
    <article className={styles.card} aria-label={slide.label}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <p className={styles.title}>{slide.title}</p>
      <ul className={styles.list}>
        {slide.rows.map((row) => (
          <li
            key={`${slide.id}-${row.name}`}
            className={cn(
              styles.row,
              row.tone ? ROW_TONE_CLASS[row.tone] : undefined,
            )}
          >
            <p className={styles.rowName}>{row.name}</p>
            <p
              className={cn(
                styles.rowMeta,
                row.tone ? ROW_META_TONE_CLASS[row.tone] : undefined,
              )}
            >
              {row.meta}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
