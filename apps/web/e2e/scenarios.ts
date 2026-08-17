/**
 * Beta P0 matrix for mocked Playwright UI e2e.
 *
 * Full journeys (happy path across screens):
 * - S1 master: register → onboarding (profile, services, schedule, portfolio)
 * - S3 client: catalog → public page → hold → confirm → cabinet
 * - Client + master: book → confirm → complete → review in one spec
 * - S2 master: calendar → manual booking → list
 * - S4 cancel: client cancels confirmed booking; master cancel visible to client
 * - S5 review: client reviews completed visit
 * - Booking races: parallel hold, stale chip, chip gone after reload
 * - Portfolio: master uploads stub photos; client sees them on /m/[slug]
 *
 * Feature slices:
 * - Auth: login/logout, bad password, forgot/reset, role guards
 * - Catalog: list, category, district, empty filters
 * - Favorites: add from public page
 * - Booking: guest redirected, SLOT_TAKEN, IDOR
 * - Master calendar: block time, day-off exception
 * - Master bookings: confirm, complete, cancel with reason, reschedule
 * - Master portfolio: stub PNG upload, cover, delete
 * - Admin: approve pending master
 *
 * Out of this suite (need real integrations / not UI):
 * Telegram bind/reminders, landing Lighthouse, real object-storage
 * credentials, Instagram in-app cookie quirks.
 */
export const BETA_E2E_FLOWS = [
  'auth-register-login',
  'auth-password-reset',
  'auth-role-guards',
  'catalog-browse',
  'client-favorites',
  'client-book-slot',
  'client-cancel-and-review',
  'client-view-portfolio',
  'booking-journey',
  'booking-race',
  'master-onboarding',
  'master-calendar',
  'master-manage-booking',
  'master-portfolio',
  'admin-moderate-master',
] as const
