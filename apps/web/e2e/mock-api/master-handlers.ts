import { randomUUID } from 'node:crypto'

import { DRAFT_MASTER_PROFILE_ID, MASTER_PROFILE_ID, MASTER_USER_ID } from '../ids'
import { addDaysYmd, todayYmd } from '../time'
import { apiError, type MockWorld } from './types'
import { requireUser, type HandlerResult } from './auth-handlers'
import { asRecord, type MockRequest } from './http'

function profileFor(world: MockWorld, userId: string) {
  if (userId === MASTER_USER_ID) {
    return world.profiles.find((item) => item.id === MASTER_PROFILE_ID) ?? null
  }

  return (
    world.profiles.find((item) => item.id === DRAFT_MASTER_PROFILE_ID) ??
    world.profiles.find((item) => item.status === 'draft') ??
    null
  )
}

export function handleMasterCabinet(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (method === 'GET' && pathname === '/master/profile') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const profile = profileFor(world, gated.user.id)

    if (!profile) {
      return { response: apiError(404, 'NOT_FOUND', 'Профиль не найден') }
    }

    return { response: { status: 200, body: profile } }
  }

  if (method === 'PATCH' && pathname === '/master/profile') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const profile = profileFor(world, gated.user.id)

    if (!profile) {
      return { response: apiError(404, 'NOT_FOUND', 'Профиль не найден') }
    }

    const body = asRecord(request.body)

    if (typeof body.displayName === 'string') {
      profile.displayName = body.displayName
    }

    if (typeof body.headline === 'string' || body.headline === null) {
      profile.headline = body.headline as string | null
    }

    if (typeof body.districtId === 'string') {
      const district = world.districts.find((item) => item.id === body.districtId)

      profile.primaryLocation = {
        id: profile.primaryLocation?.id ?? randomUUID(),
        districtId: String(body.districtId),
        districtName: district?.name ?? 'Минск',
        districtSlug: district?.slug ?? 'minsk',
        type:
          body.locationType === 'home_studio' || body.locationType === 'client_home'
            ? body.locationType
            : 'salon',
        addressHint: profile.primaryLocation?.addressHint ?? null,
        isPrimary: true,
      }

      if (gated.user.onboardingStep === 'profile') {
        gated.user.onboardingStep = 'services'
      }
    }

    const nextContact = {
      publicPhone:
        typeof body.publicPhone === 'string' || body.publicPhone === null
          ? (body.publicPhone as string | null)
          : (profile.contact?.publicPhone ?? null),
      instagram:
        typeof body.instagram === 'string' || body.instagram === null
          ? (body.instagram as string | null)
          : (profile.contact?.instagram ?? null),
      telegramUsername:
        typeof body.telegramUsername === 'string' || body.telegramUsername === null
          ? (body.telegramUsername as string | null)
          : (profile.contact?.telegramUsername ?? null),
      website:
        typeof body.website === 'string' || body.website === null
          ? (body.website as string | null)
          : (profile.contact?.website ?? null),
    }

    if (
      body.publicPhone !== undefined ||
      body.instagram !== undefined ||
      body.telegramUsername !== undefined ||
      body.website !== undefined
    ) {
      profile.contact = nextContact
    }

    return { response: { status: 200, body: profile } }
  }

  if (method === 'GET' && pathname === '/master/services') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    return { response: { status: 200, body: { services: world.services } } }
  }

  if (method === 'POST' && pathname === '/master/services') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const category = world.categories.find((item) => item.id === body.categoryId)
    const service = {
      id: randomUUID(),
      categoryId: String(body.categoryId ?? ''),
      categoryName: category?.name ?? 'Ногти',
      categorySlug: category?.slug ?? 'nogti',
      title: String(body.title ?? 'Услуга'),
      description: null,
      durationMin: Number(body.durationMin ?? 90),
      bufferAfterMin: 0,
      price: Number(body.price ?? 60),
      priceMax: null,
      priceType: 'fixed' as const,
      currency: 'BYN',
      isActive: true,
      sort: world.services.length,
    }

    world.services.push(service)

    if (gated.user.onboardingStep === 'services') {
      gated.user.onboardingStep = 'schedule'
    }

    return { response: { status: 201, body: service } }
  }

  if (method === 'GET' && pathname === '/master/schedule') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    return {
      response: {
        status: 200,
        body: {
          rules: [
            { id: randomUUID(), weekday: 1, startMin: 600, endMin: 1200 },
          ],
          policy: {
            granularityMin: 30,
            leadTimeHours: 3,
            horizonDays: 30,
          },
        },
      },
    }
  }

  if (method === 'PUT' && pathname === '/master/schedule/rules') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const rules = Array.isArray(body.rules) ? body.rules : []

    if (gated.user.onboardingStep === 'schedule') {
      gated.user.onboardingStep = 'done'
    }

    return {
      response: {
        status: 200,
        body: {
          rules: rules.map((rule) => {
            const row = asRecord(rule)

            return {
              id: randomUUID(),
              weekday: Number(row.weekday ?? 1),
              startMin: Number(row.startMin ?? 600),
              endMin: Number(row.endMin ?? 1200),
            }
          }),
          policy: {
            granularityMin: 30,
            leadTimeHours: 3,
            horizonDays: 30,
          },
        },
      },
    }
  }

  if (method === 'GET' && pathname === '/master/calendar') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    return {
      response: {
        status: 200,
        body: {
          timezone: 'Europe/Minsk',
          granularityMin: 30,
          from: request.searchParams.get('from') ?? todayYmd(),
          to: request.searchParams.get('to') ?? todayYmd(),
          slots: world.calendarSlots,
          blocks: world.blocks,
          exceptions: world.exceptions,
        },
      },
    }
  }

  if (method === 'POST' && pathname === '/master/schedule/blocks') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const block = {
      id: randomUUID(),
      startsAt: String(body.startsAt ?? ''),
      endsAt: String(body.endsAt ?? ''),
      reason: (body.reason as typeof world.blocks[number]['reason']) ?? 'other',
      note: typeof body.note === 'string' ? body.note : null,
    }

    world.blocks.push(block)

    return { response: { status: 201, body: block } }
  }

  const deleteBlock = pathname.match(/^\/master\/schedule\/blocks\/([^/]+)$/)

  if (method === 'DELETE' && deleteBlock) {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    world.blocks = world.blocks.filter((item) => item.id !== deleteBlock[1])

    return { response: { status: 204 } }
  }

  if (method === 'POST' && pathname === '/master/schedule/slots/extra') {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const startsAt = String(body.startsAt ?? '')
    const extraPayAmount = Number(body.extraPayAmount).toFixed(2)
    const slot = {
      id: randomUUID(),
      startsAt,
      endsAt: new Date(new Date(startsAt).getTime() + 30 * 60_000).toISOString(),
      status: 'open' as const,
      clientName: null,
      bookingId: null,
      isExtra: true,
      extraPayAmount,
    }

    world.calendarSlots.push(slot)
    world.availability.push({
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      slotIds: [slot.id],
      extraPayAmount,
    })

    return { response: { status: 201, body: slot } }
  }

  const closeSlot = pathname.match(/^\/master\/schedule\/slots\/([^/]+)\/close$/)

  if (method === 'POST' && closeSlot) {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    world.calendarSlots = world.calendarSlots.map((item) =>
      item.id === closeSlot[1] ? { ...item, status: 'closed' as const } : item,
    )

    return { response: { status: 204 } }
  }

  const reopenSlot = pathname.match(/^\/master\/schedule\/slots\/([^/]+)\/reopen$/)

  if (method === 'POST' && reopenSlot) {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    world.calendarSlots = world.calendarSlots.map((item) =>
      item.id === reopenSlot[1] ? { ...item, status: 'open' as const } : item,
    )

    return { response: { status: 204 } }
  }

  const exceptionMatch = pathname.match(/^\/master\/schedule\/exceptions\/([^/]+)$/)

  if (method === 'PUT' && exceptionMatch) {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const startDate = exceptionMatch[1] ?? todayYmd()
    const untilDate =
      typeof body.untilDate === 'string' && body.untilDate >= startDate
        ? body.untilDate
        : startDate
    const type = body.type === 'custom_hours' ? ('custom_hours' as const) : ('day_off' as const)
    const startMin = typeof body.startMin === 'number' ? body.startMin : null
    const endMin = typeof body.endMin === 'number' ? body.endMin : null
    const granularityMin =
      body.granularityMin === 15 ||
      body.granularityMin === 30 ||
      body.granularityMin === 60
        ? body.granularityMin
        : null
    const intervals = Array.isArray(body.intervals)
      ? (body.intervals as Array<{ startMin: number; endMin: number }>)
      : null
    const note = String(body.note ?? '').trim() || null
    const dates: string[] = []
    let cursor = startDate

    while (cursor <= untilDate) {
      dates.push(cursor)
      cursor = addDaysYmd(cursor, 1)
    }

    const items = dates.map((date) => ({
      id: randomUUID(),
      date,
      type,
      startMin,
      endMin,
      granularityMin,
      intervals,
      note,
    }))

    world.exceptions = world.exceptions.filter((item) => !dates.includes(item.date))
    world.exceptions.push(...items)

    return { response: { status: 200, body: items[0] } }
  }

  if (method === 'DELETE' && exceptionMatch) {
    const gated = requireUser(world, request, 'master')

    if ('response' in gated) {
      return gated
    }

    world.exceptions = world.exceptions.filter(
      (item) => item.date !== exceptionMatch[1],
    )

    return { response: { status: 204 } }
  }

  return null
}

export function handleAdmin(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  if (!request.pathname.startsWith('/admin/')) {
    return null
  }

  const gated = requireUser(world, request, 'admin')

  if ('response' in gated) {
    return gated
  }

  if (request.method === 'GET' && request.pathname === '/admin/masters') {
    const status = request.searchParams.get('status') ?? 'pending_review'
    const items = world.adminMasters.filter((item) => item.status === status)

    return { response: { status: 200, body: { items } } }
  }

  const moderate = request.pathname.match(/^\/admin\/masters\/([^/]+)\/moderate$/)

  if (request.method === 'POST' && moderate) {
    const master = world.adminMasters.find((item) => item.id === moderate[1])

    if (!master) {
      return { response: apiError(404, 'NOT_FOUND', 'Мастер не найден') }
    }

    const action = asRecord(request.body).action

    if (action === 'approve') {
      master.status = 'published'
      world.catalog.push({
        id: master.id,
        slug: master.slug,
        displayName: master.displayName,
        headline: null,
        districtName: master.districtName,
        districtSlug: 'frunzenskiy',
        ratingAvg: 0,
        ratingCount: 0,
        priceFrom: null,
        specialty: null,
      })
    }

    if (action === 'reject') {
      master.status = 'draft'
    }

    if (action === 'hide') {
      master.status = 'hidden'
    }

    if (action === 'ban') {
      master.status = 'banned'
    }

    world.adminMasters = world.adminMasters.filter((item) => item.id !== master.id)

    return { response: { status: 200, body: { master } } }
  }

  if (request.pathname === '/admin/portfolio' || request.pathname === '/admin/reviews') {
    return { response: { status: 200, body: { items: [] } } }
  }

  return null
}
