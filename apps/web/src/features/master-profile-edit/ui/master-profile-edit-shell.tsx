'use client'

import { useEffect, useState } from 'react'
import type { DistrictView, MasterProfileView } from '@lumira/contracts'

import { useMasterSession } from '@/features/auth'
import { MasterProfileEditForm } from '@/features/master-profile-edit/ui/master-profile-edit-form'
import { ProfileLedgerHint } from '@/features/master-profile-edit/ui/profile-ledger-hint'
import { TelegramLinkCard } from '@/features/telegram-link'
import { ApiError } from '@/shared/api/http'
import {
  getMasterProfile,
  listDistricts,
} from '@/shared/api/master-profile-client'
import styles from '@/features/master-profile-edit/ui/master-profile-edit.module.css'

type LoadStatus = 'loading' | 'error' | 'success'

export function MasterProfileEditShell() {
  const session = useMasterSession()
  const [profile, setProfile] = useState<MasterProfileView | null>(null)
  const [districts, setDistricts] = useState<DistrictView[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const [nextProfile, districtsResponse] = await Promise.all([
          getMasterProfile(),
          listDistricts(),
        ])

        if (cancelled) {
          return
        }

        setProfile(nextProfile)
        setDistricts(districtsResponse.districts)
        setStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setProfile(null)
        setDistricts([])
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить данные профиля',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className={styles.wrap}>
        <section className={styles.panel}>
          <p className={styles.muted}>Загружаем профиль…</p>
        </section>
      </div>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <div className={styles.wrap}>
        <section className={styles.panel}>
          <p className={styles.error} role="alert">
            {errorMessage ?? 'Не удалось загрузить данные профиля'}
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Профиль</p>
        <h1 className={styles.title}>Редактирование</h1>
        <p className={styles.copy}>
          Имя, ссылка на страницу, район и описание для клиентов.
        </p>
        <MasterProfileEditForm
          profile={profile}
          districts={districts}
          onProfileSaved={setProfile}
        />
        <ProfileLedgerHint />
        <TelegramLinkCard linked={session.telegramLinked} audience="master" />
      </section>
    </div>
  )
}
