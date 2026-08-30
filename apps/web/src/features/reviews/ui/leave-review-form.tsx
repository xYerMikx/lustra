'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import cn from 'classnames'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateReviewInputSchema,
  type CreateReviewInput,
  type CreateReviewResponse,
} from '@lumira/contracts'

import styles from '@/features/reviews/ui/reviews.module.css'
import { createReview } from '@/shared/api/reviews-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { TEST_ID, reviewStarTestId } from '@/shared/lib/test-id'

const STARS = [1, 2, 3, 4, 5] as const

type LeaveReviewFormProps = {
  bookingId: string
  onCreated: (response: CreateReviewResponse) => void
}

export function LeaveReviewForm({ bookingId, onCreated }: LeaveReviewFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(CreateReviewInputSchema),
    defaultValues: {
      bookingId,
      rating: 5,
      text: '',
    },
  })

  const rating = watch('rating')

  const submitForm = async (values: CreateReviewInput) => {
    setFormError(null)

    try {
      const response = await createReview({
        bookingId: values.bookingId,
        rating: values.rating,
        text: values.text?.trim() ? values.text.trim() : undefined,
      })

      if (!response) {
        setFormError('Не удалось отправить отзыв')

        return
      }

      onCreated(response)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)

        return
      }

      setFormError('Не удалось отправить отзыв')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <input type="hidden" {...register('bookingId')} />

      <fieldset className={styles.field}>
        <legend>Оценка</legend>
        <div className={styles.starsRow}>
          {STARS.map((star) => (
            <button
              key={star}
              type="button"
              className={cn(
                styles.starButton,
                rating === star && styles.starButtonActive,
              )}
              aria-pressed={rating === star}
              data-testid={reviewStarTestId(star)}
              onClick={() => setValue('rating', star)}
            >
              {star}
            </button>
          ))}
        </div>
        {errors.rating ? (
          <span className={styles.fieldError}>{errors.rating.message}</span>
        ) : null}
      </fieldset>

      <label className={styles.field}>
        <span>Комментарий (необязательно)</span>
        <textarea
          className={styles.textarea}
          maxLength={800}
          data-testid={TEST_ID.reviewText}
          {...register('text')}
        />
        {errors.text ? (
          <span className={styles.fieldError}>{errors.text.message}</span>
        ) : null}
      </label>

      {formError ? <p className={styles.error}>{formError}</p> : null}

      <Button type="submit" disabled={isSubmitting} data-testid={TEST_ID.reviewSubmit}>
        Отправить отзыв
      </Button>
    </form>
  )
}
