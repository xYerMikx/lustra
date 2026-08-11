'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  PutMasterScheduleInputSchema,
  type MasterScheduleView,
  type PutMasterScheduleInput,
} from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import { buildStepScheduleDefaults } from '@/features/master-onboarding/model/build-step-schedule-defaults'
import {
  SCHEDULE_PRESETS,
  WEEKDAY_LABELS,
  dayDraftsToRules,
  minutesToTimeInput,
  rulesToDayDrafts,
  timeInputToMinutes,
  type DayScheduleDraft,
  type SchedulePresetId,
} from '@/features/master-onboarding/model/schedule-presets'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

type StepScheduleFormProps = {
  initialSchedule: MasterScheduleView | null
  onSave: (input: PutMasterScheduleInput) => Promise<MasterScheduleView>
  onBack: () => void
}

export function StepScheduleForm({
  initialSchedule,
  onSave,
  onBack,
}: StepScheduleFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const defaults = buildStepScheduleDefaults(initialSchedule)
  const [dayDrafts, setDayDrafts] = useState<Record<number, DayScheduleDraft>>(
    () => rulesToDayDrafts(defaults.rules),
  )

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PutMasterScheduleInput>({
    resolver: zodResolver(PutMasterScheduleInputSchema),
    defaultValues: defaults,
  })

  const syncRules = (nextDrafts: Record<number, DayScheduleDraft>) => {
    setDayDrafts(nextDrafts)
    setValue('rules', dayDraftsToRules(nextDrafts), { shouldValidate: true })
  }

  const applyPreset = (presetId: SchedulePresetId) => {
    const preset = SCHEDULE_PRESETS.find((item) => item.id === presetId)

    if (!preset) {
      return
    }

    const rules = preset.build()
    syncRules(rulesToDayDrafts(rules))
    setFormError(null)
  }

  const toggleDay = (weekday: number, enabled: boolean) => {
    const current = dayDrafts[weekday]

    if (!current) {
      return
    }

    syncRules({
      ...dayDrafts,
      [weekday]: { ...current, enabled },
    })
  }

  const changeDayTime = (
    weekday: number,
    field: 'startMin' | 'endMin',
    value: string,
  ) => {
    const minutes = timeInputToMinutes(value)
    const current = dayDrafts[weekday]

    if (minutes == null || !current) {
      return
    }

    syncRules({
      ...dayDrafts,
      [weekday]: { ...current, [field]: minutes },
    })
  }

  const submitForm = async (data: PutMasterScheduleInput) => {
    setFormError(null)

    const payload: PutMasterScheduleInput = {
      rules: dayDraftsToRules(dayDrafts),
      policy: data.policy,
    }

    if (payload.rules.length === 0) {
      setFormError('Выберите хотя бы один рабочий день')

      return
    }

    try {
      await onSave(payload)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось сохранить график')
    }
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <div className={styles.templateBlock}>
        <p className={styles.legend}>Быстрый выбор</p>
        <div className={styles.templateList}>
          {SCHEDULE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.templateChip}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Рабочие дни</legend>
        <div className={styles.dayList}>
          {WEEKDAY_LABELS.map((day) => {
            const draft = dayDrafts[day.weekday]

            if (!draft) {
              return null
            }

            return (
              <div key={day.weekday} className={styles.dayRow}>
                <label className={styles.dayToggle}>
                  <input
                    type="checkbox"
                    className={styles.radioInput}
                    checked={draft.enabled}
                    onChange={(event) =>
                      toggleDay(day.weekday, event.target.checked)
                    }
                  />
                  <span>{day.label}</span>
                </label>
                <label className={styles.dayTimeField}>
                  <span className={styles.dayTimeLabel}>с</span>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={minutesToTimeInput(draft.startMin)}
                    disabled={!draft.enabled}
                    onChange={(event) =>
                      changeDayTime(day.weekday, 'startMin', event.target.value)
                    }
                  />
                </label>
                <label className={styles.dayTimeField}>
                  <span className={styles.dayTimeLabel}>до</span>
                  <input
                    type="time"
                    className={styles.timeInput}
                    value={minutesToTimeInput(draft.endMin)}
                    disabled={!draft.enabled}
                    onChange={(event) =>
                      changeDayTime(day.weekday, 'endMin', event.target.value)
                    }
                  />
                </label>
              </div>
            )
          })}
        </div>
        {errors.rules ? (
          <span className={formStyles.fieldError}>
            {errors.rules.message ?? 'Проверьте интервалы'}
          </span>
        ) : null}
      </fieldset>

      <label className={formStyles.field}>
        <span>Шаг сетки, мин</span>
        <select
          className={styles.select}
          {...register('policy.granularityMin', { valueAsNumber: true })}
        >
          <option value={15}>15</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
        </select>
      </label>

      <label className={formStyles.field}>
        <span>Лид-тайм, часов</span>
        <input
          type="number"
          min={0}
          max={168}
          {...register('policy.leadTimeHours', { valueAsNumber: true })}
        />
        {errors.policy?.leadTimeHours ? (
          <span className={formStyles.fieldError}>
            {errors.policy.leadTimeHours.message}
          </span>
        ) : null}
      </label>

      <label className={formStyles.field}>
        <span>Горизонт бронирования, дней</span>
        <input
          type="number"
          min={1}
          max={90}
          {...register('policy.horizonDays', { valueAsNumber: true })}
        />
        {errors.policy?.horizonDays ? (
          <span className={formStyles.fieldError}>
            {errors.policy.horizonDays.message}
          </span>
        ) : null}
      </label>

      {formError ? (
        <p className={formStyles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Назад
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохраняем…' : 'Сохранить и перейти в кабинет'}
        </Button>
      </div>
    </form>
  )
}
