import { Module } from '@nestjs/common';
import { DiscoveryModule, Reflector } from '@nestjs/core';
import { StaffController } from './infrastructure/controllers/staff.controller';
import { StaffService } from './application/staff.service';
import { PrismaStaffRepository } from './infrastructure/persistence/prisma-staff.repository';
import { KafkaModule } from '@workshop/shared';
import { PermissionsGuard } from '@workshop/shared/nestjs';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    KafkaModule.register('staff-producer', 'staff-group'),
    SubscriptionModule,
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    {
      provide: 'IStaffRepository',
      useClass: PrismaStaffRepository,
    },
  ],
  exports: [StaffService],
})
export class StaffModule {}
