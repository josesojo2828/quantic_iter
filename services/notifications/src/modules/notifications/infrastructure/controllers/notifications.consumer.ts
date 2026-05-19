import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendNotificationService, SendNotificationDto } from '../../application/send-notification.service';

@Controller()
export class NotificationsConsumer {
  constructor(private readonly sendNotificationService: SendNotificationService) {}

  @MessagePattern('notification.commands')
  async handleSendNotification(@Payload() message: any) {
    if (!message || !message.data) {
      console.warn('[NotificationsConsumer] Received invalid notification command payload:', message);
      return;
    }

    // Standardize payload extraction based on our contract
    const data: SendNotificationDto = message.data;
    const tenantId = message.tenantId;
    const userId = message.userId;

    await this.sendNotificationService.execute({
      ...data,
      tenantId,
      userId,
    });
  }
}
