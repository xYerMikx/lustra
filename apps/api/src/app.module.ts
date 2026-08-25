import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'

import { isProduction } from '@/common/env/is-production'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { StorageModule } from '@/common/storage/storage.module'
import { TimeModule } from '@/common/time/time.module'
import { HealthModule } from '@/health/health.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { AdminModerationModule } from '@/modules/admin-moderation/admin-moderation.module'
import { BookingsModule } from '@/modules/bookings/bookings.module'
import { FavoritesModule } from '@/modules/favorites/favorites.module'
import { MasterCalendarModule } from '@/modules/master-calendar/master-calendar.module'
import { MasterPortfolioModule } from '@/modules/master-portfolio/master-portfolio.module'
import { MasterProfileModule } from '@/modules/master-profile/master-profile.module'
import { ReviewsModule } from '@/modules/reviews/reviews.module'
import { MasterScheduleModule } from '@/modules/master-schedule/master-schedule.module'
import { MasterServicesModule } from '@/modules/master-services/master-services.module'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'
import { MasterLedgerModule } from '@/modules/master-ledger/master-ledger.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { RecommendationsModule } from '@/modules/recommendations/recommendations.module'
import { TelegramModule } from '@/modules/telegram/telegram.module'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined
          : { target: 'pino-pretty', options: { singleLine: true } },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    StorageModule,
    TimeModule,
    HealthModule,
    AuthModule,
    AdminModerationModule,
    MasterProfileModule,
    ReviewsModule,
    MasterServicesModule,
    MasterPortfolioModule,
    MasterScheduleModule,
    MasterCalendarModule,
    SchedulingModule,
    BookingsModule,
    FavoritesModule,
    MasterLedgerModule,
    NotificationsModule,
    RecommendationsModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
