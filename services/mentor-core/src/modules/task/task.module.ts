import { Module } from '@nestjs/common';
import { TaskController } from './infrastructure/controllers/task.controller';
import { TaskService } from './application/task.service';
import { TaskRepository } from './infrastructure/persistence/task.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

import { GamificationModule } from '../gamification/gamification.module';
import { GroupsModule } from '../groups/groups.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [GamificationModule, GroupsModule, ProgressModule],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, PrismaService],
  exports: [TaskService],
})
export class TaskModule {}
