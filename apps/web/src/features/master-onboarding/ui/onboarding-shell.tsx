'use client'

import { useEffect, useReducer, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  CreateServiceInput,
  MasterProfileView,
  MeResponse,
  PatchMasterProfileInput,
  PutMasterScheduleInput,
} from '@lustra/contracts'

import {
  onboardingDataReducer,
  type OnboardingDataState,
} from '@/features/master-onboarding/model/onboarding-data-reducer'
import {
  ONBOARDING_STEPS,
  stepStatus,
  type OnboardingStepId,
} from '@/features/master-onboarding/model/onboarding-steps'
import { StepBasicsForm } from '@/features/master-onboarding/ui/step-basics-form'
import { StepScheduleForm } from '@/features/master-onboarding/ui/step-schedule-form'
import { StepServiceForm } from '@/features/master-onboarding/ui/step-service-form'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import {
  getMasterProfile,
  listDistricts,
  patchMasterProfile,
} from '@/shared/api/master-profile-client'
import {
  getMasterSchedule,
  putMasterScheduleRules,
} from '@/shared/api/master-schedule-client'
import {
  createMasterService,
  listCategories,
} from '@/shared/api/master-services-client'

type OnboardingShellProps = {
  user: MeResponse
}

const INITIAL_DATA_STATE: OnboardingDataState = { status: 'loading' }

const STEP_CLASS = {
  done: styles.stepDone,
  active: styles.stepActive,
  pending: styles.stepPending,
} as const

const STEP_COPY: Record<
  OnboardingStepId,
  { title: string; description: string }
> = {
  profile: {
    title: 'Расскажите о себе',
    description: 'имя, район и короткий заголовок для страницы',
  },
  services: {
    title: 'Добавьте первую услугу',
    description: 'выберите шаблон или задайте название, длительность и цену',
  },
  schedule: {
    title: 'Настройте график',
    description: 'рабочие дни, шаг сетки, лид-тайм и горизонт бронирования',
  },
  portfolio: {
    title: 'Портфолио',
    description: 'этот шаг подключим позже',
  },
}

export function OnboardingShell({ user }: OnboardingShellProps) {
  const router = useRouter()
  const [currentStepId, setCurrentStepId] =
    useState<OnboardingStepId>('profile')
  const [dataState, dispatchData] = useReducer(
    onboardingDataReducer,
    INITIAL_DATA_STATE,
  )

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const profile = await getMasterProfile()
        const districtResponse = await listDistricts()
        const categoryResponse = await listCategories()
        const scheduleResponse = await getMasterSchedule().catch(() => null)
        const schedule = scheduleResponse ?? null

        if (cancelled) {
          return
        }

        if (!profile || !districtResponse || !categoryResponse) {
          dispatchData({
            type: 'load_failed',
            message: 'Не удалось загрузить профиль',
          })

          return
        }

        dispatchData({
          type: 'load_succeeded',
          profile,
          districts: districtResponse.districts,
          categories: categoryResponse.categories,
          schedule,
        })
      } catch (error: unknown) {
        if (cancelled) {
          return
        }

        const message =
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить профиль'

        dispatchData({ type: 'load_failed', message })
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

    dispatchData({ type: 'profile_updated', profile: updated })
    setCurrentStepId('services')

    return updated
  }

  const saveStepService = async (input: CreateServiceInput) => {
    const created = await createMasterService(input)

    if (!created) {
      throw new ApiError(500, {
        code: 'INTERNAL',
        message: 'Не удалось сохранить услугу',
      })
    }

    setCurrentStepId('schedule')

    return created
  }

  const saveStepSchedule = async (input: PutMasterScheduleInput) => {
    const saved = await putMasterScheduleRules(input)

    if (!saved) {
      throw new ApiError(500, {
        code: 'INTERNAL',
        message: 'Не удалось сохранить график',
      })
    }

    dispatchData({ type: 'schedule_updated', schedule: saved })

    router.push('/app')
    router.refresh()

    return saved
  }

  if (dataState.status === 'loading') {
    return (
      <section className={styles.panel}>
        <p className={styles.copy}>Загружаем профиль…</p>
      </section>
    )
  }

  if (dataState.status === 'error') {
    return (
      <section className={styles.panel}>
        <p className={styles.error} role="alert">
          {dataState.message}
        </p>
      </section>
    )
  }

  const { profile, districts, categories, schedule } = dataState
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId,
  )
  const stepCopy = STEP_COPY[currentStepId]

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Онбординг мастера</p>
      <h1 className={styles.title}>{stepCopy.title}</h1>
      <p className={styles.copy}>
        Шаг {currentStepIndex + 1} из {ONBOARDING_STEPS.length} —{' '}
        {currentStepId === 'profile' ? (
          <>
            {stepCopy.description}{' '}
            <span className={styles.slugHint}>/m/{profile.slug}</span>
          </>
        ) : (
          stepCopy.description
        )}
      </p>

      <ol className={styles.steps} aria-label="Прогресс онбординга">
        {ONBOARDING_STEPS.map((step) => {
          const status = stepStatus(step.id, currentStepId)

          return (
            <li
              key={step.id}
              className={STEP_CLASS[status]}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              {step.label}
            </li>
          )
        })}
      </ol>

      {currentStepId === 'profile' ? (
        <StepBasicsForm
          profile={profile}
          districts={districts}
          userFirstName={user.firstName}
          onSave={saveStepBasics}
        />
      ) : null}

      {currentStepId === 'services' ? (
        <StepServiceForm
          categories={categories}
          onSave={saveStepService}
          onBack={() => setCurrentStepId('profile')}
        />
      ) : null}

      {currentStepId === 'schedule' ? (
        <StepScheduleForm
          initialSchedule={schedule}
          onSave={saveStepSchedule}
          onBack={() => setCurrentStepId('services')}
        />
      ) : null}
    </section>
  )
}
