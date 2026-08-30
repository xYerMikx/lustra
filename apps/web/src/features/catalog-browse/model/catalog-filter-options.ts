import type { CatalogSort, LocationType } from '@lumira/contracts'

export const CATALOG_SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'recommended', label: 'Рекомендуемые' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'rating', label: 'Рейтинг' },
]

export const CATALOG_LOCATION_OPTIONS: Array<{
  value: LocationType
  label: string
}> = [
  { value: 'salon', label: 'Салон' },
  { value: 'home_studio', label: 'Студия дома' },
  { value: 'client_home', label: 'С выездом' },
]

export const CATALOG_MAX_DISTRICTS = 3

export const CATALOG_RATING_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Любой' },
  { value: '4', label: 'от 4.0' },
  { value: '4.5', label: 'от 4.5' },
]
