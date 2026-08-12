'use client'

import Link from 'next/link'
import cn from 'classnames'

import { CopyProfileLinkButton } from '@/features/master-cabinet/ui/copy-profile-link-button'
import { UpcomingSlotsList } from '@/features/master-cabinet/ui/upcoming-slots-list'
import { profileStatusLabel } from '@/features/master-cabinet/model/profile-status-label'
import { buildPublicProfilePath } from '@/features/master-cabinet/model/public-profile-url'
import { useMasterCabinet } from '@/features/master-cabinet/model/use-master-cabinet'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

export function MasterCabinetHub() {
  const {
    profile,
    profileError,
    isProfileLoading,
    upcomingSlots,
    isCalendarLoading,
  } = useMasterCabinet()

  if (isProfileLoading) {
    return (
      <div className={styles.wrap}>
        <section className={styles.panel}>
          <p className={styles.muted}>Загружаем кабинет…</p>
        </section>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className={styles.wrap}>
        <section className={styles.panel}>
          <p className={styles.error} role="alert">
            Не удалось загрузить профиль мастера
          </p>
        </section>
      </div>
    )
  }

  const publicPath = buildPublicProfilePath(profile.slug)
  const district = profile.primaryLocation?.districtName
  const isPublic = profile.status === 'published'

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Личный кабинет</p>
        <h1 className={styles.title}>{profile.displayName}</h1>
        <div className={styles.meta}>
          <span>{profileStatusLabel(profile.status)}</span>
          {district ? <span>{district}</span> : null}
        </div>
        {profile.headline ? (
          <p className={styles.headline}>{profile.headline}</p>
        ) : null}

        <div className={styles.actions}>
          <ButtonLink href="/app/master/profile">Редактировать профиль</ButtonLink>
          <ButtonLink href="/app/master/bookings" variant="ghost">
            Записи
          </ButtonLink>
          <ButtonLink href="/app/master/calendar" variant="ghost">
            Календарь
          </ButtonLink>
          <ButtonLink href="/app/onboarding" variant="ghost">
            Онбординг
          </ButtonLink>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Публичная страница</h2>
          <div className={styles.linkRow}>
            <Link className={styles.publicPath} href={publicPath}>
              {publicPath}
            </Link>
            <CopyProfileLinkButton slug={profile.slug} />
          </div>
          {!isPublic ? (
            <p className={styles.hint}>
              Страница станет доступна клиентам после публикации профиля.
            </p>
          ) : null}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Ближайшие свободные слоты</h2>
          <UpcomingSlotsList
            slots={upcomingSlots}
            isLoading={isCalendarLoading}
          />
          <div className={cn(styles.actions, styles.actionsAfter)}>
            <ButtonLink href="/app/master/calendar" variant="ghost">
              Открыть календарь
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
