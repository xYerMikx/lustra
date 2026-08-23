import { randomUUID } from 'node:crypto'

import { MASTER_PROFILE_ID, MASTER_USER_ID, SERVICE_ID } from '../ids'
import {
  apiError,
  toClientBooking,
  toMasterBooking,
  type E2eBooking,
  type MockWorld,
} from './types'
import { requireUser, type HandlerResult } from './auth-handlers'
import { recordBookingIncome } from './ledger-handlers'
import { asRecord, type MockRequest } from './http'

function findClientBooking(world: MockWorld, id: string, userId: string) {
  return world.bookings.find(
    (item) => item.id === id && item.clientUserId === userId,
  )
}

function findMasterBooking(world: MockWorld, id: string, userId: string) {
  return world.bookings.find(
    (item) => item.id === id && item.masterUserId === userId,
  )
}

function isUpcoming(status: E2eBooking['status']): boolean {
  return status === 'hold' || status === 'pending' || status === 'confirmed'
}

function isPast(status: E2eBooking['status']): boolean {
  return (
    status === 'completed' ||
    status === 'cancelled_by_client' ||
    status === 'cancelled_by_master' ||
    status === 'no_show' ||
    status === 'expired'
  )
}

export function handleClientBookings(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (method === 'POST' && pathname === '/bookings/holds') {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const key = request.idempotencyKey
    const idempotencyKey = key ? `${gated.user.id}:${key}` : null

    if (idempotencyKey && world.idempotency.has(idempotencyKey)) {
      const existingId = world.idempotency.get(idempotencyKey)
      const existing = world.bookings.find((item) => item.id === existingId)

      if (existing) {
        return {
          response: {
            status: 201,
            body: {
              bookingId: existing.id,
              holdExpiresAt: existing.holdExpiresAt,
              summary: toClientBooking(existing),
            },
          },
        }
      }
    }

    const body = asRecord(request.body)
    const startsAt = String(body.startsAt ?? '')
    const minskHour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Minsk',
        hour: '2-digit',
        hour12: false,
      }).format(new Date(startsAt)),
    )

    if (startsAt === world.conflictStartsAt || minskHour === 15) {
      return {
        response: apiError(409, 'SLOT_TAKEN', 'Это время только что заняли'),
      }
    }

    const alreadyHeld = world.bookings.some(
      (item) => item.startsAt === startsAt && isUpcoming(item.status),
    )
    const slot = world.availability.find((item) => item.startsAt === startsAt)

    if (alreadyHeld || !slot) {
      return {
        response: apiError(409, 'SLOT_TAKEN', 'Это время только что заняли'),
      }
    }

    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const booking: E2eBooking = {
      id: randomUUID(),
      masterId: String(body.masterId ?? MASTER_PROFILE_ID),
      masterUserId: MASTER_USER_ID,
      masterDisplayName: 'Анна Ногтева',
      clientUserId: gated.user.id,
      serviceId: String(body.serviceId ?? SERVICE_ID),
      serviceTitle: 'Маникюр комбинированный',
      serviceDurationMin: 90,
      priceAmount: '60',
      currency: 'BYN',
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: 'hold',
      holdExpiresAt,
      clientComment: null,
      confirmedAt: null,
      completedAt: null,
      masterNote: null,
      clientName: gated.user.firstName,
      clientPhone: null,
      addressHint: 'Фрунзенский, ориентир ТЦ',
      addressExact: 'ул. Притыцкого 29, каб. 3',
      review: null,
      clientReview: null,
    }

    world.bookings.push(booking)
    world.availability = world.availability.filter((item) => item.startsAt !== startsAt)
    world.calendarSlots = world.calendarSlots.map((item) =>
      item.startsAt === startsAt
        ? {
            ...item,
            status: 'booked' as const,
            clientName: gated.user.firstName,
            bookingId: booking.id,
          }
        : item,
    )

    if (idempotencyKey) {
      world.idempotency.set(idempotencyKey, booking.id)
    }

    return {
      response: {
        status: 201,
        body: {
          bookingId: booking.id,
          holdExpiresAt,
          summary: toClientBooking(booking),
        },
      },
    }
  }

  const confirmMatch = pathname.match(/^\/bookings\/([^/]+)\/confirm$/)

  if (method === 'POST' && confirmMatch) {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const booking = findClientBooking(world, confirmMatch[1] ?? '', gated.user.id)

    if (!booking) {
      return { response: apiError(404, 'NOT_FOUND', 'Бронь не найдена') }
    }

    booking.status = 'pending'
    booking.clientComment =
      String(asRecord(request.body).comment ?? '').trim() || booking.clientComment

    return {
      response: { status: 200, body: { booking: toClientBooking(booking) } },
    }
  }

  const cancelMatch = pathname.match(/^\/bookings\/([^/]+)\/cancel$/)

  if (method === 'POST' && cancelMatch) {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const booking = findClientBooking(world, cancelMatch[1] ?? '', gated.user.id)

    if (!booking) {
      return { response: apiError(404, 'NOT_FOUND', 'Бронь не найдена') }
    }

    booking.status = 'cancelled_by_client'

    return {
      response: { status: 200, body: { booking: toClientBooking(booking) } },
    }
  }

  const oneMatch = pathname.match(/^\/bookings\/([^/]+)$/)

  if (method === 'GET' && pathname === '/bookings') {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const scope = request.searchParams.get('scope') ?? 'upcoming'
    const items = world.bookings
      .filter((item) => item.clientUserId === gated.user.id)
      .filter((item) => (scope === 'past' ? isPast(item.status) : isUpcoming(item.status)))
      .map(toClientBooking)

    return { response: { status: 200, body: { items } } }
  }

  if (method === 'GET' && oneMatch) {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const booking = findClientBooking(world, oneMatch[1] ?? '', gated.user.id)

    if (!booking) {
      return { response: apiError(404, 'NOT_FOUND', 'Бронь не найдена') }
    }

    return {
      response: { status: 200, body: { booking: toClientBooking(booking) } },
    }
  }

  if (method === 'POST' && pathname === '/reviews') {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const body = asRecord(request.body)
    const booking = findClientBooking(
      world,
      String(body.bookingId ?? ''),
      gated.user.id,
    )

    if (!booking || booking.status !== 'completed') {
      return {
        response: apiError(409, 'INVALID_STATE', 'Отзыв можно оставить после визита'),
      }
    }

    const review = {
      id: randomUUID(),
      status: 'published' as const,
      rating: Number(body.rating ?? 5),
      text: String(body.text ?? '').trim() || null,
      createdAt: new Date().toISOString(),
      clientFirstName: gated.user.firstName,
      serviceTitle: booking.serviceTitle,
      masterReply: null,
      repliedAt: null,
      verified: true as const,
      bookingId: booking.id,
    }

    booking.review = {
      id: review.id,
      status: review.status,
      rating: review.rating,
    }
    world.publicReviews.unshift({
      id: review.id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      clientFirstName: review.clientFirstName,
      serviceTitle: booking.serviceTitle,
      masterReply: null,
      repliedAt: null,
      verified: true,
    })

    return { response: { status: 201, body: { review } } }
  }

  if (method === 'GET' && pathname === '/client/reviews') {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    const items = world.bookings
      .filter(
        (item) => item.clientUserId === gated.user.id && item.clientReview,
      )
      .map((item) => ({
        id: item.clientReview!.id,
        rating: item.clientReview!.rating,
        text: item.clientReview!.text,
        status: item.clientReview!.status,
        createdAt: item.clientReview!.createdAt,
        masterDisplayName: item.masterDisplayName,
        serviceTitle: item.serviceTitle,
        verified: true as const,
      }))
    const ratings = items.flatMap((item) =>
      item.rating == null ? [] : [item.rating],
    )

    return {
      response: {
        status: 200,
        body: {
          ratingAvg:
            ratings.length === 0
              ? 0
              : ratings.reduce((sum, value) => sum + value, 0) / ratings.length,
          ratingCount: ratings.length,
          items,
        },
      },
    }
  }

  if (pathname.startsWith('/favorites')) {
    const gated = requireUser(world, request, 'client')

    if ('response' in gated) {
      return gated
    }

    if (method === 'GET' && pathname === '/favorites') {
      const items = world.catalog.filter((item) =>
        world.favorites.has(`${gated.user.id}:${item.id}`),
      )

      return { response: { status: 200, body: { items } } }
    }

    const favMatch = pathname.match(/^\/favorites\/([^/]+)$/)
    const masterId = favMatch ? decodeURIComponent(favMatch[1] ?? '') : ''
    const key = `${gated.user.id}:${masterId}`

    if (method === 'GET' && favMatch) {
      return {
        response: { status: 200, body: { favorited: world.favorites.has(key) } },
      }
    }

    if (method === 'POST' && favMatch) {
      world.favorites.add(key)

      return { response: { status: 200, body: { favorited: true } } }
    }

    if (method === 'DELETE' && favMatch) {
      world.favorites.delete(key)

      return { response: { status: 200, body: { favorited: false } } }
    }
  }

  return null
}

export function handleMasterBookings(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (
    !pathname.startsWith('/master/bookings') &&
    pathname !== '/master/clients' &&
    pathname !== '/master/client-reviews'
  ) {
    return null
  }

  const gated = requireUser(world, request, 'master')

  if ('response' in gated) {
    return gated
  }

  if (method === 'GET' && pathname === '/master/clients') {
    return { response: { status: 200, body: { items: [] } } }
  }

  if (method === 'POST' && pathname === '/master/client-reviews') {
    const body = asRecord(request.body)
    const booking = findMasterBooking(
      world,
      String(body.bookingId ?? ''),
      gated.user.id,
    )

    if (!booking || booking.status !== 'completed') {
      return {
        response: apiError(409, 'INVALID_STATE', 'Отзыв можно оставить после визита'),
      }
    }

    if (!booking.clientUserId) {
      return {
        response: apiError(
          409,
          'INVALID_STATE',
          'Отзыв можно оставить только клиенту с аккаунтом',
        ),
      }
    }

    if (booking.clientReview) {
      return {
        response: apiError(409, 'INVALID_STATE', 'Отзыв по этой записи уже оставлен'),
      }
    }

    const rating = body.rating == null ? null : Number(body.rating)
    const text = String(body.text ?? '').trim() || null

    if (rating == null && !text) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Укажите оценку или комментарий'),
      }
    }

    const review = {
      id: randomUUID(),
      status: 'published' as const,
      rating,
      text,
      createdAt: new Date().toISOString(),
    }

    booking.clientReview = review

    return {
      response: {
        status: 201,
        body: {
          review: {
            ...review,
            masterDisplayName: booking.masterDisplayName,
            serviceTitle: booking.serviceTitle,
            verified: true,
          },
        },
      },
    }
  }

  if (method === 'GET' && pathname === '/master/bookings') {
    const scope = request.searchParams.get('scope') ?? 'upcoming'
    const items = world.bookings
      .filter((item) => item.masterUserId === gated.user.id)
      .filter((item) => {
        if (scope === 'pending') {
          return item.status === 'pending'
        }

        if (scope === 'past') {
          return isPast(item.status)
        }

        return isUpcoming(item.status)
      })
      .map(toMasterBooking)

    return { response: { status: 200, body: { items } } }
  }

  if (method === 'POST' && pathname === '/master/bookings') {
    const body = asRecord(request.body)
    const startsAt = String(body.startsAt ?? '')
    const endsAt = new Date(
      new Date(startsAt).getTime() + 90 * 60 * 1000,
    ).toISOString()
    const booking: E2eBooking = {
      id: randomUUID(),
      masterId: MASTER_PROFILE_ID,
      masterUserId: gated.user.id,
      masterDisplayName: gated.user.firstName,
      clientUserId: null,
      serviceId: String(body.serviceId ?? SERVICE_ID),
      serviceTitle: 'Маникюр комбинированный',
      serviceDurationMin: 90,
      priceAmount: '60',
      currency: 'BYN',
      startsAt,
      endsAt,
      status: 'confirmed',
      holdExpiresAt: null,
      clientComment: null,
      confirmedAt: new Date().toISOString(),
      completedAt: null,
      masterNote: String(body.note ?? '').trim() || null,
      clientName: String(body.clientName ?? 'Гость'),
      clientPhone: String(body.phone ?? ''),
      addressHint: null,
      addressExact: null,
      review: null,
      clientReview: null,
    }

    world.bookings.push(booking)
    world.calendarSlots = world.calendarSlots.map((slot) =>
      slot.startsAt === startsAt
        ? {
            ...slot,
            status: 'booked' as const,
            clientName: String(body.clientName ?? 'Гость'),
            bookingId: booking.id,
          }
        : slot,
    )

    return {
      response: { status: 201, body: { booking: toMasterBooking(booking) } },
    }
  }

  const actionMatch = pathname.match(
    /^\/master\/bookings\/([^/]+)\/(confirm|complete|no-show|cancel|reschedule)$/,
  )

  if (method === 'POST' && actionMatch) {
    const booking = findMasterBooking(world, actionMatch[1] ?? '', gated.user.id)

    if (!booking) {
      return { response: apiError(404, 'NOT_FOUND', 'Бронь не найдена') }
    }

    const action = actionMatch[2]

    if (action === 'confirm') {
      booking.status = 'confirmed'
      booking.confirmedAt = new Date().toISOString()
    }

    if (action === 'complete') {
      booking.status = 'completed'
      booking.completedAt = new Date().toISOString()
      recordBookingIncome(world, booking)
    }

    if (action === 'no-show') {
      booking.status = 'no_show'
    }

    if (action === 'cancel') {
      const reason = String(asRecord(request.body).reason ?? '').trim()

      if (!reason) {
        return {
          response: apiError(400, 'VALIDATION_FAILED', 'Укажите причину отмены'),
        }
      }

      booking.status = 'cancelled_by_master'
    }

    if (action === 'reschedule') {
      const body = asRecord(request.body)
      booking.startsAt = String(body.startsAt ?? booking.startsAt)
      booking.endsAt = new Date(
        new Date(booking.startsAt).getTime() + 90 * 60 * 1000,
      ).toISOString()
    }

    return {
      response: { status: 200, body: { booking: toMasterBooking(booking) } },
    }
  }

  const oneMatch = pathname.match(/^\/master\/bookings\/([^/]+)$/)

  if (method === 'GET' && oneMatch) {
    const booking = findMasterBooking(world, oneMatch[1] ?? '', gated.user.id)

    if (!booking) {
      return { response: apiError(404, 'NOT_FOUND', 'Бронь не найдена') }
    }

    return {
      response: { status: 200, body: { booking: toMasterBooking(booking) } },
    }
  }

  return null
}
