import { Injectable } from '@nestjs/common'

/**
 * Инъекция "текущего времени" вместо прямых вызовов `new Date()`/`Date.now()`
 * в доменной логике. Даёт детерминированные юнит-тесты генератора слотов и
 * машины состояний брони (TECH-DESIGN §17: "подстановка фиктивного now").
 */
@Injectable()
export class ClockService {
  now(): Date {
    return new Date()
  }
}

/** Тестовый двойник: `new FixedClock(new Date('2026-07-27T10:00:00Z'))`. */
export class FixedClock implements ClockService {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed
  }
}
