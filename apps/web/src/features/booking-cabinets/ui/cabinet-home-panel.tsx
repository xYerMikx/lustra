'use client'

import type { ReactNode } from 'react'
import type { UserRole } from '@lustra/contracts'

import { useSession } from '@/features/auth'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/app/app/app.module.css'

const CABINET_TITLE: Record<UserRole, string> = {
  master: 'Кабинет мастера',
  client: 'Кабинет клиента',
  admin: 'Кабинет',
}

const CABINET_COPY: Record<UserRole, string> = {
  master: 'Календарь, записи клиентов и подтверждение заявок.',
  client: 'Ваши записи к мастерам — предстоящие и прошлые.',
  admin: 'Раздел личного кабинета.',
}

const CABINET_ACTIONS: Record<UserRole, ReactNode> = {
  master: (
    <>
      <ButtonLink href="/app/master/bookings">Записи</ButtonLink>
      <ButtonLink href="/app/master/calendar" variant="ghost">
        Календарь
      </ButtonLink>
    </>
  ),
  client: (
    <>
      <ButtonLink href="/app/client/bookings">Мои записи</ButtonLink>
      <ButtonLink href="/catalog" variant="ghost">
        К каталогу
      </ButtonLink>
    </>
  ),
  admin: null,
}

export function CabinetHomePanel() {
  const user = useSession()

  return (
    <section className={styles.shellPanel}>
      <p className={styles.eyebrow}>Личный кабинет</p>
      <h1 className={styles.title}>{CABINET_TITLE[user.role]}</h1>
      <p className={styles.copy}>{CABINET_COPY[user.role]}</p>
      <div className={styles.actions}>{CABINET_ACTIONS[user.role]}</div>
    </section>
  )
}
