import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { SubscriptionController } from './infrastructure/controllers/subscription.controller';
import { TenantController } from './infrastructure/controllers/tenant.controller';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { AuthService } from './application/auth.service';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionTasksService } from './application/subscription-tasks.service';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';
import { PrismaSubscriptionRepository } from './infrastructure/persistence/prisma-subscription.repository';
import { JwtStrategy } from '../../common/auth/strategies/jwt.strategy';
import { KafkaModule } from '@workshop/shared';

import { SidebarService } from './application/sidebar.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    KafkaModule.register('auth-producer', 'auth-group'),
  ],
  controllers: [AuthController, SubscriptionController, TenantController, DashboardController],
  providers: [
    AuthService,
    SubscriptionService,
    SidebarService,
    SubscriptionTasksService,
    JwtStrategy,


    {
      provide: 'IAuthRepository',
      useClass: PrismaAuthRepository,
    },
    {
      provide: 'ISubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
  ],
  exports: [AuthService, SubscriptionService],
})
export class AuthModule { }
