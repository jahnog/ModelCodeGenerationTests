import { type DomainEvent } from "./domain-event";

export interface DomainEventPublisher {
  publishAll(events: readonly DomainEvent[]): void;
}
