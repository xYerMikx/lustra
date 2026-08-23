export function parseMoneyAmount(raw: string): string {
  const normalized = raw.trim().replace(',', '.')
  const value = Number(normalized)

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('INVALID_MONEY')
  }

  return value.toFixed(2)
}

export function decimalToMoneyString(
  value: { toString(): string } | string | number,
): string {
  return Number(value.toString()).toFixed(2)
}

export function sumMoney(parts: string[]): string {
  const total = parts.reduce((acc, part) => acc + Number(part), 0)

  return total.toFixed(2)
}

export function subtractMoney(left: string, right: string): string {
  return (Number(left) - Number(right)).toFixed(2)
}
