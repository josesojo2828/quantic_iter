import { Module } from '@nestjs/common';
import { ObjectiveController } from './infrastructure/controllers/objective.controller';
import { ObjectiveService } from './application/objective.service';
import { ObjectiveRepository } from './infrastructure/persistence/objective.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [ObjectiveController],
  providers: [ObjectiveService, ObjectiveRepository, PrismaService],
  exports: [ObjectiveService, ObjectiveRepository],
})
export class ObjectiveModule {}
