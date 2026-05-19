import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IAuditRepository, AuditQuery } from '../domain/audit.repository';
import { AuditLogEntity } from '../domain/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject('IAuditRepository') private readonly repository: IAuditRepository,
  ) {}

  async logActivity(data: any): Promise<void> {
    try {
      // Create pure entity to validate defaults
      const entity = new AuditLogEntity({
        userId: data.userId,
        tenantId: data.tenantId,
        action: data.action,
        module: data.module,
        payload: data.payload,
        previousState: data.previousState,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      });

      await this.repository.save(entity);
      this.logger.debug(`[Audit Saved] Action: ${entity.action} | Module: ${entity.module} | Tenant: ${entity.tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to save audit log: ${error.message}`, error.stack);
    }
  }

  async searchAudits(query: AuditQuery) {
    return this.repository.search(query);
  }
}
