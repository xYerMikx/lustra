import { addDaysYmd, todayYmd } from '../time'
import { apiError, type MockWorld } from './types'
import type { HandlerResult } from './auth-handlers'
import type { MockRequest } from './http'

export function handleCatalog(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (method === 'GET' && pathname === '/catalog/districts') {
    return { response: { status: 200, body: { districts: world.districts } } }
  }

  if (method === 'GET' && pathname === '/catalog/categories') {
    return { response: { status: 200, body: { categories: world.categories } } }
  }

  if (method === 'GET' && pathname === '/catalog/service-templates') {
    const slug = request.searchParams.get('categorySlug')
    const templates = slug
      ? world.templates.filter((item) => item.categorySlug === slug)
      : world.templates

    return { response: { status: 200, body: { templates } } }
  }

  if (method === 'GET' && pathname === '/catalog/masters') {
    const category = request.searchParams.get('category')
    const district = request.searchParams.getAll('district')
    const priceMax = request.searchParams.get('priceMax')
    const priceMin = request.searchParams.get('priceMin')
    const ratingMin = request.searchParams.get('ratingMin')
    const locationType = request.searchParams.get('locationType')
    const service = request.searchParams.get('service')

    let items = [...world.catalog]

    if (category) {
      items = items.filter((master) => {
        const publicMaster = world.publicMasters.find((item) => item.id === master.id)

        return publicMaster?.services.some((item) => item.categorySlug === category)
      })
    }

    if (district.length > 0) {
      items = items.filter(
        (master) => master.districtSlug && district.includes(master.districtSlug),
      )
    }

    if (priceMax) {
      const max = Number(priceMax)
      items = items.filter(
        (master) => master.priceFrom != null && master.priceFrom <= max,
      )
    }

    if (priceMin) {
      const min = Number(priceMin)
      items = items.filter(
        (master) => master.priceFrom != null && master.priceFrom >= min,
      )
    }

    if (ratingMin) {
      const min = Number(ratingMin)
      items = items.filter((master) => master.ratingAvg >= min)
    }

    if (locationType) {
      items = items.filter((master) => {
        const publicMaster = world.publicMasters.find((item) => item.id === master.id)

        return publicMaster?.primaryLocation?.type === locationType
      })
    }

    if (service) {
      items = items.filter((master) => master.specialty === service)
    }

    return { response: { status: 200, body: { items } } }
  }

  const publicMasterMatch = pathname.match(/^\/catalog\/masters\/([^/]+)$/)

  if (method === 'GET' && publicMasterMatch) {
    const slug = decodeURIComponent(publicMasterMatch[1] ?? '')
    const master = world.publicMasters.find((item) => item.slug === slug)

    if (!master) {
      return { response: apiError(404, 'NOT_FOUND', 'Не найдено') }
    }

    return { response: { status: 200, body: master } }
  }

  const reviewsMatch = pathname.match(/^\/catalog\/masters\/([^/]+)\/reviews$/)

  if (method === 'GET' && reviewsMatch) {
    const slug = decodeURIComponent(reviewsMatch[1] ?? '')
    const master = world.publicMasters.find((item) => item.slug === slug)

    if (!master) {
      return { response: { status: 200, body: { items: [] } } }
    }

    return { response: { status: 200, body: { items: world.publicReviews } } }
  }

  const availabilityMatch = pathname.match(
    /^\/catalog\/masters\/([^/]+)\/availability$/,
  )

  if (method === 'GET' && availabilityMatch) {
    const today = todayYmd()
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = addDaysYmd(today, index)
      const slots = index === 0 ? [...world.availability] : []

      return {
        date,
        hasOpen: slots.length > 0,
        slots,
      }
    })

    return {
      response: {
        status: 200,
        body: {
          serviceId: request.searchParams.get('serviceId'),
          durationMin: 90,
          granularityMin: 30,
          timezone: 'Europe/Minsk',
          days,
        },
      },
    }
  }

  return null
}
