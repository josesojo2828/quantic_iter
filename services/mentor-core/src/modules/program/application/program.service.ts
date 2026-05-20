import { Injectable } from '@nestjs/common';
import { ProgramRepository } from '../infrastructure/persistence/program.repository';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class ProgramService {
  constructor(private readonly programRepository: ProgramRepository) {}

  async getPrograms(scope: QueryScope) {
    return this.programRepository.findAll(scope);
  }

  async getProgram(id: string, scope: QueryScope) {
    return this.programRepository.findOne(id, scope);
  }

  async createProgram(data: any, scope: QueryScope) {
    return this.programRepository.create(data, scope);
  }

  async addPhase(programId: string, phaseData: any) {
    return this.programRepository.addPhase(programId, phaseData);
  }

  async updatePhase(id: string, data: any) {
    return this.programRepository.updatePhase(id, data);
  }

  async deletePhase(id: string) {
    return this.programRepository.deletePhase(id);
  }

  async addMilestone(programId: string, phaseId: string, data: any, scope: QueryScope) {
    return this.programRepository.addMilestone(programId, phaseId, data, scope);
  }

  async updateMilestone(id: string, data: any) {
    return this.programRepository.updateMilestone(id, data);
  }

  async deleteMilestone(id: string) {
    return this.programRepository.deleteMilestone(id);
  }

  async enrollMentee(programId: string, menteeId: string, scope: QueryScope) {
    return this.programRepository.enroll(programId, menteeId, scope);
  }

  async assignCoach(id: string, coachId: string, scope: QueryScope) {
    return this.programRepository.updateCoach(id, coachId, scope);
  }

  async getMenteeEnrollments(menteeId: string, scope: QueryScope) {
    return this.programRepository.findEnrollmentsByMentee(menteeId, scope);
  }

  async assign(id: string, menteeId: string, scope: QueryScope, options?: { objectiveId?: string; newObjective?: any }) {
    return this.programRepository.clone(id, scope, menteeId, options);
  }

  async cloneProgram(id: string, scope: QueryScope) {
    return this.programRepository.clone(id, scope);
  }

  async toggleMilestone(programId: string, milestoneId: string, scope: QueryScope, date?: Date) {
    const program = await this.programRepository.findOne(programId, scope);
    if (!program || !program.menteeId) {
      throw new Error('Program not found or not assigned to a mentee');
    }
    return this.programRepository.toggleMilestone(milestoneId, program.menteeId, date);
  }

  async togglePhase(programId: string, phaseId: string, scope: QueryScope, date?: Date) {
    const program = await this.programRepository.findOne(programId, scope);
    if (!program || !program.menteeId) {
      throw new Error('Program not found or not assigned to a mentee');
    }
    return this.programRepository.togglePhaseCheckpoint(programId, phaseId, program.menteeId, date);
  }

  async getMarketplace() {
    return this.programRepository.findMarketplace();
  }
}
