import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../../../../infrastructure/kafka/kafka-consumer.service';
import { GamificationService } from '../../application/gamification.service';

@Injectable()
export class GamificationConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly gamificationService: GamificationService,
  ) {}

  async onModuleInit() {
    const consumer = this.kafkaConsumer.getConsumer();
    await consumer.subscribe({ topics: ['habit.checkin', 'task.completed'], fromBeginning: false });

    // We don't await consumer.run because it blocks the application startup
    consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value?.toString() || '{}');
        const { userId, mentorId, metadata } = payload;

        if (topic === 'habit.checkin') {
          await this.gamificationService.awardXp(userId, mentorId, 10, 'HABIT_CHECKIN', metadata);
          await this.gamificationService.updateStreak(userId);
        }

        if (topic === 'task.completed') {
          const xp = metadata?.priority === 'high' ? 100 : 50;
          await this.gamificationService.awardXp(userId, mentorId, xp, 'TASK_COMPLETED', metadata);
        }
      },
    }).catch(err => {
      console.error('Kafka Consumer Error:', err);
    });
  }
}

