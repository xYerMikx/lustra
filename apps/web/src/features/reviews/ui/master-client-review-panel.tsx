'use client'

import { useState } from 'react'
import type {
  BookingMasterView,
  ReceivedClientReviewView,
} from '@lumira/contracts'

import { canLeaveMasterClientReview } from '@/features/reviews/model/can-leave-master-client-review'
import { LeaveMasterClientReviewForm } from '@/features/reviews/ui/leave-master-client-review-form'
import styles from '@/features/reviews/ui/reviews.module.css'
import { isDevelopment } from '@/shared/lib/is-development'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterClientReviewPanelProps = {
  booking: BookingMasterView
}

export function MasterClientReviewPanel({
  booking,
}: MasterClientReviewPanelProps) {
  const [created, setCreated] = useState<ReceivedClientReviewView | null>(null)
  const now = new Date()

  if (created) {
    if (created.status === 'pending_review') {
      return <p className={styles.success}>Отзыв отправлен на проверку</p>
    }

    return (
      <p className={styles.success} data-testid={TEST_ID.masterReviewThanks}>
        Отзыв о клиенте сохранён
      </p>
    )
  }

  if (booking.clientReview?.status === 'pending_review') {
    return <p className={styles.status}>Отзыв о клиенте на проверке</p>
  }

  if (booking.clientReview) {
    if (booking.clientReview.rating != null) {
      return (
        <p className={styles.success}>
          Вы оценили клиента на {booking.clientReview.rating} из 5
        </p>
      )
    }

    return <p className={styles.success}>Вы оставили комментарий о клиенте</p>
  }

  if (booking.status === 'completed' && !booking.clientHasAccount) {
    return (
      <p className={styles.status}>
        Отзыв можно оставить только клиенту с аккаунтом
      </p>
    )
  }

  if (
    !canLeaveMasterClientReview(booking, now, {
      relaxTimeGuards: isDevelopment,
    })
  ) {
    return null
  }

  return (
    <div className={styles.form}>
      <p className={styles.text} data-testid={TEST_ID.masterReviewPrompt}>
        Как прошёл визит с клиентом? Можно поставить оценку, оставить только
        комментарий или и то и другое.
      </p>
      <LeaveMasterClientReviewForm
        bookingId={booking.id}
        onCreated={(response) => setCreated(response.review)}
      />
    </div>
  )
}
