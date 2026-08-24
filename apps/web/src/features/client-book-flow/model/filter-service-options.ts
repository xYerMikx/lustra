import { normalizeServiceTitle } from '@/features/client-book-flow/model/normalize-service-title'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'

export function filterServiceOptions(
  options: ClientBookServiceOption[],
  input: { query: string; categorySlug: string | null },
): ClientBookServiceOption[] {
  const query = normalizeServiceTitle(input.query)

  return options.filter((option) => {
    if (
      input.categorySlug &&
      option.source === 'catalog' &&
      option.categorySlug !== input.categorySlug
    ) {
      return false
    }

    if (query && !normalizeServiceTitle(option.title).includes(query)) {
      return false
    }

    return true
  })
}
