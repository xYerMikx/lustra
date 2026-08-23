import type { BookingReviewRef } from '@lustra/contracts'

import styles from '@/features/reviews/ui/reviews.module.css'

type ReceivedMasterReviewNoteProps = {
  review: BookingReviewRef | null
}

export function ReceivedMasterReviewNote({
  review,
}: ReceivedMasterReviewNoteProps) {
  if (!review) {
    return null
  }

  if (review.status === 'pending_review') {
    return (
      <p className={styles.status}>Мастер оставил отзыв — он на проверке</p>
    )
  }

  if (review.rating != null) {
    return (
      <p className={styles.status}>
        Мастер оценил визит на {review.rating} из 5
      </p>
    )
  }

  return (
    <p className={styles.status}>Мастер оставил комментарий о визите</p>
  )
}
