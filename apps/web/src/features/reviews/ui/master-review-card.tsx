'use client'

import type { MasterReviewView } from '@lumira/contracts'

import { formatReviewDate } from '@/features/reviews/model/format-review-date'
import { MasterReplyForm } from '@/features/reviews/ui/master-reply-form'
import styles from '@/features/reviews/ui/reviews.module.css'
import { RatingStars } from '@/shared/ui/rating-stars'

type MasterReviewCardProps = {
  review: MasterReviewView
  onReplied: (reviewId: string, text: string) => void
}

export function MasterReviewCard({ review, onReplied }: MasterReviewCardProps) {
  const canReply = review.status === 'published' && !review.masterReply

  return (
    <li className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.name}>{review.clientFirstName}</span>
        <RatingStars value={review.rating} />
        <span>{formatReviewDate(review.createdAt)}</span>
      </div>
      <p className={styles.service}>{review.serviceTitle}</p>
      {review.status === 'pending_review' ? (
        <p className={styles.status}>На проверке</p>
      ) : null}
      {review.text ? <p className={styles.text}>{review.text}</p> : null}
      {review.masterReply ? (
        <p className={styles.reply}>Ваш ответ: {review.masterReply}</p>
      ) : null}
      {canReply ? (
        <MasterReplyForm
          reviewId={review.id}
          onReplied={(text) => onReplied(review.id, text)}
        />
      ) : null}
    </li>
  )
}
