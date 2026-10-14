import type { EventBus } from "../bus/event-bus";
import type { DomainEvent, EventEnvelope } from "../events/cart-message";

export interface EventStore {
  append(envelope: EventEnvelope<DomainEvent>): void;
  read(): readonly EventEnvelope<DomainEvent>[];
}

export function createEventStore(): EventStore {
  const records: EventEnvelope<DomainEvent>[] = [];
  return {
    append(envelope) {
      records.push(envelope);
    },
    read() {
      return [...records];
    },
  };
}

export function subscribeEventStore(bus: EventBus, store: EventStore): () => void {
  const record = (envelope: EventEnvelope<DomainEvent>): void => {
    store.append(envelope);
  };
  const stopAdded = bus.subscribe("ItemAddedToCart", record);
  const stopRemoved = bus.subscribe("ItemRemovedFromCart", record);
  return () => {
    stopAdded();
    stopRemoved();
  };
}
