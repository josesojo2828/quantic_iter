import { Module } from '@nestjs/common';
import { ProgressService } from './application/progress.service';
import { ProgressController } from './infrastructure/controllers/progress.controller';
import { ProgressRepository } from './infrastructure/persistence/progress.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository, PrismaService],
  exports: [ProgressService],
})
export class ProgressModule {}
