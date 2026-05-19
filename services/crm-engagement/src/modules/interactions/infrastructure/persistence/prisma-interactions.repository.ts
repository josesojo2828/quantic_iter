import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import type { IInteractionsRepository } from '../../domain/interactions.repository';

@Injectable()
export class PrismaInteractionsRepository implements IInteractionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: string;
    contactId: string;
    type: string;
    content: string;
  }) {
    return this.prisma.interaction.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        type: data.type,
        content: data.content,
      },
    });
  }

  async findByContactId(contactId: string) {
    return this.prisma.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
