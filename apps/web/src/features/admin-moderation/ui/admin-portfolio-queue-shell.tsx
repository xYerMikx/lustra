'use client'

import Link from 'next/link'

import { useAdminPortfolioQueue } from '@/features/admin-moderation/model/use-admin-portfolio-queue'
import { AdminQueueNav } from '@/features/admin-moderation/ui/admin-queue-nav'
import styles from '@/features/admin-moderation/ui/admin-moderation.module.css'
import { Button } from '@/shared/ui/button'

export function AdminPortfolioQueueShell() {
  const queue = useAdminPortfolioQueue('pending')

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Админка</p>
        <h1 className={styles.title}>Модерация фото</h1>
        <p className={styles.copy}>
          Новые работы мастеров не попадают в публичную галерею, пока их не
          одобрят.
        </p>
        <AdminQueueNav active="portfolio" />

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

              return (
                <li key={item.id} className={styles.card}>
                  <div className={styles.cardMedia}>
                    <img
                      className={styles.thumb}
                      src={item.url}
                      alt={item.caption ?? 'Фото работы'}
                    />
                    <div>
                      <div className={styles.cardTitle}>
                        {item.masterDisplayName}
                      </div>
                      <div className={styles.cardMeta}>
                        {item.caption ? `${item.caption} · ` : null}
                        <Link
                          className={styles.slugLink}
                          href={`/m/${item.masterSlug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          /m/{item.masterSlug}
                        </Link>
                      </div>
                    </div>
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
