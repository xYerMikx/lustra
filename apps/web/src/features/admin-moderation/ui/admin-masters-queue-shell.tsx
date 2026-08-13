'use client'

import Link from 'next/link'

import { useAdminMastersQueue } from '@/features/admin-moderation/model/use-admin-masters-queue'
import { AdminQueueNav } from '@/features/admin-moderation/ui/admin-queue-nav'
import { profileStatusLabel } from '@/features/master-cabinet/model/profile-status-label'
import { Button } from '@/shared/ui/button'
import styles from '@/features/admin-moderation/ui/admin-moderation.module.css'

export function AdminMastersQueueShell() {
  const queue = useAdminMastersQueue('pending_review')

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Админка</p>
        <h1 className={styles.title}>Модерация мастеров</h1>
        <p className={styles.copy}>
          Очередь профилей со статусом «На проверке». Одобрение публикует
          профиль в каталог; отклонение возвращает в черновик.
        </p>
        <AdminQueueNav active="masters" />

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
            {queue.items.map((master) => {
              const busy = queue.busyId === master.id

              return (
                <li key={master.id} className={styles.card}>
                  <div>
                    <div className={styles.cardTitle}>{master.displayName}</div>
                    <div className={styles.cardMeta}>
                      {profileStatusLabel(master.status)}
                      {master.districtName ? ` · ${master.districtName}` : ''}
                      {' · '}
                      <Link
                        className={styles.slugLink}
                        href={`/m/${master.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /m/{master.slug}
                      </Link>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(master.id, 'approve')
                      }}
                    >
                      Одобрить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(master.id, 'reject')
                      }}
                    >
                      Отклонить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(master.id, 'hide')
                      }}
                    >
                      Скрыть
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        void queue.runModerate(master.id, 'ban')
                      }}
                    >
                      Бан
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
