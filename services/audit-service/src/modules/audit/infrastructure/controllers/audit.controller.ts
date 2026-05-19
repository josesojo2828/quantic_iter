import { Controller, Get, Query, Logger, UseGuards, Req } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditService } from '../../application/audit.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';

@Controller()
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditService: AuditService) {}

  // --- KAFKA EVENT LISTENER ---
  @EventPattern('quantic.audit')
  @EventPattern('audit.log')
  async handleAuditLog(@Payload() message: any) {
    const rawData = message?.value || message; 
    
    const normalizedData = {
      userId: rawData.userId || rawData.payload?.userId,
      tenantId: rawData.tenantId || rawData.payload?.tenantId,
      action: rawData.action || rawData.type || 'UNKNOWN',
      module: rawData.module || 'system',
      payload: rawData.payload || rawData,
      previousState: rawData.previousState,
      timestamp: rawData.timestamp ? new Date(rawData.timestamp) : new Date(),
    };

    this.logger.log(`Received event -> [${normalizedData.module}] ${normalizedData.action}`);
    await this.auditService.logActivity(normalizedData);
  }

  // --- REST API FOR DASHBOARD ---
  @Get()
  @UseGuards(LocalAuthGuard)
  async getAuditLogs(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('module') moduleName?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const tenantId = req.user.tenantId;
    return this.auditService.searchAudits({
      tenantId, userId, module: moduleName, skip: Number(skip) || 0, take: Number(take) || 20
    });
  }
}
