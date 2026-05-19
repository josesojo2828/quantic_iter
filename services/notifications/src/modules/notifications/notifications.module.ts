import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TemplateRendererService } from './application/template-renderer.service';
import { SendNotificationService } from './application/send-notification.service';
import { PrismaTemplateRepository } from './infrastructure/persistence/prisma-template.repository';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { NodemailerAdapter } from './infrastructure/providers/nodemailer.adapter';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';
import { NotificationsConsumer } from './infrastructure/controllers/notifications.consumer';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController, NotificationsConsumer],
  providers: [
    PrismaService,
    TemplateRendererService,
    SendNotificationService,
    {
      provide: 'ITemplateRepository',
      useClass: PrismaTemplateRepository,
    },
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'IMailProvider',
      useClass: NodemailerAdapter,
    },
  ],
  exports: [SendNotificationService],
})
export class NotificationsModule {}
