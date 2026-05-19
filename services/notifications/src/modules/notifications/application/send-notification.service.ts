import { Injectable, Inject } from '@nestjs/common';
import { ITemplateRepository } from '../domain/template-repository.interface';
import { INotificationRepository } from '../domain/notification.repository';
import { IMailProvider } from '../domain/mail-provider.interface';
import { TemplateRendererService } from './template-renderer.service';

export interface SendNotificationDto {
  templateName: string;
  recipient: string;
  context: any;
  channels: string[];
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class SendNotificationService {
  constructor(
    @Inject('ITemplateRepository') private readonly templateRepo: ITemplateRepository,
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
    @Inject('IMailProvider') private readonly mailProvider: IMailProvider,
    private readonly renderer: TemplateRendererService,
  ) {}

  async execute(dto: SendNotificationDto): Promise<void> {
    const template = await this.templateRepo.findByName(dto.templateName, dto.tenantId);
    
    if (!template) {
      throw new Error(`Template ${dto.templateName} not found`);
    }

    const renderedBody = this.renderer.render(template.content, dto.context);
    const renderedSubject = this.renderer.render(template.subject, dto.context);

    const logs: any = {
      templateId: template.id,
      recipient: dto.recipient,
      context: dto.context,
      channels: dto.channels,
      status: 'SENT',
    };

    try {
      if (dto.channels.includes('EMAIL')) {
        await this.mailProvider.sendMail(dto.recipient, renderedSubject, renderedBody);
      }

      if (dto.channels.includes('APP') && dto.userId) {
        await this.notificationRepo.createInApp({
          userId: dto.userId,
          tenantId: dto.tenantId,
          title: renderedSubject,
          message: renderedBody,
        });
      }
      
      await this.notificationRepo.logNotification({ ...logs, status: 'SENT' });
    } catch (error) {
      await this.notificationRepo.logNotification({ 
        ...logs, 
        recipient: logs.recipient || 'unknown',
        channels: logs.channels || [],
        status: 'FAILED', 
        errorMessage: error.message 
      });
      throw error;
    }
  }
}
