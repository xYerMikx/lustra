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
  pageNotFound: 'page-not-found',
  pageAppError: 'page-app-error',
  appErrorTrace: 'app-error-trace',
  appErrorHome: 'app-error-home',
  notFoundCatalog: 'not-found-catalog',
  pageMasterPublic: 'page-master-public',
  pageOnboarding: 'page-onboarding',
  pageClientBookings: 'page-client-bookings',
  pageClientBook: 'page-client-book',
  clientBookCta: 'client-book-cta',
  clientBookServiceStep: 'client-book-service-step',
  clientBookMasterStep: 'client-book-master-step',
  clientBookSlotStep: 'client-book-slot-step',
  clientBookServiceSearch: 'client-book-service-search',
  clientBookBack: 'client-book-back',
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
  authFormPending: 'auth-form-pending',
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
  telegramConnect: 'telegram-connect',
  telegramLinked: 'telegram-linked',
  notifyProbe: 'notify-probe',
  notifyProbeStatus: 'notify-probe-status',

  reviewPrompt: 'review-prompt',
  reviewText: 'review-text',
  reviewSubmit: 'review-submit',
  reviewThanks: 'review-thanks',
  masterReviewPrompt: 'master-review-prompt',
  masterReviewText: 'master-review-text',
  masterReviewSubmit: 'master-review-submit',
  masterReviewThanks: 'master-review-thanks',
  pageClientReviews: 'page-client-reviews',

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
  ledgerChart: 'ledger-chart',
  ledgerSnapshot: 'ledger-snapshot',
  ledgerAddOpen: 'ledger-add-open',
  ledgerQuickTip: 'ledger-quick-tip',
  ledgerQuickExpense: 'ledger-quick-expense',
  ledgerAmount: 'ledger-amount',
  ledgerEntrySubmit: 'ledger-entry-submit',
  bookingAddTip: 'booking-add-tip',
  pageMasterClients: 'page-master-clients',
  portfolioFileInput: 'portfolio-file-input',
  portfolioEmpty: 'portfolio-empty',
  portfolioCoverBadge: 'portfolio-cover-badge',
  portfolioLightbox: 'portfolio-lightbox',
  portfolioLightboxClose: 'portfolio-lightbox-close',
  portfolioCarousel: 'portfolio-carousel',
  portfolioCarouselPrev: 'portfolio-carousel-prev',
  portfolioCarouselNext: 'portfolio-carousel-next',
  publicPortfolioGallery: 'public-portfolio-gallery',
  publicPortfolioSentinel: 'public-portfolio-sentinel',
  masterPublicCover: 'master-public-cover',

  bookingsTabUpcoming: 'bookings-tab-upcoming',
  bookingsTabPast: 'bookings-tab-past',
  bookingsTabPending: 'bookings-tab-pending',
  bookingsManualOpen: 'bookings-manual-open',
  bookingsEmptyManualOpen: 'bookings-empty-manual-open',

  calendarBlockOpen: 'calendar-block-open',
  calendarExceptionOpen: 'calendar-exception-open',
  calendarExtraOpen: 'calendar-extra-open',
  calendarManualOpen: 'calendar-manual-open',
  calendarBackToWeek: 'calendar-back-to-week',
  calendarStripPrev: 'calendar-strip-prev',
  calendarStripNext: 'calendar-strip-next',
  calendarToday: 'calendar-today',
  navFirstSteps: 'nav-onboarding',
  calendarBlockChip: 'calendar-block-chip',
  calendarExceptionChip: 'calendar-exception-chip',
  dialogBlock: 'dialog-block',
  dialogBlockSubmit: 'dialog-block-submit',
  dialogException: 'dialog-exception',
  dialogExceptionSubmit: 'dialog-exception-submit',
  dialogExtraSlot: 'dialog-extra-slot',
  dialogManual: 'dialog-manual',
  dialogManualName: 'dialog-manual-name',
  dialogManualPhone: 'dialog-manual-phone',
  dialogManualHandle: 'dialog-manual-handle',
  dialogManualSubmit: 'dialog-manual-submit',

  clientsTabSearch: 'clients-tab-search',
  clientsTabFrequent: 'clients-tab-frequent',
  clientsSearchInput: 'clients-search-input',
  clientsList: 'clients-list',
  clientsBookButton: 'clients-book-button',

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

export function bookServiceOptionTestId(key: string): string {
  return `book-service-${key.replace(/[^a-zA-Z0-9_-]+/g, '-')}`
}

export function bookMasterOptionTestId(slug: string): string {
  return `book-master-${slug}`
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
