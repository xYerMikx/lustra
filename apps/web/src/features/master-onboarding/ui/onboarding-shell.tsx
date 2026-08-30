'use client'

import { useEffect, useReducer, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  CreateServiceInput,
  MasterProfileView,
  MeResponse,
  PatchMasterProfileInput,
  PutMasterScheduleInput,
} from '@lumira/contracts'

import {
  onboardingDataReducer,
  type OnboardingDataState,
} from '@/features/master-onboarding/model/onboarding-data-reducer'
import {
  ONBOARDING_STEPS,
  wizardStepFromOnboarding,
  type OnboardingStepId,
} from '@/features/master-onboarding/model/onboarding-steps'
import { OnboardingProgress } from '@/features/master-onboarding/ui/onboarding-progress'
import { StepBasicsForm } from '@/features/master-onboarding/ui/step-basics-form'
import { StepPortfolioCta } from '@/features/master-onboarding/ui/step-portfolio-cta'
import { StepScheduleForm } from '@/features/master-onboarding/ui/step-schedule-form'
import { StepServiceForm } from '@/features/master-onboarding/ui/step-service-form'
import { loadSession } from '@/features/auth/model/load-session'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { TEST_ID, onboardingStepTestId } from '@/shared/lib/test-id'
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

const STEP_COPY: Record<
  OnboardingStepId,
  { title: string; description: string }
> = {
  profile: {
    title: 'Расскажите о себе',
    description: 'Имя, район и короткий заголовок для публичной страницы',
  },
  services: {
    title: 'Добавьте первую услугу',
    description: 'Шаблон или своё название, длительность и цена',
  },
  schedule: {
    title: 'Настройте график',
    description: 'Рабочие дни, шаг сетки и правила записи',
  },
  portfolio: {
    title: 'Покажите работы',
    description: 'Фото с телефона — клиенты выбирают глазами',
  },
}

export function OnboardingShell({ user }: OnboardingShellProps) {
  const router = useRouter()
  const [currentStepId, setCurrentStepId] = useState<OnboardingStepId>(() =>
    wizardStepFromOnboarding(user.onboardingStep),
  )
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

  const goToCabinet = () => {
    router.push('/app')
    router.refresh()
  }

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
    await loadSession({ force: true })
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
    await loadSession({ force: true })

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
    await loadSession({ force: true })
    setCurrentStepId('portfolio')

    return saved
  }

  if (dataState.status === 'loading') {
    return (
      <div className={styles.panelWrap}>
        <section className={styles.panel}>
          <p className={styles.copy}>Загружаем профиль…</p>
        </section>
      </div>
    )
  }

  if (dataState.status === 'error') {
    return (
      <div className={styles.panelWrap}>
        <section className={styles.panel}>
          <p className={styles.error} role="alert">
            {dataState.message}
          </p>
        </section>
      </div>
    )
  }

  const { profile, districts, categories, schedule } = dataState
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId,
  )
  const stepCopy = STEP_COPY[currentStepId]

  return (
    <div className={styles.panelWrap} data-testid={TEST_ID.pageOnboarding}>
      <section
        className={styles.panel}
        data-testid={onboardingStepTestId(currentStepId)}
      >
        <p className={styles.eyebrow}>Быстрый старт · 4 шага</p>
        <h1 className={styles.title}>{stepCopy.title}</h1>
        <p className={styles.copy}>
          Шаг {currentStepIndex + 1} из {ONBOARDING_STEPS.length}.{' '}
          {currentStepId === 'profile' ? (
            <>
              {stepCopy.description}{' '}
              <span className={styles.slugHint} data-testid={TEST_ID.onboardingSlug}>
                /m/{profile.slug}
              </span>
            </>
          ) : (
            stepCopy.description
          )}
        </p>

        <p className={styles.skipNote}>
          Все шаги можно пропустить и заполнить позже в кабинете — услуги,
          график и профиль останутся доступны для редактирования.
        </p>

        <OnboardingProgress currentStepId={currentStepId} />

        {currentStepId === 'profile' ? (
          <StepBasicsForm
            profile={profile}
            districts={districts}
            userFirstName={user.firstName}
            onSave={saveStepBasics}
            onSkip={goToCabinet}
          />
        ) : null}

        {currentStepId === 'services' ? (
          <StepServiceForm
            categories={categories}
            onSave={saveStepService}
            onBack={() => setCurrentStepId('profile')}
            onSkip={goToCabinet}
          />
        ) : null}

        {currentStepId === 'schedule' ? (
          <StepScheduleForm
            initialSchedule={schedule}
            onSave={saveStepSchedule}
            onBack={() => setCurrentStepId('services')}
            onSkip={() => setCurrentStepId('portfolio')}
          />
        ) : null}

        {currentStepId === 'portfolio' ? (
          <StepPortfolioCta
            onBack={() => setCurrentStepId('schedule')}
            onSkip={goToCabinet}
          />
        ) : null}
      </section>
    </div>
  )
}
