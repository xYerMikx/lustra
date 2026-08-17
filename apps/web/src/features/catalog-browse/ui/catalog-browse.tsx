import type {
  CatalogMasterCard,
  DistrictView,
  SearchMastersQuery,
  ServiceCategoryView,
  ServiceTemplateView,
} from '@lustra/contracts'

import { MasterCard } from '@/entities/master'
import { emptyCatalogCopy } from '@/features/catalog-browse/model/empty-catalog-copy'
import { catalogHref } from '@/features/catalog-browse/model/href-for-category'
import { hasActiveCatalogFilters } from '@/features/catalog-browse/model/parse-catalog-search-params'
import { CategoryChips } from '@/features/catalog-browse/ui/category-chips'
import { CatalogFilters } from '@/features/catalog-browse/ui/catalog-filters'
import styles from '@/features/catalog-browse/ui/catalog-browse.module.css'
import { ButtonLink } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
import { SiteChrome } from '@/shared/ui/site-chrome'

type CatalogBrowseProps = {
  masters: CatalogMasterCard[]
  categories: ServiceCategoryView[]
  districts: DistrictView[]
  templates: ServiceTemplateView[]
  query: SearchMastersQuery
}

export function CatalogBrowse({
  masters,
  categories,
  districts,
  templates,
  query,
}: CatalogBrowseProps) {
  const activeCategoryName = categories.find(
    (item) => item.slug === query.category,
  )?.name
  const heading = activeCategoryName
    ? `Мастера · ${activeCategoryName}`
    : 'Мастера рядом'
  const filtersActive = hasActiveCatalogFilters(query)

  return (
    <main className={styles.page} data-testid={TEST_ID.pageCatalog}>
      <SiteChrome>
        <section className={styles.intro}>
          <h1 className={styles.heading} data-testid={TEST_ID.catalogHeading}>
            {heading}
          </h1>
          <p className={styles.sub}>
            {query.district?.length
              ? 'Подборка по району и фильтрам.'
              : 'Опубликованные мастера Минска.'}
          </p>
        </section>

        <CategoryChips categories={categories} query={query} />
        <CatalogFilters
          key={catalogHref(query)}
          query={query}
          districts={districts}
          templates={templates}
        />

        {masters.length === 0 ? (
          <div>
            <p
              className={styles.empty}
              role="status"
              data-testid={TEST_ID.catalogEmpty}
            >
              {emptyCatalogCopy(query, filtersActive)}
            </p>
            {filtersActive ? (
              <ButtonLink
                href={catalogHref({ category: query.category })}
                variant="ghost"
              >
                Сбросить фильтры
              </ButtonLink>
            ) : null}
          </div>
        ) : (
          <ul className={styles.list} data-testid={TEST_ID.catalogList}>
            {masters.map((master) => (
              <li key={master.id}>
                <MasterCard master={master} />
              </li>
            ))}
          </ul>
        )}
      </SiteChrome>
    </main>
  )
}
