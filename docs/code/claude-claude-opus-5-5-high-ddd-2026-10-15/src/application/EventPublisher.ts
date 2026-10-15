import type { DomainEvent } from "../domain/shared/DomainEvent";

/** Port for handing domain events to whoever listens for them. */
export interface EventPublisher {
  publish(events: readonly DomainEvent[]): Promise<void>;
}
