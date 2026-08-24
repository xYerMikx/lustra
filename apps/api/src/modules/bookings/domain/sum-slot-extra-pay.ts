export function sumSlotExtraPay(
  slots: Array<{ extraPayAmount?: string | null }>,
): string {
  let total = 0

  for (const slot of slots) {
    if (!slot.extraPayAmount) {
      continue
    }

    const amount = Number(slot.extraPayAmount)

    if (!Number.isFinite(amount) || amount <= 0) {
      continue
    }

    total += amount
  }

  return total.toFixed(2)
}
