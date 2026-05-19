import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SubscriptionCheckerService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    this.logger.log('🚀 Starting daily subscription expiration check...');
    
    const now = new Date();
    
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: now,
        },
      },
      include: {
        tenant: true,
      },
    });

    this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions.`);

    for (const sub of expiredSubscriptions) {
      try {
        this.logger.warn(`Subscription expired for: ${sub.tenant.slug}`);
        
        // Update DB status
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'PAST_DUE' },
        });

        // Emit Event to Kafka
        this.kafkaClient.emit('subscription.expired', {
          tenantId: sub.tenantId,
          slug: sub.tenant.slug,
          expiredAt: sub.expiresAt,
          action: 'STATUS_CHANGED_TO_PAST_DUE',
        });

        // Emit to Audit as well
        this.kafkaClient.emit('quantic.audit', {
          userId: 'SYSTEM_WORKER',
          tenantId: sub.tenantId,
          module: 'subscription-worker',
          action: 'SUBSCRIPTION_EXPIRED_AUTOMATIC_LOCK',
          payload: { subscriptionId: sub.id, status: 'PAST_DUE' },
        });

      } catch (err) {
        this.logger.error(`Error processing expiration for ${sub.tenantId}: ${err.message}`);
      }
    }

    this.logger.log('✅ Daily subscription check completed.');
  }
}
