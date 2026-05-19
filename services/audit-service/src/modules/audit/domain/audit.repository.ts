import type { AuditLogEntity } from './audit-log.entity';

export interface AuditQuery {
  tenantId?: string;
  userId?: string;
  module?: string;
  skip?: number;
  take?: number;
  orderBy?: string;
}

export interface IAuditRepository {
  save(auditLog: AuditLogEntity): Promise<void>;
  search(query: AuditQuery): Promise<{ data: AuditLogEntity[], total: number }>;
}
