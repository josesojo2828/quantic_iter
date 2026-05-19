import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DocumentService, CreateDocumentDto } from '../../application/document.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';

@Controller('documents')
@UseGuards(LocalAuthGuard)
export class FinanceController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateDocumentDto) {
    const tenantId = req.user.tenantId;
    return this.documentService.create({ ...dto, tenantId });
  }

  @Get('tenant/:tenantId')
  async getByTenant(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.documentService.getByTenant(tenantId);
  }
}
