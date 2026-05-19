import { Module } from '@nestjs/common';
import { GamificationController } from './infrastructure/controllers/gamification.controller';
import { KafkaConsumerService } from '../../infrastructure/kafka/kafka-consumer.service';
import { GamificationConsumer } from './infrastructure/consumers/gamification.consumer';
import { GamificationService } from './application/gamification.service';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [GamificationController],
  providers: [
    GamificationService, 
    PrismaService, 
    KafkaConsumerService,
    GamificationConsumer
  ],
  exports: [GamificationService],
})
export class GamificationModule {}

