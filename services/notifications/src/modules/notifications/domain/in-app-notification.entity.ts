export class InAppNotification {
  id: string;
  userId: string;
  tenantId?: string;
  title: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}
