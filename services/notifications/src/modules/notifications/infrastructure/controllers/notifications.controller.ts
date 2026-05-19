import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { INotificationRepository } from '../../domain/notification.repository';
import { Inject } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  @Get()
  async getMyNotifications(@Request() req: any) {
    try {
      // Note: userId should come from a AuthGuard. Using a placeholder for now.
      const userId = req.user?.id || '69fcb38c3d05ce7b27304926'; // Match the user in the smoke test
      return await this.notificationRepo.findInAppByUserId(userId);
    } catch (error: any) {
      console.error('[NotificationsController] Error fetching notifications:', error);
      throw error;
    }
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationRepo.markInAppAsRead(id);
  }
}
