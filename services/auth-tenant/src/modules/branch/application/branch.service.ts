import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IBranchRepository, BranchQuery, CreateBranchDto, UpdateBranchDto } from '../domain/branch.repository';
import { SubscriptionService } from '../../subscription/application/subscription.service';
import { ClientKafka } from '@nestjs/microservices';
import { AuditAction, AuditPayload } from '@mentor/shared';

@Injectable()
export class BranchService {
  constructor(
    @Inject('IBranchRepository')
    private readonly repository: IBranchRepository,
    private readonly subscriptionService: SubscriptionService,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka,
  ) {}

  private emitAudit(data: Omit<AuditPayload, 'timestamp'>) {
    this.auditClient.emit('quantic.audit', { ...data, timestamp: new Date() });
  }

  async findAll(tenantId: string, query: BranchQuery) {
    return this.repository.findAll(tenantId, query);
  }

  async findOne(id: string, tenantId: string) {
    const branch = await this.repository.findById(id, tenantId);
    if (!branch) throw new NotFoundException('Sucursal no encontrada');
    return branch;
  }

  async create(tenantId: string, userId: string, dto: CreateBranchDto) {
    // EL CERROJO: Validar límites de suscripción
    await this.subscriptionService.checkBranchLimit(tenantId);
    
    const branch = await this.repository.create(tenantId, dto);
    
    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.CREATE,
      module: 'branch',
      payload: dto
    });
    
    return branch;
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateBranchDto) {
    const current = await this.findOne(id, tenantId);
    const updated = await this.repository.update(id, tenantId, dto);
    
    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.UPDATE_FULL,
      module: 'branch',
      payload: dto,
      previousState: current,
    });
    
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    const current = await this.findOne(id, tenantId);
    
    // Strict Validation: Branch cannot be deleted if there are staff assigned
    const staffCount = await this.repository.countStaff(id, tenantId);
    if (staffCount > 0) {
      throw new BadRequestException(`No se puede eliminar la sucursal porque tiene ${staffCount} empleado(s) asignado(s).`);
    }

    await this.repository.softDelete(id, tenantId);
    
    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.DELETE,
      module: 'branch',
      payload: { id },
      previousState: current,
    });
    
    return { success: true };
  }
}
