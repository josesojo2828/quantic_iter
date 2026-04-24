export abstract class DomainEvent {
  public readonly timestamp: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;

  constructor(aggregateId: string, eventType: string) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.timestamp = new Date();
  }

  abstract getPayload(): any;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}
