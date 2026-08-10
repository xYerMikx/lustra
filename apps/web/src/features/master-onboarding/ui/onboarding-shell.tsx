'use client'

import { useEffect, useState } from 'react'
import type {
  DistrictView,
  MasterProfileView,
  MeResponse,
  PatchMasterProfileInput,
} from '@lustra/contracts'

import {
  CURRENT_ONBOARDING_STEP,
  ONBOARDING_STEPS,
} from '@/features/master-onboarding/model/onboarding-steps'
import { StepBasicsForm } from '@/features/master-onboarding/ui/step-basics-form'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import {
  getMasterProfile,
  listDistricts,
  patchMasterProfile,
} from '@/shared/api/master-profile-client'

type OnboardingShellProps = {
  user: MeResponse
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: MasterProfileView; districts: DistrictView[] }

export function OnboardingShell({ user }: OnboardingShellProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const profile = await getMasterProfile()
        const districtResponse = await listDistricts()

        if (cancelled) {
          return
        }

        if (!profile || !districtResponse) {
          setState({
            status: 'error',
            message: 'Не удалось загрузить профиль',
          })

          return
        }

        setState({
          status: 'ready',
          profile,
          districts: districtResponse.districts,
        })
      } catch (error: unknown) {
        if (cancelled) {
          return
        }

        const message =
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить профиль'

        setState({ status: 'error', message })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const saveStepBasics = async (
    input: PatchMasterProfileInput,
  ): Promise<MasterProfileView> => {
    const updated = await patchMasterProfile(input)

    if (!updated) {
      throw new ApiError(500, {
        code: 'INTERNAL',
        message: 'Не удалось сохранить профиль',
      })
    }

    setState((current) => {
      if (current.status !== 'ready') {
        return current
      }

      return { ...current, profile: updated }
    })

    return updated
  }

  if (state.status === 'loading') {
    return (
      <section className={styles.panel}>
        <p className={styles.copy}>Загружаем профиль…</p>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className={styles.panel}>
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      </section>
    )
  }

  const { profile, districts } = state
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === CURRENT_ONBOARDING_STEP,
  )

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Онбординг мастера</p>
      <h1 className={styles.title}>Расскажите о себе</h1>
      <p className={styles.copy}>
        Шаг {currentStepIndex + 1} из {ONBOARDING_STEPS.length} — имя, район и
        короткий заголовок для страницы{' '}
        <span className={styles.slugHint}>/m/{profile.slug}</span>
      </p>

      <ol className={styles.steps} aria-label="Прогресс онбординга">
        {ONBOARDING_STEPS.map((step) => {
          const isCurrent = step.id === CURRENT_ONBOARDING_STEP

          return (
            <li
              key={step.id}
              className={isCurrent ? styles.stepActive : styles.stepPending}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {step.label}
            </li>
          )
        })}
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
