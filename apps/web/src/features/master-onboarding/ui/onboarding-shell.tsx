'use client'

import { useEffect, useState } from 'react'
import type { DistrictView, MasterProfileView, MeResponse } from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'
import {
  getMasterProfile,
  listDistricts,
  patchMasterProfile,
} from '@/shared/api/master-profile-client'
import { StepBasicsForm } from './step-basics-form'
import styles from './onboarding.module.css'

type OnboardingShellProps = {
  user: MeResponse
}

export function OnboardingShell({ user }: OnboardingShellProps) {
  const [profile, setProfile] = useState<MasterProfileView | null>(null)
  const [districts, setDistricts] = useState<DistrictView[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([getMasterProfile(), listDistricts()])
      .then(([loadedProfile, districtResponse]) => {
        if (cancelled) {
          return
        }
        setProfile(loadedProfile)
        setDistricts(districtResponse.districts)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        if (error instanceof ApiError) {
          setLoadError(error.message)
        } else {
          setLoadError('Не удалось загрузить профиль')
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function saveStepBasics(input: Parameters<typeof patchMasterProfile>[0]) {
    const updated = await patchMasterProfile(input)
    setProfile(updated)
    return updated
  }

  if (loading) {
    return (
      <section className={styles.panel}>
        <p className={styles.copy}>Загружаем профиль…</p>
      </section>
    )
  }

  if (loadError || !profile) {
    return (
      <section className={styles.panel}>
        <p className={styles.error} role="alert">
          {loadError ?? 'Профиль недоступен'}
        </p>
      </section>
    )
  }

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Онбординг мастера</p>
      <h1 className={styles.title}>Расскажите о себе</h1>
      <p className={styles.copy}>
        Шаг 1 из 4 — имя, район и короткий заголовок для страницы{' '}
        <span className={styles.slugHint}>/m/{profile.slug}</span>
      </p>

      <ol className={styles.steps} aria-label="Прогресс онбординга">
        <li className={styles.stepActive} aria-current="step">
          Профиль
        </li>
        <li className={styles.stepPending}>Услуги</li>
        <li className={styles.stepPending}>График</li>
        <li className={styles.stepPending}>Портфолио</li>
      </ol>

      <StepBasicsForm
        profile={profile}
        districts={districts}
        userFirstName={user.firstName}
        onSave={saveStepBasics}
      />
    </section>
  )
}
