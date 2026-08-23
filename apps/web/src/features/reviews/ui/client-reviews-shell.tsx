'use client'

import { formatClientRatingLabel } from '@/features/reviews/model/format-client-rating-label'
import { useClientReviews } from '@/features/reviews/model/use-client-reviews'
import { ReceivedClientReviewCard } from '@/features/reviews/ui/received-client-review-card'
import styles from '@/features/reviews/ui/reviews.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

export function ClientReviewsShell() {
  const list = useClientReviews()

  if (list.status === 'loading') {
    return <p className={styles.empty}>Загружаем отзывы…</p>
  }

  if (list.status === 'error') {
    return <p className={styles.error}>{list.errorMessage ?? 'Ошибка'}</p>
  }

  if (list.status === 'empty') {
    return (
      <section className={styles.section} data-testid={TEST_ID.pageClientReviews}>
        <h1 className={styles.title}>Отзывы о вас</h1>
        <p className={styles.empty}>
          Рейтинг: {formatClientRatingLabel(0, 0)}
        </p>
        <p className={styles.empty}>Мастера пока не оставляли отзывы</p>
      </section>
    )
  }

  return (
    <section className={styles.section} data-testid={TEST_ID.pageClientReviews}>
      <h1 className={styles.title}>Отзывы о вас</h1>
      <p className={styles.empty}>
        Рейтинг: {formatClientRatingLabel(list.ratingAvg, list.ratingCount)}
      </p>
      <ul className={styles.list}>
        {list.reviews.map((review) => (
          <ReceivedClientReviewCard key={review.id} review={review} />
        ))}
      </ul>
    </section>
  )
}
