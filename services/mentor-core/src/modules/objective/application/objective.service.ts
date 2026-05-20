import { Injectable } from '@nestjs/common';
import { ObjectiveRepository } from '../infrastructure/persistence/objective.repository';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class ObjectiveService {
  constructor(private readonly objectiveRepository: ObjectiveRepository) {}

  async getObjectives(scope: QueryScope) {
    return this.objectiveRepository.findAll(scope);
  }

  async getMenteeObjectives(menteeId: string, scope: QueryScope) {
    return this.objectiveRepository.findByMentee(menteeId, scope);
  }

  async createObjective(data: any, scope: QueryScope) {
    return this.objectiveRepository.create(data, scope);
  }
}
