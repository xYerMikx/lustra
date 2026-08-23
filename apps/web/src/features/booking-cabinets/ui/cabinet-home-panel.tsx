'use client'

import type { ReactNode } from 'react'
import type { UserRole } from '@lustra/contracts'

import { useSession } from '@/features/auth'
import { MasterCabinetHub } from '@/features/master-cabinet'
import { ButtonLink } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/app/app/app.module.css'

const CABINET_TITLE: Record<Exclude<UserRole, 'master'>, string> = {
  client: 'Кабинет клиента',
  admin: 'Кабинет',
}

const CABINET_COPY: Record<Exclude<UserRole, 'master'>, string> = {
  client: 'Ваши записи, отзывы и избранное.',
  admin: 'Модерация мастеров и служебные действия.',
}

const CABINET_ACTIONS: Record<Exclude<UserRole, 'master'>, ReactNode> = {
  client: (
    <>
      <ButtonLink href="/app/client/bookings">Мои записи</ButtonLink>
      <ButtonLink href="/app/client/reviews" variant="ghost">
        Отзывы
      </ButtonLink>
      <ButtonLink href="/app/client/favorites" variant="ghost">
        Избранное
      </ButtonLink>
      <ButtonLink href="/catalog" variant="ghost">
        К каталогу
      </ButtonLink>
    </>
  ),
  admin: <ButtonLink href="/admin">Открыть админку</ButtonLink>,
}

export function CabinetHomePanel() {
  const user = useSession()

  if (user.role === 'master') {
    return <MasterCabinetHub />
  }

  return (
    <section className={styles.shellPanel} data-testid={TEST_ID.pageClientCabinet}>
      <p className={styles.eyebrow}>Личный кабинет</p>
      <h1 className={styles.title}>{CABINET_TITLE[user.role]}</h1>
      <p className={styles.copy}>{CABINET_COPY[user.role]}</p>
      <div className={styles.actions}>{CABINET_ACTIONS[user.role]}</div>
    </section>
  )
}
