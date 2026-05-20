import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Program, Phase } from '@prisma/client';

@Injectable()
export class ProgramRepository extends BaseRepository<Program> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(scope: QueryScope): Promise<Program[]> {
    let whereClause: any = this.applyScope({}, scope);
    
    if (scope.role === 'mentee') {
      whereClause = {
        tenantId: scope.tenantId,
        OR: [
          { menteeId: scope.userId },
          { enrollments: { some: { menteeId: scope.userId } } }
        ]
      };
    }

    return this.prisma.program.findMany({
      where: whereClause,
      include: { 
        phases: {
          orderBy: { order: 'asc' },
          include: { 
            milestones: { 
              orderBy: { order: 'asc' },
              include: { completions: true }
            } 
          }
        }
      },
    });
  }

  async findOne(id: string, scope: QueryScope): Promise<Program | null> {
    if (!id || id.length !== 24) return null;
    return this.prisma.program.findFirst({
      where: {
        id,
        OR: [
          { tenantId: scope.tenantId },
          { isPublic: true }
        ]
      },
      include: { 
        phases: {
          orderBy: { order: 'asc' },
          include: { 
            milestones: { 
              orderBy: { order: 'asc' },
              include: { completions: true }
            } 
          }
        }
      },
    });
  }

  async create(data: any, scope: QueryScope): Promise<Program> {
    const { phases, ...programData } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Program
      const program = await tx.program.create({
        data: {
          ...programData,
          tenantId: scope.tenantId!,
          coachId: scope.coachId,
          status: programData.status || 'DRAFT',
        }
      });

      // 2. Create Phases and Milestones if they exist
      if (phases && Array.isArray(phases)) {
        for (const [pIndex, phase] of phases.entries()) {
          const { milestones, ...phaseData } = phase;
          
          const newPhase = await tx.phase.create({
            data: {
              ...phaseData,
              programId: program.id,
              order: phaseData.order ?? pIndex,
              startDate: phaseData.startDate ? new Date(phaseData.startDate) : null,
              endDate: phaseData.endDate ? new Date(phaseData.endDate) : null,
              estimatedWeeks: phaseData.estimatedWeeks ? parseInt(phaseData.estimatedWeeks, 10) : null,
            }
          });

          if (milestones && Array.isArray(milestones)) {
            await tx.milestone.createMany({
              data: milestones.map((m: any, mIndex: number) => {
                const { points, xpReward, ...milestoneData } = m;
                return {
                  ...milestoneData,
                  programId: program.id,
                  phaseId: newPhase.id,
                  tenantId: scope.tenantId!,
                  order: milestoneData.order ?? mIndex,
                  xpReward: points || xpReward || 500,
                };
              })
            });
          }
        }
      }

      // 3. Return the full program with its relations
      return tx.program.findUnique({
        where: { id: program.id },
        include: { 
          phases: {
            include: { milestones: true }
          }
        }
      }) as any;
    });
  }

  async addPhase(programId: string, phaseData: any): Promise<Phase> {
    const { startDate, endDate, estimatedWeeks, order, ...rest } = phaseData;
    return this.prisma.phase.create({
      data: {
        ...rest,
        order: order ? parseInt(order, 10) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedWeeks: estimatedWeeks ? parseInt(estimatedWeeks, 10) : null,
        programId,
      },
    });
  }

  async updatePhase(id: string, data: any): Promise<Phase> {
    const { startDate, endDate, estimatedWeeks, order, ...rest } = data;
    return this.prisma.phase.update({
      where: { id },
      data: {
        ...rest,
        order: order !== undefined ? (order ? parseInt(order, 10) : 0) : undefined,
        startDate: startDate ? new Date(startDate) : (startDate === null ? null : undefined),
        endDate: endDate ? new Date(endDate) : (endDate === null ? null : undefined),
        estimatedWeeks: estimatedWeeks ? parseInt(estimatedWeeks, 10) : (estimatedWeeks === null ? null : undefined),
      },
    });
  }

  async deletePhase(id: string): Promise<Phase> {
    return this.prisma.phase.delete({
      where: { id },
    });
  }

  async addMilestone(programId: string, phaseId: string, data: any, scope: QueryScope) {
    const { dueDate, xpReward, order, ...rest } = data;
    return this.prisma.milestone.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        xpReward: xpReward ? parseInt(xpReward, 10) : 0,
        order: order ? parseInt(order, 10) : 0,
        programId,
        phaseId,
        tenantId: scope.tenantId!,
      },
    });
  }

  async updateMilestone(id: string, data: any) {
    const { dueDate, xpReward, order, ...rest } = data;
    return this.prisma.milestone.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : (dueDate === null ? null : undefined),
        xpReward: xpReward !== undefined ? (xpReward ? parseInt(xpReward, 10) : 0) : undefined,
        order: order !== undefined ? (order ? parseInt(order, 10) : 0) : undefined,
      },
    });
  }

  async deleteMilestone(id: string) {
    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  async enroll(programId: string, menteeId: string, scope: QueryScope) {
    return this.prisma.enrollment.create({
      data: {
        programId,
        menteeId,
        tenantId: scope.tenantId!,
      },
    });
  }

  async updateCoach(id: string, coachId: string, scope: QueryScope) {
    return this.prisma.program.update({
      where: this.applyScope({ id }, scope),
      data: { coachId },
    });
  }

  async findEnrollmentsByMentee(menteeId: string, scope: QueryScope) {
    return this.prisma.enrollment.findMany({
      where: {
        menteeId,
        tenantId: scope.tenantId!,
      },
    });
  }

  async togglePhaseCheckpoint(programId: string, phaseId: string, menteeId: string, date?: Date) {
    // Buscar si ya existe un milestone para esta fase
    let milestone = await this.prisma.milestone.findFirst({
      where: { phaseId, programId },
    });

    // Si no existe, auto-creamos uno usando los datos de la fase
    if (!milestone) {
      const phase = await this.prisma.phase.findUnique({ where: { id: phaseId } });
      const program = await this.prisma.program.findUnique({ where: { id: programId } });
      if (!phase || !program) throw new Error('Fase o programa no encontrado');

      milestone = await this.prisma.milestone.create({
        data: {
          title: phase.name || 'Completar fase',
          description: phase.description || null,
          order: 0,
          xpReward: 500,
          frequency: 'ONCE',
          daysOfWeek: [],
          requiredEvidence: 'NONE',
          isHabit: false,
          programId,
          phaseId,
          tenantId: program.tenantId,
        }
      });
    }

    // Delegamos al toggle existente
    return this.toggleMilestone(milestone.id, menteeId, date);
  }

  async toggleMilestone(milestoneId: string, menteeId: string, date?: Date) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone) {
      throw new Error('Hito no encontrado');
    }

    const frequency = milestone.frequency || 'ONCE';
    let targetDate = new Date(new Date(date || new Date()).setHours(0, 0, 0, 0));

    if (frequency === 'WEEKLY') {
      const startOfWeek = new Date(targetDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      targetDate = startOfWeek;
    }

    if (frequency === 'ONCE') {
      const existing = await this.prisma.milestoneCompletion.findFirst({
        where: { milestoneId, menteeId },
      });
      if (existing) {
        return this.prisma.milestoneCompletion.delete({
          where: { id: existing.id }
        });
      }
    } else {
      const existing = await this.prisma.milestoneCompletion.findUnique({
        where: {
          milestoneId_menteeId_date: { 
            milestoneId, 
            menteeId, 
            date: targetDate 
          }
        }
      });
      if (existing) {
        return this.prisma.milestoneCompletion.delete({
          where: { id: existing.id }
        });
      }
    }

    return this.prisma.milestoneCompletion.create({
      data: {
        milestoneId,
        menteeId,
        date: targetDate,
      }
    });
  }

  async clone(id: string, scope: QueryScope, menteeId?: string, options?: { objectiveId?: string; newObjective?: any }): Promise<Program> {
    const original = await this.prisma.program.findFirst({
      where: {
        id,
        OR: [
          { tenantId: scope.tenantId },
          { isPublic: true }
        ]
      },
      include: { 
        phases: {
          include: { milestones: true }
        }
      },
    });

    if (!original) throw new Error('Program not found');

    const { id: _, createdAt: __, updatedAt: ___, phases, enrollments, ...data } = original as any;

    return this.prisma.$transaction(async (tx) => {
      let resolvedObjectiveId = options?.objectiveId || null;

      // Si viene un objetivo nuevo para ser creado al vuelo
      if (options?.newObjective && options.newObjective.title) {
        const objective = await tx.objective.create({
          data: {
            title: options.newObjective.title,
            description: options.newObjective.description || null,
            targetDate: options.newObjective.targetDate ? new Date(options.newObjective.targetDate) : null,
            status: 'ACTIVE',
            menteeId: menteeId || scope.userId,
            tenantId: scope.tenantId!,
          }
        });
        resolvedObjectiveId = objective.id;
      }

      // 1. Crear el programa base
      const newProgram = await tx.program.create({
        data: {
          ...data,
          name: menteeId ? `${original.name}` : `${original.name} (Copia)`,
          isTemplate: menteeId ? false : true, // Si se le asigna a un estudiante, ya no es plantilla sino una instancia activa
          isPublic: false, // Las copias son privadas por defecto
          category: null,
          status: menteeId ? 'ACTIVE' : 'DRAFT', // Si se le asigna a un estudiante, se activa de una
          menteeId: menteeId || null,
          tenantId: scope.tenantId!,
          objectiveId: resolvedObjectiveId,
        }
      });

      // 2. Clonar fases e hitos secuencialmente
      if (phases && Array.isArray(phases)) {
        for (const phase of phases) {
          const { id: __, programId: ___, createdAt: ____, milestones, ...pData } = phase;
          
          const newPhase = await tx.phase.create({
            data: {
              ...pData,
              programId: newProgram.id,
            }
          });

          if (milestones && Array.isArray(milestones) && milestones.length > 0) {
            for (const milestone of milestones) {
              const { id: ___, programId: ____, phaseId: _____, createdAt: ______, updatedAt: _______, completions, ...mData } = milestone;
              
              await tx.milestone.create({
                data: {
                  ...mData,
                  programId: newProgram.id,
                  phaseId: newPhase.id,
                  tenantId: scope.tenantId!,
                }
              });
            }
          } else {
            // Si la fase no tiene hitos, auto-generamos uno usando el nombre de la fase
            await tx.milestone.create({
              data: {
                title: phase.name || 'Completar fase',
                description: phase.description || null,
                order: 0,
                xpReward: 500,
                frequency: 'ONCE',
                daysOfWeek: [],
                requiredEvidence: 'NONE',
                isHabit: false,
                programId: newProgram.id,
                phaseId: newPhase.id,
                tenantId: scope.tenantId!,
              }
            });
          }
        }
      }

      // 3. Devolver el programa completo
      return tx.program.findUnique({
        where: { id: newProgram.id },
        include: { 
          phases: { 
            include: { milestones: { include: { completions: true } } } 
          } 
        }
      }) as any;
    });
  }

  async findMarketplace(): Promise<Program[]> {
    return this.prisma.program.findMany({
      where: {
        isPublic: true,
        isTemplate: true,
        status: 'PUBLISHED'
      },
      include: {
        phases: {
          include: { milestones: true }
        }
      }
    });
  }
}
