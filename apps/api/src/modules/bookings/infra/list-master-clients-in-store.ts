import type { Prisma } from '@lustra/db'

import type { MasterClientRecord } from '@/modules/bookings/app/booking.ports'
import { socialHandleFromNote } from '@/modules/bookings/domain/social-handle-note'

type DbClient = Prisma.TransactionClient

export async function listMasterClientsInStore(
  db: DbClient,
  input: {
    masterId: string
    query: string
    sort?: 'recent' | 'frequent'
    limit?: number
  },
): Promise<MasterClientRecord[]> {
  const needle = input.query.trim()
  const take = input.limit ?? 20

  const rows = await db.masterClient.findMany({
    where: {
      masterId: input.masterId,
      ...(needle
        ? {
            OR: [
              { name: { contains: needle, mode: 'insensitive' } },
              { phone: { contains: needle } },
              { note: { contains: needle, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy:
      input.sort === 'frequent'
        ? [{ visitsCount: 'desc' }, { lastVisitAt: 'desc' }, { name: 'asc' }]
        : { updatedAt: 'desc' },
    take,
    select: {
      id: true,
      name: true,
      phone: true,
      source: true,
      note: true,
      visitsCount: true,
      lastVisitAt: true,
    },
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    source: row.source,
    socialHandle: socialHandleFromNote(row.note),
    visitsCount: row.visitsCount,
    lastVisitAt: row.lastVisitAt ? row.lastVisitAt.toISOString() : null,
  }))
}
