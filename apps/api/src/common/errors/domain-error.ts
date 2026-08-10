import { ERROR_HTTP_STATUS, type ErrorCode } from './error-codes'

/**
 * Единый класс ошибок бизнес-логики. Use-case-классы бросают DomainError,
 * а не общие Error/HttpException — так DomainExceptionFilter может
 * детерминированно превратить её в { error: { code, message, details } }.
 */
export class DomainError extends Error {
  readonly code: ErrorCode
  readonly httpStatus: number
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.name = 'DomainError'
    this.code = code
    this.httpStatus = ERROR_HTTP_STATUS[code]
    this.details = details
  }

  static notFound(message = 'Ресурс не найден', details?: unknown) {
    return new DomainError('NOT_FOUND', message, details)
  }

  static forbidden(message = 'Доступ запрещён', details?: unknown) {
    return new DomainError('FORBIDDEN', message, details)
  }

  static slotTaken(details?: unknown) {
    return new DomainError('SLOT_TAKEN', 'Это время только что заняли', details)
  }

  static holdExpired(details?: unknown) {
    return new DomainError('HOLD_EXPIRED', 'Время удержания слота истекло', details)
  }

  static invalidState(message = 'Недопустимый переход статуса', details?: unknown) {
    return new DomainError('INVALID_STATE', message, details)
  }
}
