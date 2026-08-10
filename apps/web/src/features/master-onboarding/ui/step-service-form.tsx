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

import formStyles from '@/features/auth/ui/auth-form.module.css'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { listServiceTemplates } from '@/shared/api/master-services-client'
import { Button } from '@/shared/ui/button'

type StepServiceFormProps = {
  categories: ServiceCategoryView[]
  onSave: (input: CreateServiceInput) => Promise<ServiceView>
  onBack: () => void
}

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180] as const

export function StepServiceForm({
  categories,
  onSave,
  onBack,
}: StepServiceFormProps) {
  const [templates, setTemplates] = useState<ServiceTemplateView[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
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

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <label className={formStyles.field}>
        <span>Категория</span>
        <select className={styles.select} {...register('categoryId')}>
          <option value="" disabled>
            Выберите категорию
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <span className={formStyles.fieldError}>{errors.categoryId.message}</span>
        ) : null}
      </label>

      <div className={styles.templateBlock}>
        <p className={styles.legend}>Шаблоны</p>
        {templatesLoading ? (
          <p className={styles.copyMuted}>Загружаем шаблоны…</p>
        ) : templates.length === 0 ? (
          <p className={styles.copyMuted}>
            Шаблонов нет — заполните услугу вручную
          </p>
        ) : (
          <div className={styles.templateList}>
            {templates.map((template) => (
              <button
                key={`${template.categorySlug}-${template.title}`}
                type="button"
                className={styles.templateChip}
                onClick={() => applyTemplate(template)}
              >
                {template.title}, {template.durationMin} мин, {template.price} BYN
              </button>
            ))}
          </div>
        )}
      </div>

      <label className={formStyles.field}>
        <span>Название услуги</span>
        <input
          type="text"
          placeholder="Маникюр комбинированный"
          {...register('title')}
        />
        {errors.title ? (
          <span className={formStyles.fieldError}>{errors.title.message}</span>
        ) : null}
      </label>

      <label className={formStyles.field}>
        <span>Длительность</span>
        <select
          className={styles.select}
          {...register('durationMin', { valueAsNumber: true })}
        >
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} мин
            </option>
          ))}
        </select>
        {errors.durationMin ? (
          <span className={formStyles.fieldError}>{errors.durationMin.message}</span>
        ) : null}
      </label>

      <label className={formStyles.field}>
        <span>Цена, BYN</span>
        <input
          type="number"
          min={1}
          step={1}
          {...register('price', { valueAsNumber: true })}
        />
        {errors.price ? (
          <span className={formStyles.fieldError}>{errors.price.message}</span>
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
        <Button type="submit" disabled={isSubmitting || !categoryId}>
          {isSubmitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
        </Button>
      </div>
    </form>
  )
}
