import { DomainEvent } from '../../../../common/events/event-bus.interface';

export class UserRoleChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly payload: {
      tenantId: string;
      userId: string;
      newRoles: string[];
      changedBy: string;
    },
  ) {
    super(aggregateId, 'user.roles_changed');
  }

  getPayload() {
    return this.payload;
  }
}
