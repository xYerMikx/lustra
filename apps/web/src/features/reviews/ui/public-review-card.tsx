import type { PublicReviewView } from '@lumira/contracts'

import { formatReviewDate } from '@/features/reviews/model/format-review-date'
import styles from '@/features/reviews/ui/reviews.module.css'
import { RatingStars } from '@/shared/ui/rating-stars'

type PublicReviewCardProps = {
  review: PublicReviewView
}

export function PublicReviewCard({ review }: PublicReviewCardProps) {
  return (
    <li className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.name}>{review.clientFirstName}</span>
        <RatingStars value={review.rating} />
        <span>{formatReviewDate(review.createdAt)}</span>
      </div>
      <p className={styles.service}>{review.serviceTitle}</p>
      {review.text ? <p className={styles.text}>{review.text}</p> : null}
      {review.masterReply ? (
        <p className={styles.reply}>Ответ мастера: {review.masterReply}</p>
      ) : null}
    </li>
  )
}
