import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { ListMasterClientsUseCase } from '@/modules/bookings/app/list-master-clients.usecase'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

describe('ListMasterClientsUseCase', () => {
  it('lists only the current master clients (IDOR: foreign masterId is unused)', async () => {
    const listMasterClients = vi.fn().mockResolvedValue([])
    const bookings = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m-own'),
      listMasterClients,
    } as unknown as BookingStore
    const useCase = new ListMasterClientsUseCase(bookings)

    const result = await useCase.execute(currentUser, {
      query: '@anna.nails',
      sort: 'frequent',
    })

    expect(listMasterClients).toHaveBeenCalledWith({
      masterId: 'm-own',
      query: '@anna.nails',
      sort: 'frequent',
      limit: 20,
    })
    expect(listMasterClients).not.toHaveBeenCalledWith(
      expect.objectContaining({ masterId: 'm-other' }),
    )
    expect(result.items).toEqual([])
  })
})
