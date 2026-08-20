'use client'

import type { DistrictView } from '@lustra/contracts'

import { CATALOG_MAX_DISTRICTS } from '@/features/catalog-browse/model/catalog-filter-options'
import { catalogDistrictTestId, TEST_ID } from '@/shared/lib/test-id'
import { Field } from '@/shared/ui/field'
import { MultiSelect } from '@/shared/ui/select'

type CatalogDistrictSelectProps = {
  districts: DistrictView[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function CatalogDistrictSelect({
  districts,
  selected,
  onChange,
}: CatalogDistrictSelectProps) {
  const options = districts.map((district) => ({
    value: district.slug,
    label: district.name,
    testId: catalogDistrictTestId(district.slug),
  }))

  return (
    <Field label={`Районы (до ${CATALOG_MAX_DISTRICTS})`} htmlFor="catalog-districts">
      <MultiSelect
        id="catalog-districts"
        name="district"
        values={selected}
        options={options}
        max={CATALOG_MAX_DISTRICTS}
        placeholder="Выберите районы"
        testId={TEST_ID.catalogDistricts}
        aria-label={`Районы, до ${CATALOG_MAX_DISTRICTS}`}
        onChange={onChange}
      />
    </Field>
  )
}
