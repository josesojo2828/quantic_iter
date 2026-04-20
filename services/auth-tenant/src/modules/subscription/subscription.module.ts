import { Module } from '@nestjs/common';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './infrastructure/controllers/subscription.controller';
import { PrismaSubscriptionRepository } from './infrastructure/persistence/prisma-subscription.repository';
import { KafkaModule } from '@workshop/shared';

@Module({
  imports: [KafkaModule.register('subscription-producer', 'subscription-group')],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    {
      provide: 'ISubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule { }
