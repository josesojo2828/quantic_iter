import { Module } from '@nestjs/common';
import { SubscriptionService } from './application/subscription.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  providers: [SubscriptionService, PrismaService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
