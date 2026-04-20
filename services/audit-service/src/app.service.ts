import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { type AuditPayload } from '@workshop/shared';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async logActivity(data: AuditPayload): Promise<void> {
    const log = new this.auditLogModel(data);
    await log.save();
    console.log(`[Audit] Logged action: ${data.action} on module: ${data.module}`);
  }
}
