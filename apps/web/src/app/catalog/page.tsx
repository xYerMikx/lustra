import type { Metadata } from 'next'

import { CatalogBrowse } from '@/features/catalog-browse'
import { parseCatalogSearchParams } from '@/features/catalog-browse/model/parse-catalog-search-params'
import {
  catalogIndexDescription,
  catalogIndexTitle,
} from '@/features/catalog-browse/model/catalog-seo'
import {
  listCatalogCategories,
  listCatalogDistricts,
  listCatalogServiceTemplates,
  searchMasters,
} from '@/shared/api/catalog-client'

export const metadata: Metadata = {
  title: catalogIndexTitle(),
  description: catalogIndexDescription(),
}

type PageProps = {
  searchParams: Promise<{
    district?: string | string[]
    service?: string
    priceMin?: string
    priceMax?: string
    ratingMin?: string
    locationType?: string
    availableOn?: string
    sort?: string
  }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const query = parseCatalogSearchParams(raw)

  const [mastersResponse, categoriesResponse, districtsResponse, templatesResponse] =
    await Promise.all([
      searchMasters(query),
      listCatalogCategories(),
      listCatalogDistricts(),
      listCatalogServiceTemplates(),
    ])

  return (
    <CatalogBrowse
      masters={mastersResponse.items}
      categories={categoriesResponse.categories}
      districts={districtsResponse.districts}
      templates={templatesResponse.templates}
      query={query}
    />
  )
}
