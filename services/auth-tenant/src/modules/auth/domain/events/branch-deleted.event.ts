import { DomainEvent } from '../../../../common/events/event-bus.interface';

export class BranchDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly payload: {
      tenantId: string;
      deletedBy: string;
      branchName: string;
    },
  ) {
    super(aggregateId, 'branch.deleted');
  }

  getPayload() {
    return this.payload;
  }
}
