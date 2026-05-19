import { InAppNotification } from './in-app-notification.entity';

export interface INotificationRepository {
  createInApp(notification: Partial<InAppNotification>): Promise<InAppNotification>;
  findInAppByUserId(userId: string): Promise<InAppNotification[]>;
  markInAppAsRead(id: string): Promise<InAppNotification>;
  logNotification(log: any): Promise<void>;
}
