import { ClientFlowCarousel } from '@/features/app-home/ui/client-flow-carousel'
import { MasterTeaser } from '@/features/app-home/ui/master-teaser'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/app-home/ui/app-home.module.css'

export function AppHomeShell() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Беларусь · бьюти-мастера</p>
          <h1 className={styles.title}>Lumira</h1>
          <p className={styles.lead}>
            Находите проверенных мастеров и записывайтесь без лишних переписок.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/catalog">Смотреть каталог</ButtonLink>
            <ButtonLink href="/app/register?role=master" variant="ghost">
              Я мастер
            </ButtonLink>
          </div>
        </div>
        <div className={styles.preview}>
          <ClientFlowCarousel />
        </div>
      </section>
      <MasterTeaser />
    </div>
  )
}
