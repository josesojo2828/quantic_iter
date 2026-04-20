import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IStaffRepository } from '../domain/staff.repository';
import {
  StaffQuery,
  CreateStaffDto,
  UpdateStaffDto,
  UpdateFieldDto,
} from '../domain/staff.repository';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { AuditAction, AuditPayload } from '@workshop/shared';

@Injectable()
export class StaffService {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka,
  ) { }

  private emitAudit(data: Omit<AuditPayload, 'timestamp'>) {
    this.auditClient.emit('audit.log', { ...data, timestamp: new Date() });
  }

  async findAll(tenantId: string, query: StaffQuery) {
    const { items, total } = await this.staffRepository.findAll(
      tenantId,
      query,
    );
    return {
      items,
      total,
      skip: query.skip || 0,
      take: query.take || 10,
    };
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.staffRepository.findById(id, tenantId);
    if (!user) throw new NotFoundException('Empleado no encontrado');
    return user;
  }

  async create(tenantId: string, userId: string, dto: CreateStaffDto) {
    const password = await bcrypt.hash(dto.password || 'workshop123', 10);
    const newUser = await this.staffRepository.create({
      ...dto,
      tenantId,
      password,
      roleSlug: dto.roleSlug || 'mechanic',
    });

    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.CREATE,
      module: 'staff',
      payload: dto,
    });
    return newUser;
  }

  async updateGroup(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateStaffDto,
  ) {
    const current = await this.findOne(id, tenantId);
    const updated = await this.staffRepository.update(id, dto);

    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.UPDATE_FULL,
      module: 'staff',
      payload: dto,
      previousState: current,
    });
    return updated;
  }

  async updateField(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateFieldDto,
  ) {
    const current = await this.findOne(id, tenantId);
    const updated = await this.staffRepository.update(id, {
      [dto.field]: dto.value,
    } as UpdateStaffDto);

    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.UPDATE_PARTIAL,
      module: 'staff',
      payload: dto,
      previousState: current,
    });
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    const current = await this.findOne(id, tenantId);
    await this.staffRepository.softDelete(id);

    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.DELETE,
      module: 'staff',
      payload: { id },
      previousState: current,
    });
    return { success: true };
  }
}
