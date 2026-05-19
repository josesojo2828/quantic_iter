import { Module } from '@nestjs/common';
import { InteractionsService } from './application/interactions.service';
import { InteractionsController } from './infrastructure/controllers/interactions.controller';
import { PrismaInteractionsRepository } from './infrastructure/persistence/prisma-interactions.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [InteractionsController],
  providers: [
    InteractionsService,
    PrismaService,
    {
      provide: 'IInteractionsRepository',
      useClass: PrismaInteractionsRepository,
    },
  ],
  exports: [InteractionsService],
})
export class InteractionsModule {}
