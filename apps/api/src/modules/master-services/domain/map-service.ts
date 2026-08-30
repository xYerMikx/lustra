import type { ServiceView } from '@lumira/contracts'
import type { PriceType, Service, ServiceCategory } from '@lumira/db'
import { Prisma } from '@lumira/db'

export type ServiceRecord = Service & {
  category: Pick<ServiceCategory, 'id' | 'name' | 'slug'>
}

export type ServiceWriteData = {
  categoryId: string
  title: string
  description: string | null
  durationMin: number
  bufferAfterMin: number
  price: Prisma.Decimal
  priceMax: Prisma.Decimal | null
  priceType: PriceType
  isActive: boolean
}

export function toServiceView(record: ServiceRecord): ServiceView {
  return {
    id: record.id,
    categoryId: record.categoryId,
    categoryName: record.category.name,
    categorySlug: record.category.slug,
    title: record.title,
    description: record.description,
    durationMin: record.durationMin,
    bufferAfterMin: record.bufferAfterMin,
    price: decimalToNumber(record.price),
    priceMax: record.priceMax ? decimalToNumber(record.priceMax) : null,
    priceType: record.priceType,
    currency: record.currency,
    isActive: record.isActive,
    sort: record.sort,
  }
}

export function decimalToNumber(value: Prisma.Decimal | number | string): number {
  if (typeof value === 'number') {
    return value
  }

  return Number(value)
}

export function toPrismaDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2))
}
