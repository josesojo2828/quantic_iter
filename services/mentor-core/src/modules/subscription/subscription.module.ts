import { Module } from '@nestjs/common';
import { SubscriptionService } from './application/subscription.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { SubscriptionConsumer } from './infrastructure/consumers/subscription.consumer';

@Module({
  providers: [SubscriptionService, PrismaService, SubscriptionConsumer],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
