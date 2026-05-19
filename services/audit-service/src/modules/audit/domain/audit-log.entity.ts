export class AuditLogEntity {
  id?: string;
  userId: string;
  tenantId: string;
  action: string;
  module: string;
  payload: any;
  previousState?: any;
  timestamp?: Date;

  constructor(partial: Partial<AuditLogEntity>) {
    Object.assign(this, partial);
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
  }
}
