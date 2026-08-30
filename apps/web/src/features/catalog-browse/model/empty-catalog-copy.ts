import type { SearchMastersQuery } from '@lumira/contracts'

export function emptyCatalogCopy(
  query: SearchMastersQuery,
  filtersActive: boolean,
): string {
  if (filtersActive) {
    return 'Никого не нашли по этим фильтрам. Уберите район, услугу или день.'
  }

  if (query.category) {
    return 'Пока нет опубликованных мастеров в этой категории.'
  }

  return 'Мастеров пока что нет — загляните позже.'
}
