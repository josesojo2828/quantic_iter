import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceRepository } from '../infrastructure/persistence/resource.repository';
import { Resource } from '../domain/resource.entity';
import { QueryScope } from '../../../common/persistence/base.repository';
import { ProgramService } from '../../program/application/program.service';

@Injectable()
export class ResourceService {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly programService: ProgramService,
  ) {}

  async createResource(data: Partial<Resource>, scope: QueryScope): Promise<Resource> {
    return this.repository.create({
      ...data,
      tenantId: scope.tenantId,
      coachId: scope.userId,
    });
  }

  async getAllResources(scope: QueryScope): Promise<Resource[]> {
    return this.repository.findAll(scope);
  }

  async getMyLibrary(scope: QueryScope): Promise<Resource[]> {
    // Obtener programas donde el mentee está inscrito
    const enrollments = await this.programService.getMenteeEnrollments(scope.userId, scope);
    const programIds = enrollments.map(e => e.programId);

    return this.repository.findAvailableForMentee(scope.userId, programIds, scope);
  }

  async getResourceById(id: string, scope: QueryScope): Promise<Resource> {
    const resource = await this.repository.findById(id, scope);
    if (!resource) throw new NotFoundException('Recurso no encontrado');

    // Control de acceso para Mentees
    if (scope.role?.toUpperCase() === 'MENTEE') {
      const isPublic = resource.isPublic;
      const belongsToMyProgram = resource.programId && (await this.isMenteeEnrolled(scope.userId, resource.programId, scope));

      if (!isPublic && !belongsToMyProgram) {
        throw new NotFoundException('Recurso no encontrado o acceso denegado');
      }
    }

    return resource;
  }

  private async isMenteeEnrolled(menteeId: string, programId: string, scope: QueryScope): Promise<boolean> {
    const enrollments = await this.programService.getMenteeEnrollments(menteeId, scope);
    return enrollments.some(e => e.programId === programId);
  }

  async updateResource(id: string, data: Partial<Resource>, scope: QueryScope): Promise<Resource> {
    await this.getResourceById(id, scope);
    return this.repository.update(id, data, scope);
  }

  async deleteResource(id: string, scope: QueryScope): Promise<void> {
    await this.getResourceById(id, scope);
    await this.repository.delete(id, scope);
  }
}
