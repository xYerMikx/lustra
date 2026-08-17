import type { Prisma } from '@lustra/db'

import type { MasterClientRecord } from '@/modules/bookings/app/booking.ports'

type DbClient = Prisma.TransactionClient

export function listMasterClientsInStore(
  db: DbClient,
  input: {
    masterId: string
    query: string
    limit?: number
  },
): Promise<MasterClientRecord[]> {
  const needle = input.query.trim()
  const take = input.limit ?? 20

  return db.masterClient.findMany({
    where: {
      masterId: input.masterId,
      ...(needle
        ? {
            OR: [
              { name: { contains: needle, mode: 'insensitive' } },
              { phone: { contains: needle } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take,
    select: {
      id: true,
      name: true,
      phone: true,
      source: true,
    },
  })
}
