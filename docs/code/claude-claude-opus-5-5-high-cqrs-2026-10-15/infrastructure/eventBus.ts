import type { CartEvent } from "../domain/events";

export type EventListener = (event: CartEvent) => void;

// In-memory publish/subscribe channel between the write side and the read side.
export class EventBus {
  private readonly listeners: EventListener[] = [];

  subscribe(listener: EventListener): void {
    this.listeners.push(listener);
  }

  publish(events: readonly CartEvent[]): void {
    for (const event of events) {
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }
}
