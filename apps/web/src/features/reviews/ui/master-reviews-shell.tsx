'use client'

import { MasterReviewCard } from '@/features/reviews/ui/master-review-card'
import { useMasterReviews } from '@/features/reviews/model/use-master-reviews'
import styles from '@/features/reviews/ui/reviews.module.css'

export function MasterReviewsShell() {
  const list = useMasterReviews()

  if (list.status === 'loading') {
    return <p className={styles.empty}>Загружаем отзывы…</p>
  }

  if (list.status === 'error') {
    return <p className={styles.error}>{list.errorMessage ?? 'Ошибка'}</p>
  }

  if (list.status === 'empty') {
    return (
      <section className={styles.section}>
        <h1 className={styles.title}>Отзывы</h1>
        <p className={styles.empty}>Пока нет отзывов</p>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Отзывы</h1>
      <ul className={styles.list}>
        {list.items.map((item) => (
          <MasterReviewCard
            key={item.id}
            review={item}
            onReplied={list.markReplied}
          />
        ))}
      </ul>
    </section>
  )
}
