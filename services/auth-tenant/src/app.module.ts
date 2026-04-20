import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscoveryModule, Reflector, APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from '@workshop/shared/nestjs';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    StaffModule,
    SubscriptionModule,
    DiscoveryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new PermissionsGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
