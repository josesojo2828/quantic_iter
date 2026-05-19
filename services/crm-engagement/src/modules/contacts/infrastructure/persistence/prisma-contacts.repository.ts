import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import { IContactsRepository } from '../../domain/contacts.repository';

@Injectable()
export class PrismaContactsRepository implements IContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.contact.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
      include: { interactions: true, events: true },
    });
  }

  async findByEmail(tenantId: string, email: string) {
    return this.prisma.contact.findUnique({
      where: {
        tenantId_email: { tenantId, email },
      },
    });
  }

  async findByPhone(tenantId: string, phone: string) {
    return this.prisma.contact.findUnique({
      where: {
        tenantId_phone: { tenantId, phone },
      },
    });
  }

  async findByGlobalId(tenantId: string, globalUserId: string) {
    return this.prisma.contact.findUnique({
      where: {
        tenantId_globalUserId: { tenantId, globalUserId },
      },
    });
  }

  async findAll(tenantId: string, filters?: any) {
    const { search, ids } = filters || {};
    
    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    } else if (ids) {
      const idsArray = Array.isArray(ids) 
        ? ids 
        : ids.split(',');
      where.id = { in: idsArray };
    }

    return this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDelete(id: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
