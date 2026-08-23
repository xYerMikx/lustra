'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import cn from 'classnames'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateMasterClientReviewInputSchema,
  type CreateMasterClientReviewInput,
  type CreateMasterClientReviewResponse,
} from '@lustra/contracts'

import styles from '@/features/reviews/ui/reviews.module.css'
import { createMasterClientReview } from '@/shared/api/reviews-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { TEST_ID, reviewStarTestId } from '@/shared/lib/test-id'

const STARS = [1, 2, 3, 4, 5] as const

type LeaveMasterClientReviewFormProps = {
  bookingId: string
  onCreated: (response: CreateMasterClientReviewResponse) => void
}

export function LeaveMasterClientReviewForm({
  bookingId,
  onCreated,
}: LeaveMasterClientReviewFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateMasterClientReviewInput>({
    resolver: zodResolver(CreateMasterClientReviewInputSchema),
    defaultValues: {
      bookingId,
      rating: undefined,
      text: '',
    },
  })

  const rating = watch('rating')

  const submitForm = async (values: CreateMasterClientReviewInput) => {
    setFormError(null)

    try {
      const response = await createMasterClientReview({
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
        <legend>Оценка (необязательно)</legend>
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
              onClick={() =>
                setValue('rating', rating === star ? undefined : star, {
                  shouldValidate: true,
                })
              }
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
          data-testid={TEST_ID.masterReviewText}
          {...register('text')}
        />
        {errors.text ? (
          <span className={styles.fieldError}>{errors.text.message}</span>
        ) : null}
      </label>

      {errors.root ? (
        <p className={styles.error}>{errors.root.message}</p>
      ) : null}
      {formError ? <p className={styles.error}>{formError}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        data-testid={TEST_ID.masterReviewSubmit}
      >
        Отправить отзыв
      </Button>
    </form>
  )
}
