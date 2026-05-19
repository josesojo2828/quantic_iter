export class NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'EMAIL' | 'APP' | 'SMS';
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}
