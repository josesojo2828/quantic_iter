import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { BranchRepository, BranchData, Branch } from '../domain/branch.repository';
import { SubscriptionService } from '../../subscription/application/subscription.service';

import { type IEventBus } from '../../../common/events/event-bus.interface';
import { BranchDeletedEvent } from '../domain/events/branch-deleted.event';



@Injectable()
export class BranchService {
  constructor(
    @Inject('BranchRepository')
    private readonly branchRepository: BranchRepository,
    private readonly subscriptionService: SubscriptionService,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
  ) {}



  private async validateEnterprisePlan(tenantId: string) {
    const subStatus = await this.subscriptionService.getSubscriptionStatus(tenantId);
    if (!subStatus || !subStatus.plan?.config?.multiBranch) {
      throw new ForbiddenException('Este módulo requiere un plan Enterprise con soporte multi-sucursal.');
    }
  }

  async create(tenantId: string, userId: string, data: BranchData): Promise<Branch> {
    await this.subscriptionService.checkBranchLimit(tenantId);
    const branch = await this.branchRepository.create(tenantId, data);
    


    return branch;
  }

  async findAll(tenantId: string, branchId?: string): Promise<Branch[]> {
    await this.subscriptionService.validateSubscription(tenantId);
    return this.branchRepository.findAll(tenantId, branchId);
  }

  async findById(tenantId: string, id: string, userBranchId?: string): Promise<Branch> {
    // Si el usuario está restringido a una sucursal, no puede ver otra
    if (userBranchId && id !== userBranchId) {
      throw new ForbiddenException('No tienes acceso a esta sucursal');
    }

    const branch = await this.branchRepository.findById(id);
    
    if (!branch || branch.tenantId !== tenantId) {
      throw new NotFoundException('Sucursal no encontrada');
    }
    
    return branch;
  }

  async update(tenantId: string, userId: string, id: string, data: Partial<BranchData>, userBranchId?: string): Promise<Branch> {
    await this.findById(tenantId, id, userBranchId); // Validation
    const updated = await this.branchRepository.update(id, data);
    


    return updated;
  }

  async delete(tenantId: string, userId: string, id: string, userBranchId?: string): Promise<void> {
    const branch = await this.findById(tenantId, id, userBranchId); // Validation
    await this.branchRepository.delete(id);
    
    await this.eventBus.publish(new BranchDeletedEvent(id, {
      tenantId,
      deletedBy: userId,
      branchName: branch.name,
    }));
  }
}
