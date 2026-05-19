import { Module } from '@nestjs/common';
import { HabitController } from './infrastructure/controllers/habit.controller';
import { HabitService } from './application/habit.service';
import { HabitRepository } from './infrastructure/persistence/habit.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

import { GamificationModule } from '../gamification/gamification.module';
import { GroupsModule } from '../groups/groups.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [GamificationModule, GroupsModule, ProgressModule],
  controllers: [HabitController],
  providers: [HabitService, HabitRepository, PrismaService],
  exports: [HabitService],
})
export class HabitModule {}
