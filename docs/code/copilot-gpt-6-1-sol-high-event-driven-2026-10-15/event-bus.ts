export type EventListener<Payload> = (payload: Payload) => void;

export class EventBus<Events extends object> {
  private readonly listeners: {
    [Event in keyof Events]?: Set<EventListener<Events[Event]>>;
  } = {};

  on<Event extends keyof Events>(
    event: Event,
    listener: EventListener<Events[Event]>,
  ): () => void {
    const listeners = (this.listeners[event] ??= new Set());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  // Dispatch is synchronous; handler errors propagate to the caller.
  emit<Event extends keyof Events>(
    event: Event,
    payload: Events[Event],
  ): void {
    const listeners = this.listeners[event];
    if (listeners) {
      for (const listener of [...listeners]) {
        listener(payload);
      }
    }
  }
}
