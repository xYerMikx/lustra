import cn from 'classnames'

import { ButtonLink } from '@/shared/ui/button'
import { LandingLink } from '@/shared/ui/landing-link'
import buttonStyles from '@/shared/ui/button/button.module.css'
import styles from '@/features/app-home/ui/app-home.module.css'

export function MasterTeaser() {
  return (
    <section className={styles.masters} aria-labelledby="masters-title">
      <p className={styles.mastersKicker}>Для мастеров</p>
      <h2 id="masters-title" className={styles.mastersTitle}>
        Календарь и витрина в одном кабинете
      </h2>
      <p className={styles.mastersLead}>
        Клиент берёт окно по ссылке из шапки. Заявку из директа заносите за
        несколько кликов. Кабинет бесплатный, с записи процент не берём.
      </p>
      <div className={styles.mastersActions}>
        <ButtonLink href="/app/register?role=master">Открыть кабинет</ButtonLink>
        <LandingLink
          className={cn(buttonStyles.button, buttonStyles.ghost)}
          href="/for-masters/"
        >
          Подробнее на сайте
        </LandingLink>
      </div>
    </section>
  )
}
