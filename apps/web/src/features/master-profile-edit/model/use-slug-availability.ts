'use client'

import { useEffect, useState } from 'react'
import type { UseFormClearErrors, UseFormSetError } from 'react-hook-form'
import { MasterSlugSchema } from '@lustra/contracts'

import type { EditMasterProfileFormValues } from '@/features/master-profile-edit/model/edit-profile-form-schema'
import { checkSlugAvailability } from '@/shared/api/master-profile-client'

export type SlugAvailabilityState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'taken' }

export function useSlugAvailability(
  slugValue: string,
  currentSlug: string,
  setError: UseFormSetError<EditMasterProfileFormValues>,
  clearErrors: UseFormClearErrors<EditMasterProfileFormValues>,
) {
  const [slugState, setSlugState] = useState<SlugAvailabilityState>({
    kind: 'idle',
  })

  useEffect(() => {
    const parsed = MasterSlugSchema.safeParse(slugValue)

    if (!parsed.success) {
      setSlugState({ kind: 'idle' })

      return
    }

    if (parsed.data === currentSlug) {
      setSlugState({ kind: 'available' })

      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setSlugState({ kind: 'checking' })

        try {
          const result = await checkSlugAvailability(parsed.data)

          if (cancelled) {
            return
          }

          if (result.available) {
            setSlugState({ kind: 'available' })
            clearErrors('slug')
          } else {
            setSlugState({ kind: 'taken' })
            setError('slug', {
              type: 'manual',
              message: 'Этот адрес уже занят',
            })
          }
        } catch {
          if (!cancelled) {
            setSlugState({ kind: 'idle' })
          }
        }
      })()
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [slugValue, currentSlug, setError, clearErrors])

  return slugState
}

export function slugAvailabilityCopy(
  state: SlugAvailabilityState,
  slugValue: string,
): string {
  if (state.kind === 'checking') {
    return 'Проверяем доступность…'
  }

  if (state.kind === 'taken') {
    return 'Этот адрес уже занят'
  }

  if (state.kind === 'available') {
    return `Страница: /m/${slugValue}`
  }

  return 'Латиница, цифры и дефис — например anna-nails'
}
