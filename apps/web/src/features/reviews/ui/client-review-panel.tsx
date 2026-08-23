'use client'

import { useState } from 'react'
import type { BookingClientView, ClientReviewView } from '@lustra/contracts'

import { canLeaveReview } from '@/features/reviews/model/can-leave-review'
import { LeaveReviewForm } from '@/features/reviews/ui/leave-review-form'
import { ReceivedMasterReviewNote } from '@/features/reviews/ui/received-master-review-note'
import styles from '@/features/reviews/ui/reviews.module.css'
import { isDevelopment } from '@/shared/lib/is-development'
import { TEST_ID } from '@/shared/lib/test-id'

type ClientReviewPanelProps = {
  booking: BookingClientView
}

export function ClientReviewPanel({ booking }: ClientReviewPanelProps) {
  const [created, setCreated] = useState<ClientReviewView | null>(null)
  const now = new Date()

  if (created) {
    if (created.status === 'pending_review') {
      return <p className={styles.success}>Отзыв отправлен на проверку</p>
    }

    return (
      <p className={styles.success} data-testid={TEST_ID.reviewThanks}>
        Спасибо за отзыв
      </p>
    )
  }

  if (booking.review?.status === 'pending_review') {
    return <p className={styles.status}>Отзыв на проверке</p>
  }

  if (booking.review) {
    return (
      <p className={styles.success}>
        Вы оценили визит на {booking.review.rating} из 5
      </p>
    )
  }

  const receivedNote = (
    <ReceivedMasterReviewNote review={booking.receivedReview} />
  )

  if (!canLeaveReview(booking, now, { relaxTimeGuards: isDevelopment })) {
    return receivedNote
  }

  return (
    <div className={styles.form}>
      {receivedNote}
      <p className={styles.text} data-testid={TEST_ID.reviewPrompt}>
        Как прошёл визит?
      </p>
      <LeaveReviewForm
        bookingId={booking.id}
        onCreated={(response) => setCreated(response.review)}
      />
    </div>
  )
}
