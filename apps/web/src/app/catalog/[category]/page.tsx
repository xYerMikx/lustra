import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogBrowse } from '@/features/catalog-browse'
import {
  listCatalogCategories,
  searchMasters,
} from '@/shared/api/catalog-client'

type PageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ district?: string }>
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
  const { district } = await searchParams
  const districtSlug = district?.trim() || undefined

  const categoriesResponse = await listCatalogCategories()
  const category = categoriesResponse.categories.find(
    (item) => item.slug === categorySlug,
  )

  if (!category) {
    notFound()
  }

  const mastersResponse = await searchMasters({
    category: category.slug,
    district: districtSlug,
  })

  return (
    <CatalogBrowse
      masters={mastersResponse.items}
      categories={categoriesResponse.categories}
      activeCategorySlug={category.slug}
      activeCategoryName={category.name}
      district={districtSlug}
    />
  )
}
