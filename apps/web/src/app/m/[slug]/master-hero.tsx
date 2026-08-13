import type { PublicMasterView } from '@lustra/contracts'
import cn from 'classnames'

import styles from '@/app/m/[slug]/master.module.css'
import { pickCoverItem } from '@/features/master-portfolio/model/pick-cover-item'
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
  const cover = pickCoverItem(master.portfolio)

  return (
    <section className={cn(styles.hero, cover && styles.heroWithCover)}>
      {cover ? (
        <img
          className={styles.cover}
          src={cover.url}
          alt={cover.caption ?? master.displayName}
          width={cover.width}
          height={cover.height}
        />
      ) : null}
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
