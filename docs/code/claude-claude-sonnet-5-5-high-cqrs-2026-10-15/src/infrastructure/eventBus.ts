import type { CartEvent } from "../domain/events";

export type EventListener = (event: CartEvent) => void;

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
