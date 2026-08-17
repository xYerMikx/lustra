import { apiError, type MockWorld } from './types'
import { handleAdmin, handleMasterCabinet } from './master-handlers'
import { handleAuth, handleE2eAdmin } from './auth-handlers'
import { handleCatalog } from './catalog-handlers'
import { handleClientBookings, handleMasterBookings } from './booking-handlers'
import { handleMasterPortfolio } from './portfolio-handlers'
import { csrfOk, needsCsrf, type MockRequest, type MockResponse } from './http'

export function dispatch(
  world: MockWorld,
  request: MockRequest,
): { response: MockResponse; cookies?: string[] } {
  if (needsCsrf(request.method, request.pathname) && request.pathname.startsWith('/auth/')) {
    if (request.pathname === '/auth/logout' || request.pathname === '/auth/refresh') {
      if (!csrfOk(request)) {
        return { response: apiError(403, 'FORBIDDEN', 'Недействительный CSRF-токен') }
      }
    }
  }

  const handled =
    handleE2eAdmin(world, request) ??
    handleAuth(world, request) ??
    handleCatalog(world, request) ??
    handleClientBookings(world, request) ??
    handleMasterBookings(world, request) ??
    handleMasterPortfolio(world, request) ??
    handleMasterCabinet(world, request) ??
    handleAdmin(world, request)

  if (handled) {
    return handled
  }

  return { response: apiError(404, 'NOT_FOUND', 'Не найдено') }
}
