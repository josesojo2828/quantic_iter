import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubscriptionCheckerService } from './subscription-checker.service';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'subscription-worker',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'subscription-worker-group',
          },
        },
      },
    ]),
  ],
  providers: [SubscriptionCheckerService, PrismaService],
  exports: [SubscriptionCheckerService],
})
export class SubscriptionCheckerModule {}
