import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ITemplateRepository } from '../../domain/template-repository.interface';
import { NotificationTemplate } from '../../domain/notification-template.entity';

@Injectable()
export class PrismaTemplateRepository implements ITemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string, tenantId?: string): Promise<NotificationTemplate | null> {
    const where: any = { name };
    if (tenantId) {
      where.OR = [{ tenantId }, { tenantId: null }];
    } else {
      where.tenantId = null;
    }
    
    const template = await this.prisma.notificationTemplate.findFirst({
      where,
      orderBy: { tenantId: 'desc' },
    });
    return template as NotificationTemplate;
  }

  async create(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const created = await this.prisma.notificationTemplate.create({
      data: template as any,
    });
    return created as NotificationTemplate;
  }
}
