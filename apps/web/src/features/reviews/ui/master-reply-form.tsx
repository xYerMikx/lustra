'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ReplyToReviewInputSchema,
  type ReplyToReviewInput,
} from '@lumira/contracts'

import styles from '@/features/reviews/ui/reviews.module.css'
import { replyToReview } from '@/shared/api/reviews-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

type MasterReplyFormProps = {
  reviewId: string
  onReplied: (text: string) => void
}

export function MasterReplyForm({ reviewId, onReplied }: MasterReplyFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReplyToReviewInput>({
    resolver: zodResolver(ReplyToReviewInputSchema),
    defaultValues: { text: '' },
  })

  const submitForm = async (values: ReplyToReviewInput) => {
    setFormError(null)

    try {
      const response = await replyToReview(reviewId, values)

      if (!response?.review.masterReply) {
        setFormError('Не удалось отправить ответ')

        return
      }

      onReplied(response.review.masterReply)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)

        return
      }

      setFormError('Не удалось отправить ответ')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <label className={styles.field}>
        <span>Ответ клиенту</span>
        <textarea
          className={styles.textarea}
          maxLength={500}
          {...register('text')}
        />
        {errors.text ? (
          <span className={styles.fieldError}>{errors.text.message}</span>
        ) : null}
      </label>
      {formError ? <p className={styles.error}>{formError}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        Ответить
      </Button>
    </form>
  )
}
