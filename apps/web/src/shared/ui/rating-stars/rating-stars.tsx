import cn from 'classnames'

import styles from '@/shared/ui/rating-stars/rating-stars.module.css'

const MAX_STARS = 5
const STAR_INDEXES = [0, 1, 2, 3, 4] as const

type RatingStarsProps = {
  value: number
}

export function RatingStars({ value }: RatingStarsProps) {
  const filled = Math.min(MAX_STARS, Math.max(0, Math.round(value)))

  return (
    <span className={styles.row} aria-label={`${filled} из ${MAX_STARS}`}>
      {STAR_INDEXES.map((index) => (
        <svg
          key={index}
          className={cn(
            styles.icon,
            index < filled ? styles.filled : styles.empty,
          )}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M12 3.2 14.6 9l6.4.5-4.9 4.1 1.5 6.2L12 16.7 6.4 19.8 7.9 13.6 3 9.5 9.4 9 12 3.2z"
          />
        </svg>
      ))}
    </span>
  )
}
