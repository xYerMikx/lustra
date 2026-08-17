'use client'

import type { DistrictView } from '@lustra/contracts'

import { CATALOG_MAX_DISTRICTS } from '@/features/catalog-browse/model/catalog-filter-options'
import styles from '@/features/catalog-browse/ui/catalog-filters.module.css'
import { catalogDistrictTestId } from '@/shared/lib/test-id'

type CatalogDistrictChecksProps = {
  districts: DistrictView[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function CatalogDistrictChecks({
  districts,
  selected,
  onChange,
}: CatalogDistrictChecksProps) {
  const toggleDistrict = (slug: string, checked: boolean) => {
    if (checked) {
      if (selected.includes(slug) || selected.length >= CATALOG_MAX_DISTRICTS) {
        return
      }

      onChange([...selected, slug])

      return
    }

    onChange(selected.filter((item) => item !== slug))
  }

  return (
    <fieldset className={styles.checks}>
      <legend className={styles.legend}>Районы (до {CATALOG_MAX_DISTRICTS})</legend>
      {districts.map((district) => {
        const checked = selected.includes(district.slug)
        const disabled =
          !checked && selected.length >= CATALOG_MAX_DISTRICTS

        return (
          <label key={district.id} className={styles.check}>
            <input
              type="checkbox"
              name="district"
              value={district.slug}
              checked={checked}
              disabled={disabled}
              data-testid={catalogDistrictTestId(district.slug)}
              onChange={(event) => {
                toggleDistrict(district.slug, event.target.checked)
              }}
            />
            <span>{district.name}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
