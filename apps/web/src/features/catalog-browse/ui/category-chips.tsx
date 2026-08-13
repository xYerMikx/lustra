import Link from 'next/link'
import cn from 'classnames'
import type { SearchMastersQuery, ServiceCategoryView } from '@lustra/contracts'

import { hrefForCategory } from '@/features/catalog-browse/model/href-for-category'
import styles from '@/features/catalog-browse/ui/category-chips.module.css'

type CategoryChipsProps = {
  categories: ServiceCategoryView[]
  query: SearchMastersQuery
}

export function CategoryChips({ categories, query }: CategoryChipsProps) {
  return (
    <section className={styles.section} aria-labelledby="catalog-categories">
      <h2 id="catalog-categories" className={styles.heading}>
        Категории
      </h2>
      <ul className={styles.list}>
        <li>
          <Link
            href={hrefForCategory(undefined, query)}
            className={cn(styles.chip, !query.category && styles.active)}
            aria-current={query.category ? undefined : 'page'}
          >
            Все
          </Link>
        </li>
        {categories.map((category) => {
          const isActive = category.slug === query.category

          return (
            <li key={category.id}>
              <Link
                href={hrefForCategory(category.slug, query)}
                className={cn(styles.chip, isActive && styles.active)}
                aria-current={isActive ? 'page' : undefined}
              >
                {category.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
