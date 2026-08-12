'use client'

import { useSession } from '@/features/auth'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/app/app/app.module.css'

export function CabinetHomePanel() {
  const user = useSession()
  const isMaster = user.role === 'master'
  const isClient = user.role === 'client'

  return (
    <section className={styles.shellPanel}>
      <p className={styles.eyebrow}>Личный кабинет</p>
      <h1 className={styles.title}>
        {isMaster ? 'Кабинет мастера' : isClient ? 'Кабинет клиента' : 'Кабинет'}
      </h1>
      <p className={styles.copy}>
        {isMaster
          ? 'Календарь, записи клиентов и подтверждение заявок.'
          : isClient
            ? 'Ваши записи к мастерам — предстоящие и прошлые.'
            : 'Раздел личного кабинета.'}
      </p>
      <div className={styles.actions}>
        {isMaster ? (
          <>
            <ButtonLink href="/app/master/bookings">Записи</ButtonLink>
            <ButtonLink href="/app/master/calendar" variant="ghost">
              Календарь
            </ButtonLink>
          </>
        ) : null}
        {isClient ? (
          <>
            <ButtonLink href="/app/client/bookings">Мои записи</ButtonLink>
            <ButtonLink href="/catalog" variant="ghost">
              К каталогу
            </ButtonLink>
          </>
        ) : null}
      </div>
    </section>
  )
}
