import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnnouncementService } from './application/announcement.service';
import { AnnouncementRepository } from './infrastructure/persistence/announcement.repository';
import { AnnouncementController } from './infrastructure/controllers/announcement.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka.constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'mentor-core-notifications',
            brokers: [process.env.KAFKA_BROKERS || 'mentor_kafka:29092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, AnnouncementRepository, PrismaService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
