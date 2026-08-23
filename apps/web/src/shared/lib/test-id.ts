/** Stable `data-testid` values for Playwright. Stripped from production JSX. */

export const TEST_ID = {
  pageLogin: 'page-login',
  pageRegister: 'page-register',
  pageForgot: 'page-forgot',
  pageReset: 'page-reset',
  pageClientCabinet: 'page-client-cabinet',
  pageMasterCabinet: 'page-master-cabinet',
  pageAdminModeration: 'page-admin-moderation',
  pageCatalog: 'page-catalog',
  pageMasterPublic: 'page-master-public',
  pageOnboarding: 'page-onboarding',
  pageClientBookings: 'page-client-bookings',
  pageClientBookingDetail: 'page-client-booking-detail',
  pageFavorites: 'page-favorites',
  pageCalendar: 'page-calendar',
  pageMasterBookings: 'page-master-bookings',
  pageMasterBookingDetail: 'page-master-booking-detail',

  appLogout: 'app-logout',

  authLoginEmail: 'auth-login-email',
  authLoginPassword: 'auth-login-password',
  authLoginSubmit: 'auth-login-submit',
  authForgotLink: 'auth-forgot-link',
  authFormError: 'auth-form-error',
  authRegisterName: 'auth-register-name',
  authRegisterEmail: 'auth-register-email',
  authRegisterPassword: 'auth-register-password',
  authRegisterPasswordError: 'auth-register-password-error',
  authRegisterTerms: 'auth-register-terms',
  authRegisterSubmit: 'auth-register-submit',
  authRoleClient: 'auth-role-client',
  authRoleMaster: 'auth-role-master',
  authForgotEmail: 'auth-forgot-email',
  authForgotSubmit: 'auth-forgot-submit',
  authForgotSent: 'auth-forgot-sent',
  authResetPassword: 'auth-reset-password',
  authResetSubmit: 'auth-reset-submit',
  authResetInvalid: 'auth-reset-invalid',
  authResetDone: 'auth-reset-done',
  authResetLoginLink: 'auth-reset-login-link',

  catalogHeading: 'catalog-heading',
  catalogEmpty: 'catalog-empty',
  catalogSubmit: 'catalog-submit',
  catalogPriceMax: 'catalog-price-max',
  catalogDistricts: 'catalog-districts',
  catalogList: 'catalog-list',
  confirmPopoverConfirm: 'confirm-popover-confirm',

  masterPublicName: 'master-public-name',

  slotPicker: 'slot-picker',
  slotPickerConfirm: 'slot-picker-confirm',
  slotPickerSuccess: 'slot-picker-success',
  slotHoldSubmit: 'slot-hold-submit',
  slotConfirmSubmit: 'slot-confirm-submit',
  slotComment: 'slot-comment',
  slotSelected: 'slot-selected',
  slotError: 'slot-error',
  slotStatus: 'slot-status',

  clientBookingsList: 'client-bookings-list',
  clientCancelReason: 'client-cancel-reason',
  clientCancelSubmit: 'client-cancel-submit',
  bookingNotFound: 'booking-not-found',

  reviewPrompt: 'review-prompt',
  reviewText: 'review-text',
  reviewSubmit: 'review-submit',
  reviewThanks: 'review-thanks',

  favoritesToggle: 'favorites-toggle',
  favoritesList: 'favorites-list',

  onboardingSlug: 'onboarding-slug',
  onboardingDisplayName: 'onboarding-display-name',
  onboardingHeadline: 'onboarding-headline',
  onboardingSubmit: 'onboarding-submit',
  onboardingSkip: 'onboarding-skip',
  onboardingBack: 'onboarding-back',
  onboardingServiceTitle: 'onboarding-service-title',
  onboardingServiceTitleError: 'onboarding-service-title-error',
  onboardingFormError: 'onboarding-form-error',
  onboardingPortfolioAdd: 'onboarding-portfolio-add',
  pageMasterPortfolio: 'page-master-portfolio',
  pageMasterLedger: 'page-master-ledger',
  portfolioFileInput: 'portfolio-file-input',
  portfolioEmpty: 'portfolio-empty',
  portfolioCoverBadge: 'portfolio-cover-badge',
  portfolioLightbox: 'portfolio-lightbox',
  portfolioLightboxClose: 'portfolio-lightbox-close',
  publicPortfolioGallery: 'public-portfolio-gallery',
  masterPublicCover: 'master-public-cover',

  bookingsTabUpcoming: 'bookings-tab-upcoming',
  bookingsTabPast: 'bookings-tab-past',
  bookingsTabPending: 'bookings-tab-pending',

  calendarBlockOpen: 'calendar-block-open',
  calendarExceptionOpen: 'calendar-exception-open',
  calendarManualOpen: 'calendar-manual-open',
  calendarBackToWeek: 'calendar-back-to-week',
  calendarBlockChip: 'calendar-block-chip',
  calendarExceptionChip: 'calendar-exception-chip',
  dialogBlock: 'dialog-block',
  dialogBlockSubmit: 'dialog-block-submit',
  dialogException: 'dialog-exception',
  dialogExceptionSubmit: 'dialog-exception-submit',
  dialogManual: 'dialog-manual',
  dialogManualName: 'dialog-manual-name',
  dialogManualPhone: 'dialog-manual-phone',
  dialogManualSubmit: 'dialog-manual-submit',

  masterBookingsList: 'master-bookings-list',
  masterBookingConfirm: 'master-booking-confirm',
  masterBookingComplete: 'master-booking-complete',
  masterBookingCancelReason: 'master-booking-cancel-reason',
  masterBookingCancelSubmit: 'master-booking-cancel-submit',
  masterBookingComment: 'master-booking-comment',
  masterRescheduleReason: 'master-reschedule-reason',
  masterRescheduleSubmit: 'master-reschedule-submit',

  adminQueueEmpty: 'admin-queue-empty',
  adminApprove: 'admin-approve',
} as const

export function masterCardTestId(slug: string): string {
  return `master-card-${slug}`
}

export function catalogCategoryTestId(slug: string): string {
  return `catalog-category-${slug}`
}

export function catalogDistrictTestId(slug: string): string {
  return `catalog-district-${slug}`
}

export function slotChipTestId(timeLabel: string): string {
  return `slot-chip-${timeLabel.replace(':', '-')}`
}

export function serviceOptionTestId(serviceId: string): string {
  return `service-option-${serviceId}`
}

export function bookingStatusTestId(status: string): string {
  return `booking-status-${status}`
}

export function reviewStarTestId(rating: number): string {
  return `review-star-${rating}`
}

export function onboardingStepTestId(stepId: string): string {
  return `onboarding-step-${stepId}`
}

export function adminMasterCardTestId(slug: string): string {
  return `admin-master-${slug}`
}

export function bookingRowTestId(bookingId: string): string {
  return `booking-row-${bookingId}`
}

export function onboardingTemplateTestId(title: string): string {
  return `onboarding-template-${title}`
}

export function onboardingPresetTestId(presetId: string): string {
  return `onboarding-preset-${presetId}`
}

export function onboardingProgressTestId(stepId: string): string {
  return `onboarding-progress-${stepId}`
}

export function portfolioCardTestId(itemId: string): string {
  return `portfolio-card-${itemId}`
}

export function portfolioSetCoverTestId(itemId: string): string {
  return `portfolio-set-cover-${itemId}`
}

export function portfolioRemoveTestId(itemId: string): string {
  return `portfolio-remove-${itemId}`
}

export function publicPortfolioShotTestId(itemId: string): string {
  return `public-portfolio-shot-${itemId}`
}
