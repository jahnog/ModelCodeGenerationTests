import { type DomainEvent } from "../../domain/event/domain-event";
import { type DomainEventPublisher } from "../../domain/event/domain-event-publisher";

export class RecordingDomainEventPublisher implements DomainEventPublisher {
  readonly #events: DomainEvent[] = [];

  publishAll(events: readonly DomainEvent[]): void {
    for (const event of events) {
      this.#events.push(event);
    }
  }

  recorded(): readonly DomainEvent[] {
    return [...this.#events];
  }
}
