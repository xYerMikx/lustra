import type { ReceivedClientReviewView } from '@lustra/contracts'

import { formatReviewDate } from '@/features/reviews/model/format-review-date'
import styles from '@/features/reviews/ui/reviews.module.css'
import { RatingStars } from '@/shared/ui/rating-stars'

type ReceivedClientReviewCardProps = {
  review: ReceivedClientReviewView
}

export function ReceivedClientReviewCard({
  review,
}: ReceivedClientReviewCardProps) {
  const serviceTitle = review.serviceTitle.trim()

  return (
    <li className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.name}>{review.masterDisplayName}</span>
        {review.rating != null ? <RatingStars value={review.rating} /> : null}
        <span>{formatReviewDate(review.createdAt)}</span>
      </div>
      {serviceTitle ? <p className={styles.service}>{serviceTitle}</p> : null}
      {review.status === 'pending_review' ? (
        <p className={styles.status}>На проверке</p>
      ) : null}
      {review.text ? <p className={styles.text}>{review.text}</p> : null}
    </li>
  )
}
