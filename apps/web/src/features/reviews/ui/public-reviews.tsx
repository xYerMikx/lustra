import type { PublicReviewView } from '@lumira/contracts'

import { PublicReviewCard } from '@/features/reviews/ui/public-review-card'
import styles from '@/features/reviews/ui/reviews.module.css'

type PublicReviewsProps = {
  items: PublicReviewView[]
}

export function PublicReviews({ items }: PublicReviewsProps) {
  if (items.length === 0) {
    return (
      <section className={styles.section} aria-label="Отзывы">
        <h2 className={styles.title}>Отзывы</h2>
        <p className={styles.empty}>Пока нет отзывов</p>
      </section>
    )
  }

  return (
    <section className={styles.section} aria-label="Отзывы">
      <h2 className={styles.title}>Отзывы</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <PublicReviewCard key={item.id} review={item} />
        ))}
      </ul>
    </section>
  )
}
