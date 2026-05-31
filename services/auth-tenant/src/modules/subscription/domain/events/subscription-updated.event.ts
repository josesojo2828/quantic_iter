import { DomainEvent } from '../../../../common/events/event-bus.interface';

export class SubscriptionUpdatedEvent extends DomainEvent {
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
    super(aggregateId, 'subscription.updated');
  }

  getPayload() {
    return this.payload;
  }
}
