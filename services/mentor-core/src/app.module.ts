import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GroupsModule } from './modules/groups/groups.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { ProgramModule } from './modules/program/program.module';
import { TaskModule } from './modules/task/task.module';
import { HabitModule } from './modules/habit/habit.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { MeasurementModule } from './modules/measurement/measurement.module';
import { SessionModule } from './modules/session/session.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BusinessTierModule } from './modules/business-tier/business-tier.module';
import { ResourceModule } from './modules/resource/resource.module';
import { ObjectiveModule } from './modules/objective/objective.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GroupsModule,
    GamificationModule,
    ProgramModule,
    TaskModule,
    HabitModule,
    AnnouncementModule,
    MeasurementModule,
    SessionModule,
    InvitationModule,
    DashboardModule,
    ProgressModule,
    SubscriptionModule,
    BusinessTierModule,
    ResourceModule,
    ObjectiveModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}

