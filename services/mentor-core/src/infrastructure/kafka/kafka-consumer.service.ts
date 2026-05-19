import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'mentor-core',
    brokers: [process.env.KAFKA_BROKERS || 'mentor_kafka:29092'],
  });

  private consumer: Consumer = this.kafka.consumer({ 
    groupId: 'mentor-core-gamification',
    allowAutoTopicCreation: true 
  });

  async onModuleInit() {
    await this.consumer.connect();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  getConsumer() {
    return this.consumer;
  }
}

