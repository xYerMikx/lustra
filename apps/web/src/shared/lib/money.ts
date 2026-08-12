export function formatByn(amount: number, currency = 'BYN'): string {
  const formatted = new Intl.NumberFormat('ru-BY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} ${currency}`
}

export function formatPriceLabel(input: {
  price: number
  priceMax: number | null
  priceType: 'fixed' | 'from' | 'range'
  currency: string
}): string {
  if (input.priceType === 'from') {
    return `от ${formatByn(input.price, input.currency)}`
  }

  if (input.priceType === 'range' && input.priceMax != null) {
    return `${formatByn(input.price, input.currency)}–${formatByn(input.priceMax, input.currency)}`
  }

  return formatByn(input.price, input.currency)
}
