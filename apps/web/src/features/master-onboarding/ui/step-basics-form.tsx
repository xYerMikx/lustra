'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import {
  PatchMasterProfileInputSchema,
  type DistrictView,
  type LocationType,
  type MasterProfileView,
  type PatchMasterProfileInput,
} from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'
import {
  LOCATION_TYPE_LABELS,
  readStepBasicsDraft,
  writeStepBasicsDraft,
  type StepBasicsDraft,
} from '../model/step-basics-draft'
import formStyles from '@/features/auth/ui/auth-form.module.css'
import styles from './onboarding.module.css'

type StepBasicsFormProps = {
  profile: MasterProfileView
  districts: DistrictView[]
  userFirstName: string
  onSave: (input: PatchMasterProfileInput) => Promise<MasterProfileView>
}

function buildInitialDraft(
  profile: MasterProfileView,
  userFirstName: string,
  districts: DistrictView[],
): StepBasicsDraft {
  const stored = readStepBasicsDraft()
  if (stored) {
    return stored
  }

  return {
    displayName: profile.displayName || userFirstName,
    districtId: profile.primaryLocation?.districtId ?? districts[0]?.id ?? '',
    locationType: profile.primaryLocation?.type ?? 'salon',
    headline: profile.headline ?? '',
  }
}

export function StepBasicsForm({
  profile,
  districts,
  userFirstName,
  onSave,
}: StepBasicsFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [locationType, setLocationType] = useState<LocationType>('salon')
  const [headline, setHeadline] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const draft = buildInitialDraft(profile, userFirstName, districts)
    const resolvedDistrictId =
      draft.districtId || districts[0]?.id || ''

    setDisplayName(draft.displayName)
    setDistrictId(resolvedDistrictId)
    setLocationType(draft.locationType)
    setHeadline(draft.headline)
    setInitialized(true)
  }, [profile, userFirstName, districts])

  useEffect(() => {
    if (!initialized || !districtId) {
      return
    }

    writeStepBasicsDraft({
      displayName,
      districtId,
      locationType,
      headline,
    })
  }, [displayName, districtId, locationType, headline, initialized])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = PatchMasterProfileInputSchema.safeParse({
      displayName,
      districtId,
      locationType,
      headline: headline.trim() ? headline.trim() : null,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля')
      return
    }

    setPending(true)
    try {
      await onSave(parsed.data)
      router.push('/app')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Не удалось сохранить профиль')
      }
    } finally {
      setPending(false)
    }
  }

  if (!initialized) {
    return null
  }

  return (
    <form className={formStyles.form} onSubmit={onSubmit} noValidate>
      <label className={formStyles.field}>
        <span>Имя или бренд</span>
        <input
          type="text"
          name="displayName"
          autoComplete="organization"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
      </label>

      <label className={formStyles.field}>
        <span>Район</span>
        <select
          className={styles.select}
          name="districtId"
          value={districtId}
          onChange={(event) => setDistrictId(event.target.value)}
          required
        >
          <option value="" disabled>
            Выберите район
          </option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Формат работы</legend>
        <div className={styles.radioGroup}>
          {(Object.keys(LOCATION_TYPE_LABELS) as LocationType[]).map((type) => (
            <label key={type} className={styles.radioOption}>
              <input
                type="radio"
                name="locationType"
                value={type}
                checked={locationType === type}
                onChange={() => setLocationType(type)}
              />
              <span>{LOCATION_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={formStyles.field}>
        <span>Короткий заголовок</span>
        <input
          type="text"
          name="headline"
          placeholder="Мастер маникюра, 5 лет опыта"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          maxLength={120}
        />
      </label>

      {error ? (
        <p className={formStyles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={pending || !districtId}>
        {pending ? 'Сохраняем…' : 'Сохранить и продолжить'}
      </button>
    </form>
  )
}
