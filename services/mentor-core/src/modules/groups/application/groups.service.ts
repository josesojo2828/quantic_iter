import { Injectable } from '@nestjs/common';
import { GroupsRepository } from '../infrastructure/persistence/groups.repository';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class GroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async getGroups(scope: QueryScope) {
    return this.groupsRepository.findAll(scope);
  }

  async createGroup(data: any, scope: QueryScope) {
    return this.groupsRepository.create(data, scope);
  }

  async addMember(groupId: string, menteeId: string, scope: QueryScope) {
    const group = await this.groupsRepository.findOne(groupId, scope);
    if (!group) throw new Error('Grupo no encontrado');
    return this.groupsRepository.addMember(groupId, menteeId);
  }

  async getGroup(id: string, scope: QueryScope) {
    const group = await this.groupsRepository.findOne(id, scope);
    if (!group) throw new Error('Grupo no encontrado');
    return group;
  }

  async getMembers(groupId: string, scope: QueryScope) {
    await this.getGroup(groupId, scope); // Validate existence and scope
    return this.groupsRepository.getMembers(groupId);
  }

  async updateGroup(id: string, data: any, scope: QueryScope) {
    return this.groupsRepository.update(id, data, scope);
  }

  async deleteGroup(id: string, scope: QueryScope) {
    return this.groupsRepository.delete(id, scope);
  }

  async removeMember(groupId: string, menteeId: string, scope: QueryScope) {
    await this.getGroup(groupId, scope); // Validate existence and scope
    return this.groupsRepository.removeMember(groupId, menteeId);
  }

  async assignCoach(id: string, coachId: string, scope: QueryScope) {
    return this.groupsRepository.updateCoach(id, coachId, scope);
  }
}
