import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IContactsRepository } from '../domain/contacts.repository';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @Inject('IContactsRepository')
    private readonly contactsRepository: IContactsRepository,
  ) {}

  async createFromUser(data: { id: string, email: string, firstName: string, lastName: string, tenantId: string, avatarUrl?: string, phone?: string }) {
    this.logger.log(`Creating contact from user event: ${data.email} for tenant ${data.tenantId}`);
    
    // Priority: check if there's already a linked global Identity
    const existing = await this.contactsRepository.findByGlobalId(data.tenantId, data.id);
    if (existing) {
      this.logger.warn(`Contact with globalId ${data.id} already exists for tenant ${data.tenantId}.`);
      return existing;
    }

    return this.contactsRepository.create({
      tenantId: data.tenantId,
      globalUserId: data.id,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      tags: ['system_registered']
    });
  }

  async create(tenantId: string, dto: any) {
    return this.contactsRepository.create({
      ...dto,
      tenantId,
    });
  }

  async findAll(tenantId: string, filters?: any) {
    return this.contactsRepository.findAll(tenantId, filters);
  }

  async findByGlobalId(tenantId: string, globalUserId: string) {
    return this.contactsRepository.findByGlobalId(tenantId, globalUserId);
  }

  async findOne(id: string) {
    return this.contactsRepository.findById(id);
  }

  async update(id: string, dto: any) {
    return this.contactsRepository.update(id, dto);
  }

  async remove(id: string) {
    return this.contactsRepository.softDelete(id);
  }
}
