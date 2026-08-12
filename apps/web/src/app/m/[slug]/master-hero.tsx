import type { PublicMasterView } from '@lustra/contracts'

import styles from '@/app/m/[slug]/master.module.css'
import { ButtonLink } from '@/shared/ui/button'

type MasterHeroProps = {
  master: PublicMasterView
}

export function MasterHero({ master }: MasterHeroProps) {
  const district = master.primaryLocation?.districtName ?? 'Минск'
  const ratingLabel =
    master.ratingCount > 0
      ? `рейтинг ${master.ratingAvg.toFixed(1)}`
      : 'новый мастер'

  return (
    <section className={styles.hero}>
      <p className={styles.place}>
        {district} · {ratingLabel}
      </p>
      <h1 className={styles.name}>{master.displayName}</h1>
      {master.headline ? <p className={styles.headline}>{master.headline}</p> : null}
      {master.bio ? <p className={styles.bio}>{master.bio}</p> : null}
      <ButtonLink href="#booking">Записаться</ButtonLink>
    </section>
  )
}
