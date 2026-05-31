import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'crm-engagement',
      brokers: (this.configService.get('KAFKA_BROKERS', 'localhost:9092')).split(','),
    });
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
  }

  async onModuleInit() {
    const admin = this.kafka.admin();
    try {
      await admin.connect();
      await admin.createTopics({
        topics: [
          { topic: 'auth.user_created', numPartitions: 1 },
          { topic: 'auth.user_updated', numPartitions: 1 },
        ],
      });
      console.log('✅ CRM required topics ensured via Kafka Admin');
    } catch (e) {
      console.error('⚠️ CRM error ensuring topics:', e.message);
    } finally {
      await admin.disconnect();
    }

    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit(topic: string, data: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }],
    });
  }
}
