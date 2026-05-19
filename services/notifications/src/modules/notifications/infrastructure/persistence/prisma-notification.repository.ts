import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { INotificationRepository } from '../../domain/notification.repository';
import { InAppNotification } from '../../domain/in-app-notification.entity';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createInApp(notification: Partial<InAppNotification>): Promise<InAppNotification> {
    const created = await this.prisma.inAppNotification.create({
      data: notification as any,
    });
    return created as InAppNotification;
  }

  async findInAppByUserId(userId: string): Promise<InAppNotification[]> {
    const notifications = await this.prisma.inAppNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications as InAppNotification[];
  }

  async markInAppAsRead(id: string): Promise<InAppNotification> {
    const updated = await this.prisma.inAppNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return updated as InAppNotification;
  }

  async logNotification(log: any): Promise<void> {
    await this.prisma.notificationLog.create({
      data: log,
    });
  }
}
