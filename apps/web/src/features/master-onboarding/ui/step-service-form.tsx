'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateServiceInputSchema,
  type CreateServiceInput,
  type ServiceCategoryView,
  type ServiceTemplateView,
  type ServiceView,
} from '@lustra/contracts'
import cn from 'classnames'

import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { listServiceTemplates } from '@/shared/api/master-services-client'
import { Button } from '@/shared/ui/button'
import { Field, TextInput } from '@/shared/ui/field'
import { FormSelect } from '@/shared/ui/select'

type StepServiceFormProps = {
  categories: ServiceCategoryView[]
  onSave: (input: CreateServiceInput) => Promise<ServiceView>
  onBack: () => void
  onSkip: () => void
}

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180] as const

export function StepServiceForm({
  categories,
  onSave,
  onBack,
  onSkip,
}: StepServiceFormProps) {
  const [templates, setTemplates] = useState<ServiceTemplateView[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceInput>({
    resolver: zodResolver(CreateServiceInputSchema),
    defaultValues: {
      categoryId: categories[0]?.id ?? '',
      title: '',
      durationMin: 90,
      price: 60,
      priceType: 'fixed',
    },
  })

  const categoryId = watch('categoryId')
  const selectedCategory = categories.find((item) => item.id === categoryId)
  const titleRegister = register('title')
  const priceRegister = register('price', { valueAsNumber: true })

  useEffect(() => {
    if (!selectedCategory) {
      setTemplates([])

      return
    }

    let cancelled = false

    const loadTemplates = async () => {
      setTemplatesLoading(true)

      try {
        const response = await listServiceTemplates(selectedCategory.slug)

        if (cancelled) {
          return
        }

        setTemplates(response?.templates ?? [])
      } catch {
        if (cancelled) {
          return
        }

        setTemplates([])
      } finally {
        if (!cancelled) {
          setTemplatesLoading(false)
        }
      }
    }

    void loadTemplates()

    return () => {
      cancelled = true
    }
  }, [selectedCategory])

  const applyTemplate = (template: ServiceTemplateView) => {
    setValue('title', template.title, { shouldValidate: true })
    setValue('durationMin', template.durationMin, { shouldValidate: true })
    setValue('price', template.price, { shouldValidate: true })
    setValue('priceType', template.priceType, { shouldValidate: true })
    setActiveTemplateKey(`${template.categorySlug}-${template.title}`)
    setFormError(null)
  }

  const submitForm = async (data: CreateServiceInput) => {
    setFormError(null)

    try {
      await onSave(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось сохранить услугу')
    }
  }

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const durationOptions = DURATION_OPTIONS.map((minutes) => ({
    value: String(minutes),
    label: `${minutes} мин`,
  }))

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      <Field
        label="Категория"
        htmlFor="onboarding-category"
        error={errors.categoryId?.message}
      >
        <FormSelect
          id="onboarding-category"
          control={control}
          name="categoryId"
          options={categoryOptions}
          placeholder="Выберите категорию"
        />
      </Field>

      <div className={styles.templateBlock}>
        <p className={styles.legend}>Шаблоны</p>
        {templatesLoading ? (
          <p className={styles.copyMuted}>Загружаем шаблоны…</p>
        ) : null}
        {!templatesLoading && templates.length === 0 ? (
          <p className={styles.copyMuted}>
            Шаблонов нет — заполните услугу вручную
          </p>
        ) : null}
        {!templatesLoading && templates.length > 0 ? (
          <div className={styles.templateList}>
            {templates.map((template) => {
              const key = `${template.categorySlug}-${template.title}`

              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    styles.templateChip,
                    activeTemplateKey === key && styles.templateChipActive,
                  )}
                  onClick={() => applyTemplate(template)}
                >
                  {template.title}
                  <br />
                  {template.durationMin} мин · {template.price} BYN
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <Field
        label="Название услуги"
        htmlFor="onboarding-service-title"
        error={errors.title?.message}
      >
        <TextInput
          id="onboarding-service-title"
          type="text"
          placeholder="Маникюр комбинированный"
          invalid={Boolean(errors.title)}
          {...titleRegister}
        />
      </Field>

      <Field
        label="Длительность"
        htmlFor="onboarding-duration"
        error={errors.durationMin?.message}
      >
        <FormSelect
          id="onboarding-duration"
          control={control}
          name="durationMin"
          options={durationOptions}
          valueAsNumber
        />
      </Field>

      <Field
        label="Цена, BYN"
        htmlFor="onboarding-price"
        error={errors.price?.message}
      >
        <TextInput
          id="onboarding-price"
          type="number"
          min={1}
          step={1}
          invalid={Boolean(errors.price)}
          {...priceRegister}
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
        <Button
          type="submit"
          className={styles.actionsGrow}
          disabled={isSubmitting || !categoryId}
        >
          {isSubmitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
        </Button>
      </div>
    </form>
  )
}
