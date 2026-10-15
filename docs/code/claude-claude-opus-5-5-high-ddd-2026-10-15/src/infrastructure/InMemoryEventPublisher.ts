import type { EventPublisher } from "../application/EventPublisher";
import type { DomainEvent } from "../domain/shared/DomainEvent";

export type EventHandler = (event: DomainEvent) => void | Promise<void>;

/** Delivers events synchronously to handlers registered in the same process. */
export class InMemoryEventPublisher implements EventPublisher {
  private readonly handlers: EventHandler[] = [];

  subscribe(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const handler of this.handlers) {
        await handler(event);
      }
    }
  }
}
