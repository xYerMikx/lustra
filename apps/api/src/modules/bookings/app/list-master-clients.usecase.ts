import { Inject, Injectable } from '@nestjs/common'
import type {
  ListMasterClientsQuery,
  MasterClientListResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class ListMasterClientsUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: ListMasterClientsQuery,
  ): Promise<MasterClientListResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const items = await this.bookings.listMasterClients({
      masterId,
      query: query.query,
      sort: query.sort,
      limit: 20,
    })

    return { items }
  }
}
