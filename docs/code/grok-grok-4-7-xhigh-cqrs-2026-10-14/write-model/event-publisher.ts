import type { CartEvent } from "./cart-event";

export interface EventPublisher {
  publish(events: readonly CartEvent[]): void;
}
