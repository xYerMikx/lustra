import { randomUUID } from 'node:crypto'
import { PORTFOLIO_MAX_BYTES, PORTFOLIO_MAX_ITEMS, type PortfolioItemView } from '@lustra/contracts'

import { DRAFT_MASTER_PROFILE_ID, MASTER_PROFILE_ID, MASTER_USER_ID } from '../ids'
import { requireUser, type HandlerResult } from './auth-handlers'
import { asRecord, isBinaryBody, type MockRequest } from './http'
import { apiError, type E2ePortfolioItem, type MockWorld } from './types'

function mediaUrl(id: string): string {
  const port = process.env.E2E_MOCK_API_PORT ?? '3337'

  return `http://127.0.0.1:${port}/__e2e/media/${id}`
}

function profileIdFor(userId: string): string {
  if (userId === MASTER_USER_ID) {
    return MASTER_PROFILE_ID
  }

  return DRAFT_MASTER_PROFILE_ID
}

function itemsFor(world: MockWorld, masterId: string): E2ePortfolioItem[] {
  return world.portfolioItems.filter((item) => item.masterId === masterId)
}

function toView(item: E2ePortfolioItem): PortfolioItemView {
  return {
    id: item.id,
    url: item.url,
    width: item.width,
    height: item.height,
    caption: item.caption,
    serviceId: item.serviceId,
    sort: item.sort,
    isCover: item.isCover,
    moderation: item.moderation,
  }
}

function syncPublicPortfolio(world: MockWorld, masterId: string) {
  const master = world.publicMasters.find((item) => item.id === masterId)

  if (!master) {
    return
  }

  master.portfolio = itemsFor(world, masterId).map(toView)
}

export function handleMasterPortfolio(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (!pathname.startsWith('/master/portfolio')) {
    return null
  }

  const gated = requireUser(world, request, 'master')

  if ('response' in gated) {
    return gated
  }

  const masterId = profileIdFor(gated.user.id)

  if (method === 'GET' && pathname === '/master/portfolio') {
    return {
      response: {
        status: 200,
        body: { items: itemsFor(world, masterId).map(toView) },
      },
    }
  }

  if (method === 'POST' && pathname === '/master/portfolio') {
    if (!isBinaryBody(request.body)) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Нужно загрузить фото'),
      }
    }

    if (request.body.bytes.length > PORTFOLIO_MAX_BYTES) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Файл слишком большой'),
      }
    }

    const current = itemsFor(world, masterId)

    if (current.length >= PORTFOLIO_MAX_ITEMS) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Достигнут лимит фото'),
      }
    }

    const caption = request.searchParams.get('caption')?.trim() || null
    const serviceId = request.searchParams.get('serviceId')
    const id = randomUUID()
    const item: E2ePortfolioItem = {
      id,
      masterId,
      url: mediaUrl(id),
      width: 1200,
      height: 1500,
      caption,
      serviceId: serviceId && serviceId.length > 0 ? serviceId : null,
      sort: current.length,
      isCover: current.length === 0,
      moderation: 'approved',
    }

    world.portfolioItems.push(item)
    syncPublicPortfolio(world, masterId)

    return { response: { status: 201, body: toView(item) } }
  }

  const oneMatch = pathname.match(/^\/master\/portfolio\/([^/]+)$/)

  if (!oneMatch) {
    return null
  }

  const item = world.portfolioItems.find(
    (row) => row.id === oneMatch[1] && row.masterId === masterId,
  )

  if (!item) {
    return { response: apiError(404, 'NOT_FOUND', 'Фото не найдено') }
  }

  if (method === 'PATCH') {
    const body = asRecord(request.body)

    if (body.isCover === true) {
      for (const row of itemsFor(world, masterId)) {
        row.isCover = row.id === item.id
      }
    }

    if (typeof body.caption === 'string' || body.caption === null) {
      item.caption = body.caption
    }

    syncPublicPortfolio(world, masterId)

    return { response: { status: 200, body: toView(item) } }
  }

  if (method === 'DELETE') {
    world.portfolioItems = world.portfolioItems.filter((row) => row.id !== item.id)

    if (item.isCover) {
      const nextCover = itemsFor(world, masterId)[0]

      if (nextCover) {
        nextCover.isCover = true
      }
    }

    syncPublicPortfolio(world, masterId)

    return { response: { status: 204 } }
  }

  return null
}
