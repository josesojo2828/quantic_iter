import { Module } from '@nestjs/common';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionTasksService } from './application/subscription-tasks.service';
import { SubscriptionController } from './infrastructure/controllers/subscription.controller';
import { PrismaSubscriptionRepository } from './infrastructure/persistence/prisma-subscription.repository';
import { KafkaModule } from '@mentor/shared';

@Module({
  imports: [KafkaModule.register('subscription-producer', 'subscription-group')],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionTasksService,
    {
      provide: 'ISubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
  ],
  exports: [SubscriptionService, 'ISubscriptionRepository'],
})
export class SubscriptionModule { }
