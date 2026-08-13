import type { ModerateMasterAction } from '@lustra/contracts'

export const AuditActionType = {
  MasterModerateApprove: 'master.moderate.approve',
  MasterModerateReject: 'master.moderate.reject',
  MasterModerateHide: 'master.moderate.hide',
  MasterModerateBan: 'master.moderate.ban',
  PortfolioModerateApprove: 'portfolio.moderate.approve',
  PortfolioModerateReject: 'portfolio.moderate.reject',
  ReviewModerateApprove: 'review.moderate.approve',
  ReviewModerateReject: 'review.moderate.reject',
  ReviewModerateHide: 'review.moderate.hide',
} as const

export type AuditActionType =
  (typeof AuditActionType)[keyof typeof AuditActionType]

export const MASTER_MODERATE_AUDIT_ACTION = {
  approve: AuditActionType.MasterModerateApprove,
  reject: AuditActionType.MasterModerateReject,
  hide: AuditActionType.MasterModerateHide,
  ban: AuditActionType.MasterModerateBan,
} as const satisfies Record<ModerateMasterAction, AuditActionType>

export const PORTFOLIO_MODERATE_AUDIT_ACTION = {
  approve: AuditActionType.PortfolioModerateApprove,
  reject: AuditActionType.PortfolioModerateReject,
} as const

export const REVIEW_MODERATE_AUDIT_ACTION = {
  approve: AuditActionType.ReviewModerateApprove,
  reject: AuditActionType.ReviewModerateReject,
  hide: AuditActionType.ReviewModerateHide,
} as const
