import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { GetClientRecommendationsUseCase } from '@/modules/recommendations/app/get-client-recommendations.usecase'
import type { ClientBookingStatsStore } from '@/modules/recommendations/app/recommendations.ports'

const client: AuthUser = {
  id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

const otherClientId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const manicureId = '11111111-1111-4111-8111-111111111111'
const browsId = '22222222-2222-4222-8222-222222222222'
const categoryId = '55555555-5555-4555-8555-555555555555'
const masterId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

describe('GetClientRecommendationsUseCase', () => {
  it('ranks the current client completed visits and ignores other user ids', async () => {
    const store: ClientBookingStatsStore = {
      listCompletedByClient: vi.fn(async (userId: string) => {
        if (userId !== client.id) {
          return []
        }

        const leakedMaster = {
          id: masterId,
          slug: 'anna',
          displayName: 'Анна',
          trustScore: 9,
          masterNote: 'внутренняя заметка',
        }

        return [
          {
            serviceId: manicureId,
            serviceTitle: 'Маникюр',
            categoryId,
            completedAt: new Date('2026-08-01T10:00:00.000Z'),
            master: leakedMaster,
          },
          {
            serviceId: manicureId,
            serviceTitle: 'Маникюр',
            categoryId,
            completedAt: new Date('2026-08-10T10:00:00.000Z'),
            master: {
              id: masterId,
              slug: 'anna',
              displayName: 'Анна',
            },
          },
          {
            serviceId: browsId,
            serviceTitle: 'Брови',
            categoryId,
            completedAt: new Date('2026-08-20T10:00:00.000Z'),
            master: {
              id: masterId,
              slug: 'anna',
              displayName: 'Анна',
            },
          },
        ]
      }),
    }
    const useCase = new GetClientRecommendationsUseCase(store)

    const result = await useCase.execute(client)

    expect(store.listCompletedByClient).toHaveBeenCalledTimes(1)
    expect(store.listCompletedByClient).toHaveBeenCalledWith(client.id)
    expect(store.listCompletedByClient).not.toHaveBeenCalledWith(otherClientId)
    expect(result.services.map((item) => item.serviceTitle)).toEqual([
      'Маникюр',
      'Брови',
    ])
    expect(result.services[0]?.completedCount).toBe(2)
    expect(JSON.stringify(result)).not.toContain('trustScore')
    expect(JSON.stringify(result)).not.toContain('masterNote')
    expect(result.services[0]).not.toHaveProperty('trustScore')
    expect(result.services[0]).not.toHaveProperty('masterNote')
  })

  it('returns an empty list when the client has no completed bookings', async () => {
    const store: ClientBookingStatsStore = {
      listCompletedByClient: vi.fn().mockResolvedValue([]),
    }
    const useCase = new GetClientRecommendationsUseCase(store)

    const result = await useCase.execute(client)

    expect(result).toEqual({ services: [] })
  })
})
