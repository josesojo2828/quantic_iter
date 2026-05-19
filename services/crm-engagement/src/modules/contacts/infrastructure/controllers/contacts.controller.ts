import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ContactsService } from '../../application/contacts.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // Kafka Event Handlers
  @EventPattern('auth.user_created')
  async handleUserCreated(@Payload() data: any) {
    console.log('[CRM] Received user.created event:', data);
    await this.contactsService.createFromUser(data);
  }

  @EventPattern('auth.user_updated')
  async handleUserUpdated(@Payload() data: any) {
    console.log('[CRM] Received user.updated event:', data);
    const existing = await this.contactsService.findByGlobalId(data.tenantId, data.id);
    if (existing) {
      await this.contactsService.update(existing.id, {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        avatarUrl: data.avatarUrl,
      });
    }
  }

  // REST API
  @Post()
  @UseGuards(LocalAuthGuard)
  async create(@Req() req: any, @Body() dto: any) {
    const tenantId = req.user.tenantId;
    return this.contactsService.create(tenantId, dto);
  }

  @Get()
  @UseGuards(LocalAuthGuard)
  async findAll(@Req() req: any, @Query() filters: any) {
    const tenantId = req.user.tenantId;
    return this.contactsService.findAll(tenantId, filters);
  }

  @Get(':id')
  @UseGuards(LocalAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(LocalAuthGuard)
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(LocalAuthGuard)
  async remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
