import { SiteChrome } from '@/shared/ui/site-chrome'
import { ButtonLink } from '@/shared/ui/button'
import styles from './page.module.css'

export default function HomePage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <section className={styles.hero}>
          <p className={styles.kicker}>Минск · бьюти-мастера</p>
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
        </section>
      </SiteChrome>
    </main>
  )
}
