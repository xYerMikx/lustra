'use client'

import Link from 'next/link'

import { formatAdminReviewHeadline, formatAdminReviewMeta } from '@/features/admin-moderation/model/format-admin-review-copy'
import { useAdminReviewsQueue } from '@/features/admin-moderation/model/use-admin-reviews-queue'
import { AdminQueueNav } from '@/features/admin-moderation/ui/admin-queue-nav'
import styles from '@/features/admin-moderation/ui/admin-moderation.module.css'
import { Button } from '@/shared/ui/button'

export function AdminReviewsQueueShell() {
  const queue = useAdminReviewsQueue('pending_review')

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Админка</p>
        <h1 className={styles.title}>Модерация отзывов</h1>
        <p className={styles.copy}>
          В очереди отзывы, которые автопроверка отправила на ручной просмотр.
          Одобрение публикует отзыв и пересчитывает рейтинг.
        </p>
        <AdminQueueNav active="reviews" />

        {queue.listStatus === 'loading' ? (
          <p className={styles.muted}>Загружаем очередь…</p>
        ) : null}

        {queue.listStatus === 'error' ? (
          <div>
            <p className={styles.error} role="alert">
              {queue.errorMessage}
            </p>
            <Button type="button" variant="ghost" onClick={queue.reload}>
              Повторить
            </Button>
          </div>
        ) : null}

        {queue.listStatus === 'empty' ? (
          <p className={styles.muted}>Очередь пуста — ждать некого.</p>
        ) : null}

        {queue.actionError ? (
          <p className={styles.error} role="alert">
            {queue.actionError}
          </p>
        ) : null}

        {queue.listStatus === 'success' ? (
          <ul className={styles.list}>
            {queue.items.map((item) => {
              const busy = queue.busyId === item.id
              const metaLabel = formatAdminReviewMeta({
                serviceTitle: item.serviceTitle,
                masterDisplayName: item.masterDisplayName,
              })

              return (
                <li key={item.id} className={styles.card}>
                  <div>
                    <div className={styles.cardTitle}>
                      {formatAdminReviewHeadline({
                        authorRole: item.authorRole,
                        rating: item.rating,
                        clientFirstName: item.clientFirstName,
                      })}
                    </div>
                    <div className={styles.cardMeta}>
                      {metaLabel ? (
                        <>
                          {metaLabel}
                          {' · '}
                        </>
                      ) : null}
                      <Link
                        className={styles.slugLink}
                        href={`/m/${item.masterSlug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /m/{item.masterSlug}
                      </Link>
                    </div>
                    {item.text ? (
                      <p className={styles.reviewText}>{item.text}</p>
                    ) : null}
                  </div>
                  <div className={styles.actions}>
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(item.id, 'approve')
                      }}
                    >
                      Одобрить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(item.id, 'reject')
                      }}
                    >
                      Отклонить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(item.id, 'hide')
                      }}
                    >
                      Скрыть
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>
    </div>
  )
}
