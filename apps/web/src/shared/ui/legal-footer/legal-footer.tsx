import { PAYMENT_MARKS } from '@/shared/lib/payment-marks'
import { PLATFORM_OPERATOR } from '@/shared/lib/operator'
import { publicSiteUrl } from '@/shared/lib/public-site-url'
import styles from '@/shared/ui/legal-footer/legal-footer.module.css'

export function LegalFooter() {
  const year = new Date().getFullYear()
  const site = publicSiteUrl()
  const mailto = `mailto:${PLATFORM_OPERATOR.supportEmail}`

  return (
    <footer className={styles.footer}>
      <nav className={styles.links} aria-label="Юридическая информация">
        <a className={styles.link} href={`${site}/contacts`}>
          Реквизиты
        </a>
        <a className={styles.link} href={`${site}/payment`}>
          Оплата и возврат
        </a>
        <a className={styles.link} href={`${site}/terms`}>
          Публичная оферта
        </a>
        <a className={styles.link} href={`${site}/privacy`}>
          Политика конфиденциальности
        </a>
      </nav>

      <p className={styles.fact}>
        <a className={styles.email} href={mailto}>
          {PLATFORM_OPERATOR.supportEmail}
        </a>
        {' · '}
        Телефон: {PLATFORM_OPERATOR.phone}
      </p>
      <p className={styles.fact}>{PLATFORM_OPERATOR.postalAddress}</p>
      <p className={styles.fact}>{PLATFORM_OPERATOR.hours}</p>
      <p className={styles.fact}>
        Оператор: {PLATFORM_OPERATOR.legalStatus} {PLATFORM_OPERATOR.fullName}
        {' · '}
        УНП {PLATFORM_OPERATOR.unp}
      </p>

      <ul className={styles.ribbon} aria-label="Способы оплаты">
        {PAYMENT_MARKS.map((mark) => (
          <li key={mark.src} className={styles.item}>
            <img
              className={styles.logo}
              src={mark.src}
              alt={mark.alt}
              height={32}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>

      <p className={styles.copy}>© {year} Lumira</p>
    </footer>
  )
}
