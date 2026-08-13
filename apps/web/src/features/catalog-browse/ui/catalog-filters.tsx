'use client'

import { useState } from 'react'
import type { DistrictView, SearchMastersQuery } from '@lustra/contracts'

import {
  CATALOG_LOCATION_OPTIONS,
  CATALOG_RATING_OPTIONS,
  CATALOG_SORT_OPTIONS,
} from '@/features/catalog-browse/model/catalog-filter-options'
import { catalogHref } from '@/features/catalog-browse/model/href-for-category'
import styles from '@/features/catalog-browse/ui/catalog-filters.module.css'
import { Button, ButtonLink } from '@/shared/ui/button'
import { Field, TextInput } from '@/shared/ui/field'
import { Select } from '@/shared/ui/select'

type CatalogFiltersProps = {
  query: SearchMastersQuery
  districts: DistrictView[]
}

export function CatalogFilters({ query, districts }: CatalogFiltersProps) {
  const action = query.category ? `/catalog/${query.category}` : '/catalog'
  const resetHref = catalogHref({ category: query.category })
  const [district, setDistrict] = useState(query.district ?? '')
  const [locationType, setLocationType] = useState(query.locationType ?? '')
  const [ratingMin, setRatingMin] = useState(
    query.ratingMin != null ? String(query.ratingMin) : '',
  )
  const [sort, setSort] = useState(query.sort ?? 'recommended')

  const districtOptions = [
    { value: '', label: 'Все районы' },
    ...districts.map((item) => ({
      value: item.slug,
      label: item.name,
    })),
  ]
  const locationOptions = [
    { value: '', label: 'Любой' },
    ...CATALOG_LOCATION_OPTIONS,
  ]

  return (
    <form className={styles.form} method="get" action={action}>
      <div className={styles.fields}>
        <Field label="Район" htmlFor="catalog-district">
          <Select
            id="catalog-district"
            name="district"
            value={district}
            options={districtOptions}
            onChange={setDistrict}
          />
        </Field>
        <Field label="Тип локации" htmlFor="catalog-location">
          <Select
            id="catalog-location"
            name="locationType"
            value={locationType}
            options={locationOptions}
            onChange={setLocationType}
          />
        </Field>
        <Field label="Цена от, BYN" htmlFor="catalog-price-min">
          <TextInput
            id="catalog-price-min"
            name="priceMin"
            type="number"
            min={0}
            max={10000}
            inputMode="numeric"
            defaultValue={query.priceMin ?? ''}
          />
        </Field>
        <Field label="Цена до, BYN" htmlFor="catalog-price-max">
          <TextInput
            id="catalog-price-max"
            name="priceMax"
            type="number"
            min={0}
            max={10000}
            inputMode="numeric"
            defaultValue={query.priceMax ?? ''}
          />
        </Field>
        <Field label="Рейтинг" htmlFor="catalog-rating">
          <Select
            id="catalog-rating"
            name="ratingMin"
            value={ratingMin}
            options={CATALOG_RATING_OPTIONS}
            onChange={setRatingMin}
          />
        </Field>
        <Field label="Сортировка" htmlFor="catalog-sort">
          <Select
            id="catalog-sort"
            name="sort"
            value={sort}
            options={CATALOG_SORT_OPTIONS}
            onChange={setSort}
          />
        </Field>
      </div>
      <div className={styles.actions}>
        <Button type="submit">Показать</Button>
        <ButtonLink href={resetHref} variant="ghost">
          Сбросить
        </ButtonLink>
      </div>
    </form>
  )
}
