'use client'

import { useMemo, useState } from 'react'
import type { ServiceCategoryView } from '@lustra/contracts'

import { filterServiceOptions } from '@/features/client-book-flow/model/filter-service-options'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'
import { ServiceCategoryFilter } from '@/features/client-book-flow/ui/service-category-filter'
import { ServiceOptionGroup } from '@/features/client-book-flow/ui/service-option-group'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { Field, TextInput } from '@/shared/ui/field'
import { TEST_ID } from '@/shared/lib/test-id'

type ServiceStepProps = {
  options: ClientBookServiceOption[]
  categories: ServiceCategoryView[]
  onSelect: (option: ClientBookServiceOption) => void
}

export function ServiceStep({
  options,
  categories,
  onSelect,
}: ServiceStepProps) {
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState<string | null>(null)
  const filtered = useMemo(
    () => filterServiceOptions(options, { query, categorySlug }),
    [categorySlug, options, query],
  )
  const recommended = filtered.filter((item) => item.source === 'recommended')
  const past = filtered.filter((item) => item.source === 'past')
  const catalog = filtered.filter((item) => item.source === 'catalog')

  return (
    <div
      className={styles.section}
      data-testid={TEST_ID.clientBookServiceStep}
    >
      <Field label="Поиск услуги" htmlFor="client-book-service-search">
        <TextInput
          id="client-book-service-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          data-testid={TEST_ID.clientBookServiceSearch}
        />
      </Field>

      {categories.length > 0 ? (
        <ServiceCategoryFilter
          categories={categories}
          selectedSlug={categorySlug}
          onSelect={setCategorySlug}
        />
      ) : null}

      {recommended.length > 0 ? (
        <ServiceOptionGroup
          title="Рекомендуем вам"
          options={recommended}
          onSelect={onSelect}
        />
      ) : null}

      {past.length > 0 ? (
        <ServiceOptionGroup
          title="Вы уже были"
          options={past}
          onSelect={onSelect}
        />
      ) : null}

      {catalog.length > 0 ? (
        <ServiceOptionGroup
          title="Каталог"
          options={catalog}
          onSelect={onSelect}
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          Услуг по этому запросу нет. Сбросьте поиск или категорию.
        </p>
      ) : null}
    </div>
  )
}
