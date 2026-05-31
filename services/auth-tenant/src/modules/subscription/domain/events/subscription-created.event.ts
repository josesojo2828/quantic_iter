import { DomainEvent } from '../../../../common/events/event-bus.interface';

export class SubscriptionCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string, // tenantId
    public readonly payload: {
      tenantId: string;
      planId: string;
      planSlug: string;
      maxCoaches: number;
      maxMentees: number;
      expiresAt: Date;
      status: string;
    },
  ) {
    super(aggregateId, 'subscription.created');
  }

  getPayload() {
    return this.payload;
  }
}
