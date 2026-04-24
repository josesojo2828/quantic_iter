import { DomainEvent } from '../../../../common/events/event-bus.interface';

export class InvitationAcceptedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly payload: {
      email: string;
      tenantId: string;
      roleId: string;
      branchId?: string;
      acceptedAt: Date;
    },
  ) {
    super(aggregateId, 'invitation.accepted');
  }

  getPayload() {
    return this.payload;
  }
}
