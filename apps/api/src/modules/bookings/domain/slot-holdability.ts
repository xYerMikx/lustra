export type HoldableSlotRow = {
  id: string
  startsAt: Date
  endsAt: Date
  status: 'open' | 'held' | 'booked' | 'blocked' | 'closed'
  holdExpiresAt: Date | null
  extraPayAmount?: string | null
}

export function isSlotHoldable(slot: HoldableSlotRow, now: Date): boolean {
  if (slot.status === 'open') {
    return true
  }

  if (slot.status === 'held') {
    return Boolean(slot.holdExpiresAt && slot.holdExpiresAt.getTime() <= now.getTime())
  }

  return false
}

export function assertSlotsHoldable(
  slots: HoldableSlotRow[],
  now: Date,
): void {
  for (const slot of slots) {
    if (!isSlotHoldable(slot, now)) {
      throw new Error('SLOT_TAKEN')
    }
  }
}

export function areSlotsConsecutive(
  slots: HoldableSlotRow[],
  granularityMin: number,
): boolean {
  if (slots.length === 0) {
    return false
  }

  const stepMs = granularityMin * 60_000

  for (let i = 1; i < slots.length; i++) {
    const prev = slots[i - 1]
    const current = slots[i]

    if (!prev || !current) {
      return false
    }

    if (current.startsAt.getTime() - prev.startsAt.getTime() !== stepMs) {
      return false
    }
  }

  return true
}

export function granuleNeedCount(
  durationMin: number,
  bufferAfterMin: number,
  granularityMin: number,
): number {
  const needMin = durationMin + bufferAfterMin

  return Math.ceil(needMin / granularityMin)
}

export function holdCoverageEndsAt(
  startsAt: Date,
  durationMin: number,
  bufferAfterMin: number,
): Date {
  return new Date(startsAt.getTime() + (durationMin + bufferAfterMin) * 60_000)
}

export function appointmentEndsAt(startsAt: Date, durationMin: number): Date {
  return new Date(startsAt.getTime() + durationMin * 60_000)
}
