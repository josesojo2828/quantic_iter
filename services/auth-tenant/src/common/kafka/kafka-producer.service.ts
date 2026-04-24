import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Partitioners } from 'kafkajs';
import { DomainEvent, IEventBus } from '../events/event-bus.interface';

@Injectable()
export class KafkaProducerService implements IEventBus, OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    this.kafka = new Kafka({
      clientId: 'auth-tenant-service',
      brokers,
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('✅ Kafka Producer connected');
    } catch (err) {
      this.logger.error('❌ Failed to connect to Kafka', err);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(event: DomainEvent): Promise<void> {
    try {
      const topic = 'quantic.audit';
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.aggregateId,
            value: JSON.stringify({
              type: event.eventType,
              timestamp: event.timestamp,
              payload: event.getPayload(),
            }),
          },
        ],
      });
      this.logger.debug(`Event ${event.eventType} published to Kafka`);
    } catch (err) {
      this.logger.error(`Failed to publish event ${event.eventType}`, err);
    }
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }
}
