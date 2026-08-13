import type { ModerateMasterAction } from '@lustra/contracts'

export const AuditActionType = {
  MasterModerateApprove: 'master.moderate.approve',
  MasterModerateReject: 'master.moderate.reject',
  MasterModerateHide: 'master.moderate.hide',
  MasterModerateBan: 'master.moderate.ban',
} as const

export type AuditActionType =
  (typeof AuditActionType)[keyof typeof AuditActionType]

export const MASTER_MODERATE_AUDIT_ACTION = {
  approve: AuditActionType.MasterModerateApprove,
  reject: AuditActionType.MasterModerateReject,
  hide: AuditActionType.MasterModerateHide,
  ban: AuditActionType.MasterModerateBan,
} as const satisfies Record<ModerateMasterAction, AuditActionType>
