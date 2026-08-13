import type { Metadata } from 'next'

import { CatalogBrowse } from '@/features/catalog-browse'
import { parseCatalogSearchParams } from '@/features/catalog-browse/model/parse-catalog-search-params'
import {
  listCatalogCategories,
  listCatalogDistricts,
  searchMasters,
} from '@/shared/api/catalog-client'

export const metadata: Metadata = {
  title: 'Каталог',
}

type PageProps = {
  searchParams: Promise<{
    district?: string
    priceMin?: string
    priceMax?: string
    ratingMin?: string
    locationType?: string
    sort?: string
  }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const query = parseCatalogSearchParams(raw)

  const [mastersResponse, categoriesResponse, districtsResponse] =
    await Promise.all([
      searchMasters(query),
      listCatalogCategories(),
      listCatalogDistricts(),
    ])

  return (
    <CatalogBrowse
      masters={mastersResponse.items}
      categories={categoriesResponse.categories}
      districts={districtsResponse.districts}
      query={query}
    />
  )
}
