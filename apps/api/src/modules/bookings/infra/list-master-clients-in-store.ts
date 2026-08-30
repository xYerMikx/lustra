import type { Prisma } from '@lumira/db'

import type { MasterClientRecord } from '@/modules/bookings/app/booking.ports'
import { resolveStoredSocialHandle } from '@/modules/bookings/domain/guest-lookup-plan'
import { nickFromQuery } from '@/modules/bookings/domain/master-client-search'
import { rankByCompletedVisits } from '@/modules/bookings/domain/rank-master-clients-by-completed'
import { socialHandleFromNote } from '@/modules/bookings/domain/social-handle-note'

type DbClient = Prisma.TransactionClient

const FREQUENT_SCAN_CAP = 200

export async function listMasterClientsInStore(
  db: DbClient,
  input: {
    masterId: string
    query: string
    sort?: 'recent' | 'frequent'
    limit?: number
  },
): Promise<MasterClientRecord[]> {
  const queryText = input.query.trim()
  const nickQuery = nickFromQuery(queryText)
  const take = input.limit ?? 20
  const isFrequent = input.sort === 'frequent'

  const rows = await db.masterClient.findMany({
    where: {
      masterId: input.masterId,
      ...(queryText
        ? {
            OR: [
              { name: { contains: queryText, mode: 'insensitive' } },
              { phone: { contains: queryText } },
              { note: { contains: queryText, mode: 'insensitive' } },
              {
                instagramHandle: {
                  contains: nickQuery,
                  mode: 'insensitive',
                },
              },
              {
                telegramHandle: {
                  contains: nickQuery,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },
    orderBy: isFrequent ? { name: 'asc' } : { updatedAt: 'desc' },
    take: isFrequent ? FREQUENT_SCAN_CAP : take,
    select: {
      id: true,
      name: true,
      phone: true,
      source: true,
      note: true,
      instagramHandle: true,
      telegramHandle: true,
    },
  })

  const clientIds = rows.map((row) => row.id)
  const stats =
    clientIds.length === 0
      ? []
      : await db.booking.groupBy({
          by: ['masterClientId'],
          where: {
            masterId: input.masterId,
            masterClientId: { in: clientIds },
            status: 'completed',
          },
          _count: { _all: true },
          _max: { completedAt: true },
        })

  const statsByClientId = new Map(
    stats.map((row) => [
      row.masterClientId,
      {
        completedCount: row._count._all,
        lastCompletedAt: row._max.completedAt
          ? row._max.completedAt.toISOString()
          : null,
      },
    ]),
  )

  const mapped: MasterClientRecord[] = rows.map((row) => {
    const stat = statsByClientId.get(row.id)

    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      source: row.source,
      socialHandle: resolveStoredSocialHandle({
        instagramHandle: row.instagramHandle,
        telegramHandle: row.telegramHandle,
        note: row.note,
        socialHandleFromNote,
      }),
      visitsCount: stat?.completedCount ?? 0,
      lastVisitAt: stat?.lastCompletedAt ?? null,
    }
  })

  if (!isFrequent) {
    return mapped
  }

  const ranked = rankByCompletedVisits(
    mapped.map((row) => ({
      id: row.id,
      name: row.name,
      visitsCountColumn: 0,
      completedCount: row.visitsCount,
      lastCompletedAt: row.lastVisitAt,
    })),
  )
  const order = new Map(ranked.map((row, index) => [row.id, index]))

  return [...mapped]
    .sort(
      (current, other) =>
        (order.get(current.id) ?? 0) - (order.get(other.id) ?? 0),
    )
    .slice(0, take)
}
