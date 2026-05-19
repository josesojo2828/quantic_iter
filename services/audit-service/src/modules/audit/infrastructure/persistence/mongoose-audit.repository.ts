import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IAuditRepository, AuditQuery } from '../../domain/audit.repository';
import { AuditLogEntity } from '../../domain/audit-log.entity';
import { AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class MongooseAuditRepository implements IAuditRepository {
  constructor(
    @InjectModel(AuditLogDocument.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async save(auditLog: AuditLogEntity): Promise<void> {
    const doc = new this.auditModel({
      userId: auditLog.userId,
      tenantId: auditLog.tenantId,
      action: auditLog.action,
      module: auditLog.module,
      payload: auditLog.payload,
      previousState: auditLog.previousState,
      timestamp: auditLog.timestamp,
    });
    await doc.save();
  }

  async search(query: AuditQuery): Promise<{ data: AuditLogEntity[]; total: number }> {
    const filters: any = {};
    if (query.tenantId) filters.tenantId = query.tenantId;
    if (query.userId) filters.userId = query.userId;
    if (query.module) filters.module = query.module;

    const skip = query.skip || 0;
    const take = query.take || 20;

    const [docs, total] = await Promise.all([
      this.auditModel
        .find(filters)
        .sort(query.orderBy ? { [query.orderBy]: -1 } : { timestamp: -1 })
        .skip(skip)
        .limit(take)
        .exec(),
      this.auditModel.countDocuments(filters).exec(),
    ]);

    const data = docs.map(doc => new AuditLogEntity({
      id: doc._id.toString(),
      userId: doc.userId,
      tenantId: doc.tenantId,
      action: doc.action,
      module: doc.module,
      payload: doc.payload,
      previousState: doc.previousState,
      timestamp: doc.timestamp,
    }));

    return { data, total };
  }
}
