import type { Prisma } from '@lustra/db'
import type { CatalogSort } from '@lustra/contracts'

export function catalogOrderBy(
  sort: CatalogSort | undefined,
): Prisma.MasterProfileOrderByWithRelationInput[] {
  if (sort === 'price_asc') {
    return [{ stats: { priceMin: { sort: 'asc', nulls: 'last' } } }]
  }

  if (sort === 'price_desc') {
    return [{ stats: { priceMin: { sort: 'desc', nulls: 'last' } } }]
  }

  if (sort === 'rating') {
    return [
      { stats: { ratingAvg: 'desc' } },
      { stats: { ratingCount: 'desc' } },
    ]
  }

  return [
    { boostPriority: 'desc' },
    { stats: { ratingAvg: 'desc' } },
    { publishedAt: 'desc' },
  ]
}
