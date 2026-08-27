'use client'

import cn from 'classnames'

import { useSession } from '@/features/auth'
import { profileStatusLabel } from '@/features/master-cabinet/model/profile-status-label'
import { useMasterCabinet } from '@/features/master-cabinet/model/use-master-cabinet'
import { EmailVerifyBanner } from '@/features/master-cabinet/ui/email-verify-banner'
import { TelegramLinkCard } from '@/features/telegram-link'
import { LedgerSnapshotCard } from '@/features/master-cabinet/ui/ledger-snapshot-card'
import { PublicProfileShare } from '@/features/master-cabinet/ui/public-profile-share'
import { SubmitForReviewButton } from '@/features/master-cabinet/ui/submit-for-review-button'
import { UpcomingBookingsList } from '@/features/master-cabinet/ui/upcoming-bookings-list'
import { ButtonLink } from '@/shared/ui/button'
import { PencilIcon } from '@/shared/ui/icon-pack'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

export function MasterCabinetHub() {
  const session = useSession()
  const {
    profile,
    profileError,
    isProfileLoading,
    upcomingBookings,
    isCalendarLoading,
    services,
    setProfile,
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

  const district = profile.primaryLocation?.districtName
  const isPublic =
    profile.status === 'published' || profile.status === 'pending_review'
  const canSubmit = profile.status === 'draft'

  return (
    <div className={styles.wrap} data-testid={TEST_ID.pageMasterCabinet}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Личный кабинет</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{profile.displayName}</h1>
          <ButtonLink
            href="/app/master/profile"
            variant="icon"
            aria-label="Редактировать профиль"
            title="Редактировать профиль"
          >
            <PencilIcon />
          </ButtonLink>
        </div>
        <div className={styles.meta}>
          <span>{profileStatusLabel(profile.status)}</span>
          {district ? <span>{district}</span> : null}
        </div>
        {profile.headline ? (
          <p className={styles.headline}>{profile.headline}</p>
        ) : null}

        {!session.emailVerified ? <EmailVerifyBanner /> : null}
        <TelegramLinkCard linked={session.telegramLinked} audience="master" />
        <LedgerSnapshotCard />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Публичная страница</h2>
          <PublicProfileShare
            slug={profile.slug}
            displayName={profile.displayName}
          />
          {canSubmit && session.emailVerified ? (
            <div className={cn(styles.actions, styles.actionsAfter)}>
              <SubmitForReviewButton onPublished={setProfile} />
            </div>
          ) : null}
          {profile.status === 'draft' ? (
            <p className={styles.hint}>
              Черновик не открывается по ссылке. Отправьте профиль на проверку.
            </p>
          ) : null}
          {profile.status === 'pending_review' ? (
            <p className={styles.hint}>
              Ссылка уже работает. В каталоге появится после одобрения.
            </p>
          ) : null}
          {!isPublic && profile.status !== 'draft' ? (
            <p className={styles.hint}>
              Страница сейчас недоступна клиентам ({profileStatusLabel(profile.status)}).
            </p>
          ) : null}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Услуги</h2>
          {services.length === 0 ? (
            <p className={styles.muted}>
              Услуг пока нет. Добавьте хотя бы одну — клиенты смогут записаться.
            </p>
          ) : (
            <ul className={styles.slotList}>
              {services.map((service) => (
                <li key={service.id} className={styles.slotItem}>
                  <span>{service.title}</span>
                  <span className={styles.slotTime}>
                    {service.durationMin} мин
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className={cn(styles.actions, styles.actionsAfter)}>
            <ButtonLink href="/app/onboarding" variant="ghost">
              Настроить услуги
            </ButtonLink>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {upcomingBookings?.isToday
              ? 'Записи на сегодня'
              : 'Ближайшие записи'}
          </h2>
          <UpcomingBookingsList
            pick={upcomingBookings}
            isLoading={isCalendarLoading}
          />
          <div className={cn(styles.actions, styles.actionsAfter, styles.hubActions)}>
            <ButtonLink href="/app/master/calendar" fullWidth>
              Открыть календарь
            </ButtonLink>
            <ButtonLink href="/app/master/clients" variant="ghost" fullWidth>
              Клиенты
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
