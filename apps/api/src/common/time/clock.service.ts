import { Injectable } from '@nestjs/common'

/**
 * Инъекция "текущего времени" вместо прямых вызовов `new Date()`/`Date.now()`
 * в доменной логике. Даёт детерминированные юнит-тесты генератора слотов и
 * машины состояний брони
 */
@Injectable()
export class ClockService {
  now(): Date {
    return new Date()
  }
}

export class FixedClock implements ClockService {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed
  }
}
