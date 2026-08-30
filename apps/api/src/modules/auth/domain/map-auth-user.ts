import type {
  AuthUserView,
  MasterProfileStatus,
  UserRole,
} from '@lumira/contracts'
import { resolveOnboardingStep } from '@lumira/contracts'

type UserRow = {
  id: string
  email: string
  firstName: string
  lastName: string | null
  role: UserRole
  emailVerified: boolean
  telegram: { id: string } | null
  masterProfile: {
    status: MasterProfileStatus
    locations: Array<{ id: string }>
    services: Array<{ id: string }>
    rules: Array<{ id: string }>
  } | null
}

export function toAuthUserView(user: UserRow): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    telegramLinked: Boolean(user.telegram),
    profileStatus: user.masterProfile?.status ?? null,
    onboardingStep: user.masterProfile
      ? resolveOnboardingStep({
          hasLocation: user.masterProfile.locations.length > 0,
          hasService: user.masterProfile.services.length > 0,
          hasSchedule: user.masterProfile.rules.length > 0,
        })
      : null,
  }
}
