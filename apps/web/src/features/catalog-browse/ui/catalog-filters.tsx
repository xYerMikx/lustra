'use client'

import { useState } from 'react'
import type {
  DistrictView,
  SearchMastersQuery,
  ServiceTemplateView,
} from '@lustra/contracts'

import { catalogAvailableOnOptions } from '@/features/catalog-browse/model/catalog-available-on-options'
import {
  CATALOG_LOCATION_OPTIONS,
  CATALOG_RATING_OPTIONS,
  CATALOG_SORT_OPTIONS,
} from '@/features/catalog-browse/model/catalog-filter-options'
import { catalogHref } from '@/features/catalog-browse/model/href-for-category'
import { CatalogDistrictChecks } from '@/features/catalog-browse/ui/catalog-district-checks'
import styles from '@/features/catalog-browse/ui/catalog-filters.module.css'
import { Button, ButtonLink } from '@/shared/ui/button'
import { Field, TextInput } from '@/shared/ui/field'
import { TEST_ID } from '@/shared/lib/test-id'
import { Select } from '@/shared/ui/select'

type CatalogFiltersProps = {
  query: SearchMastersQuery
  districts: DistrictView[]
  templates: ServiceTemplateView[]
}

export function CatalogFilters({
  query,
  districts,
  templates,
}: CatalogFiltersProps) {
  const action = query.category ? `/catalog/${query.category}` : '/catalog'
  const resetHref = catalogHref({ category: query.category })
  const [district, setDistrict] = useState(query.district ?? [])
  const [locationType, setLocationType] = useState(query.locationType ?? '')
  const [service, setService] = useState(query.service ?? '')
  const [availableOn, setAvailableOn] = useState(query.availableOn ?? '')
  const [ratingMin, setRatingMin] = useState(
    query.ratingMin != null ? String(query.ratingMin) : '',
  )
  const [sort, setSort] = useState<string>(query.sort ?? 'recommended')

  const serviceOptions = [
    { value: '', label: 'Любая услуга' },
    ...templates
      .filter((item) => !query.category || item.categorySlug === query.category)
      .map((item) => ({
        value: item.title,
        label: item.title,
      })),
  ]
  const locationOptions = [
    { value: '', label: 'Любой' },
    ...CATALOG_LOCATION_OPTIONS,
  ]

  return (
    <form className={styles.form} method="get" action={action}>
      <div className={styles.fields}>
        <CatalogDistrictChecks
          districts={districts}
          selected={district}
          onChange={setDistrict}
        />
        <Field label="Услуга" htmlFor="catalog-service">
          <Select
            id="catalog-service"
            name="service"
            value={service}
            options={serviceOptions}
            onChange={setService}
          />
        </Field>
        <Field label="Свободно" htmlFor="catalog-available-on">
          <Select
            id="catalog-available-on"
            name="availableOn"
            value={availableOn}
            options={catalogAvailableOnOptions(new Date(), query.availableOn)}
            onChange={setAvailableOn}
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
            data-testid={TEST_ID.catalogPriceMax}
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
        <Button type="submit" data-testid={TEST_ID.catalogSubmit}>
          Показать
        </Button>
        <ButtonLink href={resetHref} variant="ghost">
          Сбросить
        </ButtonLink>
      </div>
    </form>
  )
}
