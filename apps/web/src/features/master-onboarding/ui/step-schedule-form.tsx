'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  PutMasterScheduleInputSchema,
  type MasterScheduleView,
  type PutMasterScheduleInput,
} from '@lustra/contracts'
import cn from 'classnames'

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
import { Field, TextInput } from '@/shared/ui/field'
import { FormSelect } from '@/shared/ui/select'

type StepScheduleFormProps = {
  initialSchedule: MasterScheduleView | null
  onSave: (input: PutMasterScheduleInput) => Promise<MasterScheduleView>
  onBack: () => void
  onSkip: () => void
}

export function StepScheduleForm({
  initialSchedule,
  onSave,
  onBack,
  onSkip,
}: StepScheduleFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const defaults = buildStepScheduleDefaults(initialSchedule)
  const [dayDrafts, setDayDrafts] = useState<Record<number, DayScheduleDraft>>(
    () => rulesToDayDrafts(defaults.rules),
  )

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PutMasterScheduleInput>({
    resolver: zodResolver(PutMasterScheduleInputSchema),
    defaultValues: defaults,
  })

  const leadRegister = register('policy.leadTimeHours', { valueAsNumber: true })
  const horizonRegister = register('policy.horizonDays', { valueAsNumber: true })

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

  const granularityOptions = [
    { value: '15', label: '15 мин' },
    { value: '30', label: '30 мин' },
    { value: '60', label: '60 мин' },
  ]

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
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
              <div
                key={day.weekday}
                className={cn(
                  styles.dayRow,
                  !draft.enabled && styles.dayRowDisabled,
                )}
              >
                <label className={styles.dayToggle}>
                  <input
                    type="checkbox"
                    className={styles.dayCheck}
                    checked={draft.enabled}
                    onChange={(event) =>
                      toggleDay(day.weekday, event.target.checked)
                    }
                  />
                  <span>{day.label}</span>
                </label>
                <div className={styles.dayTimes}>
                  <input
                    type="time"
                    className={styles.timeInput}
                    aria-label={`${day.label}, с`}
                    value={minutesToTimeInput(draft.startMin)}
                    disabled={!draft.enabled}
                    onChange={(event) =>
                      changeDayTime(day.weekday, 'startMin', event.target.value)
                    }
                  />
                  <span className={styles.dayTimeSep} aria-hidden>
                    —
                  </span>
                  <input
                    type="time"
                    className={styles.timeInput}
                    aria-label={`${day.label}, до`}
                    value={minutesToTimeInput(draft.endMin)}
                    disabled={!draft.enabled}
                    onChange={(event) =>
                      changeDayTime(day.weekday, 'endMin', event.target.value)
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
        {errors.rules ? (
          <span className={styles.fieldError}>
            {errors.rules.message ?? 'Проверьте интервалы'}
          </span>
        ) : null}
      </fieldset>

      <Field
        label="Шаг сетки"
        htmlFor="onboarding-granularity"
        error={errors.policy?.granularityMin?.message}
      >
        <FormSelect
          id="onboarding-granularity"
          control={control}
          name="policy.granularityMin"
          options={granularityOptions}
          valueAsNumber
        />
      </Field>

      <Field
        label="Лид-тайм, часов"
        htmlFor="onboarding-lead"
        error={errors.policy?.leadTimeHours?.message}
      >
        <TextInput
          id="onboarding-lead"
          type="number"
          min={0}
          max={168}
          invalid={Boolean(errors.policy?.leadTimeHours)}
          {...leadRegister}
        />
      </Field>

      <Field
        label="Горизонт бронирования, дней"
        htmlFor="onboarding-horizon"
        error={errors.policy?.horizonDays?.message}
      >
        <TextInput
          id="onboarding-horizon"
          type="number"
          min={1}
          max={90}
          invalid={Boolean(errors.policy?.horizonDays)}
          {...horizonRegister}
        />
      </Field>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Назад
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip} disabled={isSubmitting}>
          Пропустить
        </Button>
        <Button type="submit" className={styles.actionsGrow} disabled={isSubmitting}>
          {isSubmitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
        </Button>
      </div>
    </form>
  )
}
