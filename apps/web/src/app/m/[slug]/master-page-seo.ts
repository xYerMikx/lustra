type MasterSeoInput = {
  displayName: string
  headline: string | null
  bio: string | null
  status: 'pending_review' | 'published'
  serviceCount: number
  portfolioCount: number
  districtName?: string | null
}

const THIN_PORTFOLIO_MIN = 3

export function masterPageTitle(displayName: string): string {
  return `${displayName} — бьюти-мастер в Минске`
}

export function masterPageDescription(input: {
  displayName: string
  headline: string | null
  bio: string | null
  districtName?: string | null
}): string {
  const place = input.districtName
    ? `${input.districtName} район, Минск`
    : 'Минск'
  const pitch = input.headline?.trim() || input.bio?.trim()

  if (pitch) {
    return `${input.displayName}, ${place}. ${pitch}`.slice(0, 160)
  }

  return `${input.displayName} — бьюти-мастер, ${place}. Портфолио, услуги и запись онлайн на Lumira.`
}

export function masterPageShouldIndex(
  input: Pick<MasterSeoInput, 'status' | 'serviceCount' | 'portfolioCount'>,
): boolean {
  if (input.status !== 'published') {
    return false
  }

  if (input.serviceCount < 1) {
    return false
  }

  return input.portfolioCount >= THIN_PORTFOLIO_MIN
}
