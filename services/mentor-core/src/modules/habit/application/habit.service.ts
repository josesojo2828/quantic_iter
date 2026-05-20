import { Injectable } from '@nestjs/common';
import { HabitRepository } from '../infrastructure/persistence/habit.repository';
import { QueryScope } from '../../../common/persistence/base.repository';
import { GamificationService } from '../../gamification/application/gamification.service';

import { GroupsService } from '../../groups/application/groups.service';
import { ProgressService } from '../../progress/application/progress.service';

@Injectable()
export class HabitService {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly gamificationService: GamificationService,
    private readonly groupsService: GroupsService,
    private readonly progressService: ProgressService,
  ) { }

  async getHabits(scope: QueryScope) {
    return this.habitRepository.findAll(scope);
  }

  async getMenteeHabits(menteeId: string, scope: QueryScope) {
    return this.habitRepository.findByMentee(menteeId, scope);
  }

  async createHabit(data: any, scope: QueryScope) {
    if (data.groupId) {
      const { groupId, ...habitData } = data;
      const members = await this.groupsService.getMembers(groupId, scope);
      const results = [];
      for (const member of members) {
        results.push(await this.habitRepository.create({
          ...habitData,
          assigneeId: member.menteeId,
        }, scope));
      }
      return { success: true, count: results.length, bulk: true, habits: results };
    }
    return this.habitRepository.create(data, scope);
  }

  async recordCheckin(habitId: string, date: Date, scope: QueryScope) {
    const habit = await this.habitRepository.findOne(habitId, scope);
    if (!habit) throw new Error('Hábito no encontrado');

    const checkin = await this.habitRepository.checkin(habitId, date, scope);
    if (checkin.isNew === false) {
      return checkin;
    }
    
    // Award a small amount of XP for habit check-in
    await this.gamificationService.awardXp(
      habit.assigneeId,
      scope.tenantId!,
      10, // Base XP for habit
      'HABIT_CHECKIN',
      { habitId, name: habit.name }
    );

    // Update global streak
    await this.gamificationService.updateStreak(habit.assigneeId);

    await this.progressService.logActivity({
      tenantId: scope.tenantId,
      menteeId: habit.assigneeId,
      type: 'HABIT_STREAK', // Usamos este tipo para representar actividad de hábitos
      title: 'Hábito Cumplido',
      description: `Has realizado tu check-in diario para: ${habit.name}`,
      metadata: { habitId, date }
    });

    return checkin;
  }
}
