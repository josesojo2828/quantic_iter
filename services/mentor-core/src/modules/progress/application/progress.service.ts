import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgressRepository } from '../infrastructure/persistence/progress.repository';
import { QueryScope } from '../../../common/persistence/base.repository';
import { GamificationService } from '../../gamification/application/gamification.service';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly repository: ProgressRepository,
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService // Using prisma directly for complex cross-module analytics
  ) {}

  // Milestones
  async createMilestone(data: any) {
    return this.repository.createMilestone(data);
  }

  async getProgramMilestones(programId: string, scope: QueryScope) {
    return this.repository.findMilestonesByProgram(programId, scope);
  }

  async completeMilestone(milestoneId: string, menteeId: string, scope: QueryScope, date?: Date) {
    const completion = await this.repository.completeMilestone(milestoneId, menteeId, date);
    
    // Activity Log
    await this.logActivity({
      tenantId: scope.tenantId,
      menteeId,
      type: 'MILESTONE_REACHED',
      title: '¡Hito Alcanzado!',
      description: 'Has completado un hito importante en tu programa.',
      metadata: { milestoneId }
    });

    // XP Reward (Milestones give a lot of XP)
    await this.gamificationService.awardXp(menteeId, scope.tenantId, 500, 'MILESTONE_COMPLETED', 'Hito de programa completado');

    // Auto-complete linked Objective (Task) if 100% of milestones are checked at least once
    try {
      const milestoneWithProgram = await this.prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          phase: {
            select: { programId: true }
          }
        }
      });

      if (milestoneWithProgram?.phase?.programId) {
        const programId = milestoneWithProgram.phase.programId;

        // Get all milestones for this program
        const allMilestones = await this.prisma.milestone.findMany({
          where: {
            phase: { programId }
          }
        });

        const milestoneIds = allMilestones.map(m => m.id);

        if (milestoneIds.length > 0) {
          // Count unique completions for this mentee on this program's milestones
          const uniqueCompletionsCount = await this.prisma.milestoneCompletion.groupBy({
            by: ['milestoneId'],
            where: {
              milestoneId: { in: milestoneIds },
              menteeId
            }
          });

          const totalMilestones = milestoneIds.length;
          const completedMilestones = uniqueCompletionsCount.length;

          if (completedMilestones === totalMilestones) {
            // Find linked tasks not yet submitted or approved
            const linkedTasks = await this.prisma.task.findMany({
              where: {
                programId,
                assigneeId: menteeId,
                status: { notIn: ['DONE', 'APPROVED', 'SUBMITTED'] }
              }
            });

            for (const task of linkedTasks) {
              await this.prisma.task.update({
                where: { id: task.id },
                data: { status: 'SUBMITTED', completedAt: new Date() }
              });

              // Log activity for target completed
              await this.logActivity({
                tenantId: scope.tenantId,
                menteeId,
                type: 'OBJECTIVE_SUBMITTED',
                title: '¡Objetivo Alcanzado!',
                description: `El programa de hábitos vinculados a "${task.title}" ha sido completado con éxito.`,
                metadata: { taskId: task.id, programId }
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in automated objective completion logic:', err);
    }

    return completion;
  }

  // Timeline
  async getTimeline(menteeId: string, scope: QueryScope) {
    return this.repository.getMenteeTimeline(menteeId, scope);
  }

  async logActivity(data: any) {
    return this.repository.createActivityLog(data);
  }

  // Progress Score Analytics
  async getProgressScore(menteeId: string, scope: QueryScope) {
    // 1. Tareas: Completadas vs Totales
    const tasks = await this.prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: menteeId, tenantId: scope.tenantId },
      _count: true
    });

    const totalTasks = tasks.reduce((sum: number, t: any) => sum + t._count, 0);
    const completedTasks = tasks.find((t: any) => t.status === 'DONE' || t.status === 'APPROVED')?._count || 0;

    // 2. Sesiones: Asistidas vs Totales (donde el mentee es parte)
    // Buscamos asistencias registradas
    const attendance = await this.prisma.sessionAttendance.count({
      where: { menteeId, status: 'PRESENT' }
    });

    // Buscamos sesiones totales donde debería haber estado (simplificado: todas sus sesiones individuales + grupales de sus grupos)
    const totalSessions = await this.prisma.session.count({
      where: {
        tenantId: scope.tenantId,
        OR: [
          { menteeId },
          { groupId: { not: null } } // This is a simplification, should ideally check membership
        ]
      }
    });

    // 3. Cálculo de Score (0 a 100)
    const taskWeight = 0.6;
    const sessionWeight = 0.4;

    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
    const sessionScore = totalSessions > 0 ? (attendance / totalSessions) * 100 : 100;

    const finalScore = Math.round((taskScore * taskWeight) + (sessionScore * sessionWeight));

    return {
      score: finalScore,
      breakdown: {
        tasks: { completed: completedTasks, total: totalTasks, percentage: Math.round(taskScore) },
        sessions: { attended: attendance, total: totalSessions, percentage: Math.round(sessionScore) }
      },
      updatedAt: new Date()
    };
  }
}
