'use client'

import cn from 'classnames'
import type { ServiceCategoryView } from '@lumira/contracts'

import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { catalogCategoryTestId } from '@/shared/lib/test-id'

type ServiceCategoryFilterProps = {
  categories: ServiceCategoryView[]
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export function ServiceCategoryFilter({
  categories,
  selectedSlug,
  onSelect,
}: ServiceCategoryFilterProps) {
  return (
    <ul className={styles.chipList} aria-label="Категории">
      <li>
        <button
          type="button"
          className={cn(styles.chip, !selectedSlug && styles.chipActive)}
          onClick={() => onSelect(null)}
        >
          Все
        </button>
      </li>
      {categories.map((category) => {
        const isActive = category.slug === selectedSlug

        return (
          <li key={category.id}>
            <button
              type="button"
              className={cn(styles.chip, isActive && styles.chipActive)}
              data-testid={catalogCategoryTestId(category.slug)}
              onClick={() => onSelect(category.slug)}
            >
              {category.name}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
