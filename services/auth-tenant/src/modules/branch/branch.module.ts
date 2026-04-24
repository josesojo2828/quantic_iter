import { Module } from '@nestjs/common';
import { BranchService } from './application/branch.service';
import { BranchController } from './infrastructure/controllers/branch.controller';
import { PrismaBranchRepository } from './infrastructure/persistence/prisma-branch.repository';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    SubscriptionModule,
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'branch-producer',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'branch-group',
          },
        },
      },
    ]),
  ],
  controllers: [BranchController],
  providers: [
    BranchService,
    {
      provide: 'IBranchRepository',
      useClass: PrismaBranchRepository,
    },
  ],
  exports: [BranchService],
})
export class BranchModule {}
