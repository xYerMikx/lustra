import type { LedgerCategoryView, LedgerKind } from '@lustra/contracts'

export function findCategoryBySlug(
  categories: LedgerCategoryView[],
  slug: string,
  kind: LedgerKind,
): LedgerCategoryView | undefined {
  return (
    categories.find((category) => category.slug === slug && category.kind === kind) ??
    categories.find((category) => category.kind === kind)
  )
}
