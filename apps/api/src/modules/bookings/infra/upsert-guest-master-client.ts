import { Prisma } from '@lustra/db'
import type { ManualBookingChannel } from '@lustra/contracts'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { DomainError } from '@/common/errors/domain-error'
import {
  guestLookupPlan,
  normalizeGuestHandle,
  type SocialIdentityNetwork,
} from '@/modules/bookings/domain/guest-lookup-plan'

type TxClient = Prisma.TransactionClient

type GuestRow = {
  id: string
  isBlocked: boolean
  phone: string | null
  instagramHandle: string | null
  telegramHandle: string | null
  note: string | null
}

const GUEST_SELECT = {
  id: true,
  isBlocked: true,
  phone: true,
  instagramHandle: true,
  telegramHandle: true,
  note: true,
} as const

export async function upsertGuestMasterClient(
  db: TxClient,
  input: {
    masterId: string
    name: string
    phone: string | null
    identityNetwork: SocialIdentityNetwork
    socialHandle: string
    source: ManualBookingChannel
  },
): Promise<{ id: string; isBlocked: boolean }> {
  const handle = normalizeGuestHandle(input.socialHandle)
  const plan = guestLookupPlan({
    phone: input.phone,
    identityNetwork: input.identityNetwork,
    socialHandle: handle,
  })

  let existing: GuestRow | null = null

  for (const step of plan) {
    existing = await findGuestByStep(db, input.masterId, step)

    if (existing) {
      break
    }
  }

  if (existing) {
    await updateMatchedGuest(db, existing, {
      name: input.name,
      phone: input.phone,
      identityNetwork: input.identityNetwork,
      handle,
      source: input.source,
    })

    return { id: existing.id, isBlocked: existing.isBlocked }
  }

  try {
    return await db.masterClient.create({
      data: {
        masterId: input.masterId,
        name: input.name,
        phone: input.phone,
        source: input.source,
        instagramHandle: input.identityNetwork === 'instagram' ? handle : null,
        telegramHandle: input.identityNetwork === 'telegram' ? handle : null,
      },
      select: { id: true, isBlocked: true },
    })
  } catch (error: unknown) {
    throwIdentityConflictOrRethrow(error)
  }
}

async function findGuestByStep(
  db: TxClient,
  masterId: string,
  step: ReturnType<typeof guestLookupPlan>[number],
): Promise<GuestRow | null> {
  if (step.by === 'phone') {
    return db.masterClient.findFirst({
      where: { masterId, phone: step.phone },
      select: GUEST_SELECT,
    })
  }

  if (step.by === 'instagram') {
    return db.masterClient.findFirst({
      where: { masterId, instagramHandle: step.handle },
      select: GUEST_SELECT,
    })
  }

  return db.masterClient.findFirst({
    where: { masterId, telegramHandle: step.handle },
    select: GUEST_SELECT,
  })
}

async function updateMatchedGuest(
  db: TxClient,
  existing: GuestRow,
  input: {
    name: string
    phone: string | null
    identityNetwork: SocialIdentityNetwork
    handle: string
    source: ManualBookingChannel
  },
): Promise<void> {
  const nextPhone =
    input.phone && (!existing.phone || existing.phone === input.phone)
      ? input.phone
      : existing.phone

  const nextInstagram =
    input.identityNetwork === 'instagram'
      ? input.handle
      : existing.instagramHandle
  const nextTelegram =
    input.identityNetwork === 'telegram' ? input.handle : existing.telegramHandle

  try {
    await db.masterClient.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        source: input.source,
        phone: nextPhone,
        instagramHandle: nextInstagram,
        telegramHandle: nextTelegram,
      },
    })
  } catch (error: unknown) {
    throwIdentityConflictOrRethrow(error)
  }
}

function throwIdentityConflictOrRethrow(error: unknown): never {
  if (isGuestIdentityUnique(error)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Клиент с таким ником или телефоном уже есть в вашей книге',
    )
  }

  throw error
}

function isGuestIdentityUnique(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const known = error as { code?: unknown; meta?: { target?: unknown } }

  if (known.code !== PRISMA_ERROR.UNIQUE_CONSTRAINT) {
    return false
  }

  const target = known.meta?.target

  if (typeof target === 'string') {
    return (
      target.includes('instagramHandle') ||
      target.includes('telegramHandle') ||
      target.includes('phone')
    )
  }

  if (!Array.isArray(target)) {
    return false
  }

  return target.some(
    (field) =>
      field === 'instagramHandle' ||
      field === 'telegramHandle' ||
      field === 'phone',
  )
}
