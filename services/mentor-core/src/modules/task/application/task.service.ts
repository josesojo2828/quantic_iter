import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../infrastructure/persistence/task.repository';
import { QueryScope } from '../../../common/persistence/base.repository';
import { GamificationService } from '../../gamification/application/gamification.service';
import { GroupsService } from '../../groups/application/groups.service';
import { ProgressService } from '../../progress/application/progress.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly gamificationService: GamificationService,
    private readonly groupsService: GroupsService,
    private readonly progressService: ProgressService,
  ) { }

  async getTasks(scope: QueryScope) {
    return this.taskRepository.findAll(scope);
  }

  async getMenteeTasks(menteeId: string, scope: QueryScope) {
    return this.taskRepository.findByMentee(menteeId, scope);
  }

  async createTask(data: any, scope: QueryScope) {
    if (data.groupId) {
      const { groupId, ...taskData } = data;
      const members = await this.groupsService.getMembers(groupId, scope);
      const results = [];
      for (const member of members) {
        results.push(await this.taskRepository.create({
          ...taskData,
          assigneeId: member.menteeId,
        }, scope));
      }
      return { success: true, count: results.length, bulk: true, tasks: results };
    }
    return this.taskRepository.create(data, scope);
  }

  async updateTaskStatus(id: string, status: string, scope: QueryScope) {
    const task = await this.taskRepository.findOne(id, scope);
    if (!task) throw new Error('Tarea no encontrada');

    const updateData: any = { status };
    if (status === 'APPROVED') {
      updateData.completedAt = new Date();
      
      // Award XP
      if (task.xpReward > 0) {
        await this.gamificationService.awardXp(
          task.assigneeId,
          scope.tenantId!,
          task.xpReward,
          'TASK_COMPLETED',
          { taskId: id, title: task.title }
        );

        await this.progressService.logActivity({
          tenantId: scope.tenantId,
          menteeId: task.assigneeId,
          type: 'TASK_COMPLETED',
          title: 'Tarea Completada',
          description: `Has completado la tarea: ${task.title}`,
          metadata: { taskId: id }
        });
      }
    }
    return this.taskRepository.update(id, updateData, scope);
  }
}
