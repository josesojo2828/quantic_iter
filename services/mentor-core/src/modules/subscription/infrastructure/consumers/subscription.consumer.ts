import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { SubscriptionService } from '../../application/subscription.service';

@Injectable()
export class SubscriptionConsumer implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'mentor-core-subscription-consumer',
    brokers: [process.env.KAFKA_BROKERS || 'mentor_kafka:29092'],
  });

  private consumer: Consumer = this.kafka.consumer({
    groupId: 'mentor-core-subscription',
    allowAutoTopicCreation: true,
  });

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async onModuleInit() {
    try {
      // 1. Ensure the topic exists using Kafka Admin Client
      try {
        const admin = this.kafka.admin();
        await admin.connect();
        await admin.createTopics({
          topics: [{ topic: 'quantic.audit', numPartitions: 1 }],
        });
        await admin.disconnect();
        console.log('✅ Topic "quantic.audit" ensured via Kafka Admin');
      } catch (adminErr: any) {
        console.warn('⚠️ Kafka Admin failed to pre-create topic (might already exist):', adminErr.message);
      }

      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'quantic.audit', fromBeginning: false });

      this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const wrapper = JSON.parse(message.value?.toString() || '{}');
            const eventType = wrapper.type;
            const payload = wrapper.payload;

            if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
              console.log(`[SubscriptionConsumer] Sincronizando suscripción para tenant: ${payload.tenantId}`);
              await this.subscriptionService.syncSubscription({
                tenantId: payload.tenantId,
                planId: payload.planId,
                planSlug: payload.planSlug,
                maxCoaches: payload.maxCoaches,
                maxMentees: payload.maxMentees,
                expiresAt: new Date(payload.expiresAt),
                status: payload.status,
              });
            }
          } catch (error) {
            console.error('[SubscriptionConsumer] Error processing message:', error);
          }
        },
      }).catch((err) => {
        console.error('[SubscriptionConsumer] Kafka Consumer Run Error:', err);
      });
      console.log('✅ SubscriptionConsumer Kafka connected and subscribed to quantic.audit');
    } catch (err) {
      console.error('❌ SubscriptionConsumer failed to connect/subscribe to Kafka:', err);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
