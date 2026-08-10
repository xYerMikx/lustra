'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  CreateServiceInput,
  DistrictView,
  MasterProfileView,
  MeResponse,
  PatchMasterProfileInput,
  ServiceCategoryView,
} from '@lustra/contracts'

import {
  ONBOARDING_STEPS,
  stepStatus,
  type OnboardingStepId,
} from '@/features/master-onboarding/model/onboarding-steps'
import { StepBasicsForm } from '@/features/master-onboarding/ui/step-basics-form'
import { StepServiceForm } from '@/features/master-onboarding/ui/step-service-form'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import {
  getMasterProfile,
  listDistricts,
  patchMasterProfile,
} from '@/shared/api/master-profile-client'
import {
  createMasterService,
  listCategories,
} from '@/shared/api/master-services-client'

type OnboardingShellProps = {
  user: MeResponse
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready'
      profile: MasterProfileView
      districts: DistrictView[]
      categories: ServiceCategoryView[]
    }

const STEP_CLASS = {
  done: styles.stepDone,
  active: styles.stepActive,
  pending: styles.stepPending,
} as const

export function OnboardingShell({ user }: OnboardingShellProps) {
  const router = useRouter()
  const [currentStepId, setCurrentStepId] =
    useState<OnboardingStepId>('profile')
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const profile = await getMasterProfile()
        const districtResponse = await listDistricts()
        const categoryResponse = await listCategories()

        if (cancelled) {
          return
        }

        if (!profile || !districtResponse || !categoryResponse) {
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
          categories: categoryResponse.categories,
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

    router.push('/app')
    router.refresh()

    return created
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

  const { profile, districts, categories } = state
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId,
  )
  const title =
    currentStepId === 'services'
      ? 'Добавьте первую услугу'
      : 'Расскажите о себе'

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Онбординг мастера</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.copy}>
        Шаг {currentStepIndex + 1} из {ONBOARDING_STEPS.length} —{' '}
        {currentStepId === 'profile' ? (
          <>
            имя, район и короткий заголовок для страницы{' '}
            <span className={styles.slugHint}>/m/{profile.slug}</span>
          </>
        ) : (
          'выберите шаблон или задайте название, длительность и цену'
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
      ) : (
        <StepServiceForm
          categories={categories}
          onSave={saveStepService}
          onBack={() => setCurrentStepId('profile')}
        />
      )}
    </section>
  )
}
