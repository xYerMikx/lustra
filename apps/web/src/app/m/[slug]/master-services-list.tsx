import type { PublicServiceView } from '@lumira/contracts'

import styles from '@/app/m/[slug]/master.module.css'
import { formatPriceLabel } from '@/shared/lib/money'

type MasterServicesListProps = {
  services: PublicServiceView[]
}

export function MasterServicesList({ services }: MasterServicesListProps) {
  if (services.length === 0) {
    return (
      <section className={styles.services}>
        <h2 className={styles.sectionTitle}>Услуги</h2>
        <p className={styles.empty}>Пока нет активных услуг</p>
      </section>
    )
  }

  return (
    <section id="services" className={styles.services}>
      <h2 className={styles.sectionTitle}>Услуги</h2>
      <ul className={styles.serviceList}>
        {services.map((service) => (
          <li key={service.id} className={styles.serviceRow}>
            <div>
              <p className={styles.serviceTitle}>{service.title}</p>
              <p className={styles.serviceMeta}>{service.durationMin} мин</p>
            </div>
            <p className={styles.price}>{formatPriceLabel(service)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
