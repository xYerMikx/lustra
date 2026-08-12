import type {
  AvailabilityQuery,
  AvailabilityResponse,
  PublicMasterView,
} from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

async function serverFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 },
  })

  if (response.status === 404) {
    throw new ApiError(404, {
      code: 'NOT_FOUND',
      message: 'Не найдено',
    })
  }

  if (!response.ok) {
    let payload: unknown = null

    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof (payload as { error: unknown }).error === 'object'
    ) {
      const error = (payload as { error: { code: string; message: string } }).error
      throw new ApiError(response.status, error)
    }

    throw new ApiError(response.status, {
      code: 'INTERNAL',
      message: 'Ошибка запроса',
    })
  }

  return (await response.json()) as T
}

export function getPublicMasterBySlug(slug: string) {
  return serverFetchJson<PublicMasterView>(
    `/catalog/masters/${encodeURIComponent(slug)}`,
  )
}

export function getMasterAvailability(
  masterId: string,
  query: AvailabilityQuery,
) {
  const params = new URLSearchParams({
    serviceId: query.serviceId,
    from: query.from,
    to: query.to,
  })

  return serverFetchJson<AvailabilityResponse>(
    `/catalog/masters/${masterId}/availability?${params.toString()}`,
  )
}
