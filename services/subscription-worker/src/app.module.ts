import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionCheckerModule } from './modules/subscription-checker/subscription-checker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SubscriptionCheckerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
