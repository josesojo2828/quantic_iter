import { Injectable, Inject } from '@nestjs/common';
import type { IInteractionsRepository } from '../domain/interactions.repository';
import { AuditAction } from '@mentor/shared';

@Injectable()
export class InteractionsService {
  constructor(
    @Inject('IInteractionsRepository')
    private readonly repository: IInteractionsRepository,
    @Inject('IEventBus')
    private readonly eventBus: { emit: (topic: string, data: any) => Promise<void> }
  ) {}

  async create(data: { tenantId: string; contactId: string; type: string; content: string }) {
    const interaction = await this.repository.create(data);
    
    await this.emitAudit(data.tenantId, 'system', AuditAction.CREATE, 'crm.interaction', interaction);
    
    return interaction;
  }

  async findByContact(contactId: string) {
    return this.repository.findByContactId(contactId);
  }

  private async emitAudit(tenantId: string, userId: string, action: AuditAction, module: string, payload: any) {
    try {
      await this.eventBus.emit('audit-log', {
        tenantId,
        userId,
        action,
        module,
        payload,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to emit audit log:', error);
    }
  }
}
