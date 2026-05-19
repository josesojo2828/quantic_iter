import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { InteractionsService } from '../../application/interactions.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';

@Controller('interactions')
@UseGuards(LocalAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: { contactId: string; type: string; content: string }) {
    const tenantId = req.user.tenantId;
    return this.interactionsService.create({ ...dto, tenantId });
  }

  @Get('contact/:id')
  async findByContact(@Param('id') contactId: string) {
    return this.interactionsService.findByContact(contactId);
  }
}
