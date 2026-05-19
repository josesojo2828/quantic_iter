import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { StaffModule } from './modules/staff/staff.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { BranchModule } from './modules/branch/branch.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscoveryModule, Reflector, APP_GUARD } from '@nestjs/core';
import { PermissionsGuard, StorageModule } from '@mentor/shared/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { InternalEventBusModule } from './common/kafka/kafka.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TenantThrottlerGuard } from './common/auth/guards/tenant-throttler.guard';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    AdminModule,
    PrismaModule,
    StaffModule,
    SubscriptionModule,
    InvitationModule,
    BranchModule,
    DiscoveryModule,
    InternalEventBusModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new PermissionsGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule { }
