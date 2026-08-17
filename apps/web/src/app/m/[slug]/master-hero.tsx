import type { PublicMasterView } from '@lustra/contracts'
import cn from 'classnames'

import styles from '@/app/m/[slug]/master.module.css'
import { FavoriteToggle } from '@/features/favorites'
import { pickCoverItem } from '@/features/master-portfolio/model/pick-cover-item'
import { MasterContactLinks } from '@/features/public-master/ui/master-contact-links'
import { ButtonLink } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

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
          data-testid={TEST_ID.masterPublicCover}
        />
      ) : null}
      <p className={styles.place}>
        {district} · {ratingLabel}
      </p>
      <h1 className={styles.name} data-testid={TEST_ID.masterPublicName}>
        {master.displayName}
      </h1>
      {master.headline ? <p className={styles.headline}>{master.headline}</p> : null}
      {master.bio ? <p className={styles.bio}>{master.bio}</p> : null}
      <MasterContactLinks contact={master.contact} />
      <div className={styles.heroActions}>
        <ButtonLink href="#booking">Записаться</ButtonLink>
        <FavoriteToggle masterId={master.id} masterSlug={master.slug} />
      </div>
    </section>
  )
}
