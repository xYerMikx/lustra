import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogBrowse } from '@/features/catalog-browse'
import { parseCatalogSearchParams } from '@/features/catalog-browse/model/parse-catalog-search-params'
import {
  listCatalogCategories,
  listCatalogDistricts,
  listCatalogServiceTemplates,
  searchMasters,
} from '@/shared/api/catalog-client'

type PageProps = {
  params: Promise<{ category: string }>
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const categoriesResponse = await listCatalogCategories()
  const category = categoriesResponse.categories.find(
    (item) => item.slug === categorySlug,
  )

  return {
    title: category ? `Каталог · ${category.name}` : 'Каталог',
  }
}

export default async function CatalogCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category: categorySlug } = await params
  const raw = await searchParams
  const categoriesResponse = await listCatalogCategories()
  const category = categoriesResponse.categories.find(
    (item) => item.slug === categorySlug,
  )

  if (!category) {
    notFound()
  }

  const query = parseCatalogSearchParams(raw, category.slug)
  const [mastersResponse, districtsResponse, templatesResponse] = await Promise.all([
    searchMasters(query),
    listCatalogDistricts(),
    listCatalogServiceTemplates(category.slug),
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
