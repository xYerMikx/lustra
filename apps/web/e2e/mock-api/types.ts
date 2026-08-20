import type {
  AuthUserView,
  AvailabilitySlotView,
  BookingClientView,
  BookingMasterView,
  BookingStatus,
  CatalogMasterCard,
  DistrictView,
  MasterCalendarSlotView,
  MasterProfileView,
  PortfolioItemView,
  PublicMasterView,
  PublicReviewView,
  ScheduleExceptionView,
  ServiceCategoryView,
  ServiceTemplateView,
  ServiceView,
  TimeBlockView,
} from '@lustra/contracts'

export type E2eUser = {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string | null
  role: AuthUserView['role']
  emailVerified: boolean
  telegramLinked: boolean
  profileStatus: AuthUserView['profileStatus']
}

export type E2eBooking = {
  id: string
  masterId: string
  masterUserId: string
  masterDisplayName: string
  clientUserId: string | null
  serviceId: string
  serviceTitle: string
  serviceDurationMin: number
  priceAmount: string
  currency: string
  startsAt: string
  endsAt: string
  status: BookingStatus
  holdExpiresAt: string | null
  clientComment: string | null
  confirmedAt: string | null
  completedAt: string | null
  masterNote: string | null
  clientName: string
  clientPhone: string | null
  addressHint: string | null
  addressExact: string | null
  review: BookingClientView['review']
}

export type E2ePortfolioItem = PortfolioItemView & {
  masterId: string
}

export type MockWorld = {
  users: E2eUser[]
  resetTokens: Map<string, string>
  favorites: Set<string>
  districts: DistrictView[]
  categories: ServiceCategoryView[]
  templates: ServiceTemplateView[]
  catalog: CatalogMasterCard[]
  publicMasters: PublicMasterView[]
  publicReviews: PublicReviewView[]
  profiles: MasterProfileView[]
  services: ServiceView[]
  availability: AvailabilitySlotView[]
  conflictStartsAt: string | null
  calendarSlots: MasterCalendarSlotView[]
  blocks: TimeBlockView[]
  exceptions: ScheduleExceptionView[]
  bookings: E2eBooking[]
  portfolioItems: E2ePortfolioItem[]
  adminMasters: Array<{
    id: string
    slug: string
    displayName: string
    status: NonNullable<AuthUserView['profileStatus']>
    districtName: string | null
    updatedAt: string
  }>
  idempotency: Map<string, string>
}

export function toAuthUserView(user: E2eUser): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    telegramLinked: user.telegramLinked,
    profileStatus: user.profileStatus,
  }
}

export function toClientBooking(booking: E2eBooking): BookingClientView {
  return {
    id: booking.id,
    masterId: booking.masterId,
    masterDisplayName: booking.masterDisplayName,
    serviceId: booking.serviceId,
    serviceTitle: booking.serviceTitle,
    serviceDurationMin: booking.serviceDurationMin,
    priceAmount: booking.priceAmount,
    currency: booking.currency,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    status: booking.status,
    holdExpiresAt: booking.holdExpiresAt,
    clientComment: booking.clientComment,
    confirmedAt: booking.confirmedAt,
    completedAt: booking.completedAt,
    review: booking.review,
    addressHint: booking.addressHint,
    addressExact:
      booking.status === 'confirmed' || booking.status === 'completed'
        ? booking.addressExact
        : null,
  }
}

export function toMasterBooking(booking: E2eBooking): BookingMasterView {
  return {
    id: booking.id,
    masterId: booking.masterId,
    serviceId: booking.serviceId,
    serviceTitle: booking.serviceTitle,
    serviceDurationMin: booking.serviceDurationMin,
    priceAmount: booking.priceAmount,
    currency: booking.currency,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    status: booking.status,
    holdExpiresAt: booking.holdExpiresAt,
    clientComment: booking.clientComment,
    confirmedAt: booking.confirmedAt,
    completedAt: booking.completedAt,
    masterNote: booking.masterNote,
    channel: null,
    client: {
      name: booking.clientName,
      phone: booking.clientPhone,
      note: booking.masterNote,
      socialHandle: null,
      source: null,
    },
  }
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return {
    status,
    body: {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
  }
}
