import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogDocument, AuditLogSchema } from './infrastructure/persistence/schemas/audit-log.schema';
import { MongooseAuditRepository } from './infrastructure/persistence/mongoose-audit.repository';
import { AuditService } from './application/audit.service';
import { AuditController } from './infrastructure/controllers/audit.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLogDocument.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      provide: 'IAuditRepository',
      useClass: MongooseAuditRepository,
    },
  ],
})
export class AuditModule {}
