import type { CatalogMasterCard, ServiceCategoryView } from '@lustra/contracts'

import { MasterCard } from '@/entities/master'
import { CategoryChips } from '@/features/catalog-browse/ui/category-chips'
import styles from '@/features/catalog-browse/ui/catalog-browse.module.css'
import { SiteChrome } from '@/shared/ui/site-chrome'

type CatalogBrowseProps = {
  masters: CatalogMasterCard[]
  categories: ServiceCategoryView[]
  activeCategorySlug?: string
  activeCategoryName?: string
  district?: string
}

export function CatalogBrowse({
  masters,
  categories,
  activeCategorySlug,
  activeCategoryName,
  district,
}: CatalogBrowseProps) {
  const heading = activeCategoryName
    ? `Мастера · ${activeCategoryName}`
    : 'Мастера рядом'

  const emptyCopy = activeCategoryName
    ? `Пока нет опубликованных мастеров в категории «${activeCategoryName}».`
    : 'Мастеров пока что нет — загляните позже.'

  return (
    <main className={styles.page}>
      <SiteChrome>
        <section className={styles.intro}>
          <h1 className={styles.heading}>{heading}</h1>
          <p className={styles.sub}>
            {district
              ? 'Подборка по району и категории.'
              : 'Опубликованные мастера Минска.'}
          </p>
        </section>

        <CategoryChips
          categories={categories}
          activeSlug={activeCategorySlug}
          district={district}
        />

        {masters.length === 0 ? (
          <p className={styles.empty} role="status">
            {emptyCopy}
          </p>
        ) : (
          <ul className={styles.list}>
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
