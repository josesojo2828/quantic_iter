import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AnnouncementRepository } from '../infrastructure/persistence/announcement.repository';
import { Announcement } from '../domain/announcement.entity';
import { QueryScope } from '../../../common/persistence/base.repository';
import { KAFKA_TOPICS, KAFKA_EVENTS } from '../../../common/constants/kafka.constants';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly repository: AnnouncementRepository,
    @Inject('NOTIFICATIONS_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const announcement = await this.repository.create(data);
    
    // Emit event to Kafka for Micro #5
    this.kafkaClient.emit(KAFKA_TOPICS.NOTIFICATIONS, {
      event: KAFKA_EVENTS.ANNOUNCEMENT_CREATED,
      data: {
        id: announcement.id,
        tenantId: announcement.tenantId,
        title: announcement.title,
        type: announcement.type,
        programId: announcement.programId,
        groupId: announcement.groupId,
      },
    });

    return announcement;
  }

  async markAsRead(announcementId: string, menteeId: string, scope: QueryScope): Promise<void> {
    const announcement = await this.repository.findById(announcementId, scope);
    if (!announcement) {
      throw new Error('Announcement not found or access denied');
    }
    await this.repository.markAsRead(announcementId, menteeId);
  }

  async getStats(announcementId: string, scope: QueryScope): Promise<any> {
    return this.repository.getStats(announcementId, scope);
  }

  async getAnnouncements(scope: QueryScope): Promise<any[]> {
    return this.repository.findAll(scope, scope.userId);
  }

  async getAnnouncementsByProgram(programId: string, scope: QueryScope): Promise<any[]> {
    return this.repository.findByProgram(programId, scope, scope.userId);
  }

  async getAnnouncementsByGroup(groupId: string, scope: QueryScope): Promise<any[]> {
    return this.repository.findByGroup(groupId, scope, scope.userId);
  }

  async deleteAnnouncement(id: string, scope: QueryScope): Promise<void> {
    return this.repository.delete(id, scope);
  }
}
