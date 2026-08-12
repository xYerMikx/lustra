import type { Metadata } from 'next'

import { CatalogBrowse } from '@/features/catalog-browse'
import {
  listCatalogCategories,
  searchMasters,
} from '@/shared/api/catalog-client'

export const metadata: Metadata = {
  title: 'Каталог',
}

type PageProps = {
  searchParams: Promise<{ district?: string }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { district } = await searchParams
  const districtSlug = district?.trim() || undefined

  const [mastersResponse, categoriesResponse] = await Promise.all([
    searchMasters({ district: districtSlug }),
    listCatalogCategories(),
  ])

  return (
    <CatalogBrowse
      masters={mastersResponse.items}
      categories={categoriesResponse.categories}
      district={districtSlug}
    />
  )
}
