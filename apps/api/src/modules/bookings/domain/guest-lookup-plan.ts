export type SocialIdentityNetwork = 'instagram' | 'telegram'

export type GuestLookupStep =
  | { by: 'phone'; phone: string }
  | { by: 'instagram'; handle: string }
  | { by: 'telegram'; handle: string }

export function normalizeGuestHandle(handle: string): string {
  return handle.replace(/^@+/u, '').trim().toLowerCase()
}

export function guestLookupPlan(input: {
  phone: string | null
  identityNetwork: SocialIdentityNetwork
  socialHandle: string
}): GuestLookupStep[] {
  const handle = normalizeGuestHandle(input.socialHandle)
  const steps: GuestLookupStep[] = []

  if (input.phone) {
    steps.push({ by: 'phone', phone: input.phone })
  }

  if (input.identityNetwork === 'telegram') {
    steps.push({ by: 'telegram', handle })
  } else {
    steps.push({ by: 'instagram', handle })
  }

  return steps
}

export function resolveStoredSocialHandle(input: {
  instagramHandle: string | null
  telegramHandle: string | null
  note: string | null
  socialHandleFromNote: (note: string | null) => string | null
}): string | null {
  if (input.instagramHandle) {
    return input.instagramHandle
  }

  if (input.telegramHandle) {
    return input.telegramHandle
  }

  return input.socialHandleFromNote(input.note)
}
