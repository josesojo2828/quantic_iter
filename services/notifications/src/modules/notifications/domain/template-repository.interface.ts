import { NotificationTemplate } from './notification-template.entity';

export interface ITemplateRepository {
  findByName(name: string, tenantId?: string): Promise<NotificationTemplate | null>;
  create(template: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
}
