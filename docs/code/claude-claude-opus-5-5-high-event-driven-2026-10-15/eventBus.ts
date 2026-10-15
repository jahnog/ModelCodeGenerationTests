export type Handler<P> = (payload: P) => void;
export type Unsubscribe = () => void;

type HandlerTable<M> = { [K in keyof M]?: Set<Handler<M[K]>> };

/**
 * A synchronous, typed publish/subscribe bus.
 *
 * Events are delivered in the order they are published. An event published
 * from inside a handler waits until the current event has reached all of its
 * handlers, so handlers never see events out of order.
 */
export class EventBus<M extends object> {
  private readonly handlers: HandlerTable<M> = {};
  private readonly queue: Array<() => void> = [];
  private draining = false;

  on<K extends keyof M>(name: K, handler: Handler<M[K]>): Unsubscribe {
    let set = this.handlers[name];
    if (set === undefined) {
      set = new Set<Handler<M[K]>>();
      this.handlers[name] = set;
    }
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }

  emit<K extends keyof M>(name: K, payload: M[K]): void {
    this.queue.push(() => this.deliver(name, payload));
    if (this.draining) {
      return;
    }
    this.draining = true;
    try {
      let next = this.queue.shift();
      while (next !== undefined) {
        next();
        next = this.queue.shift();
      }
    } finally {
      this.draining = false;
      this.queue.length = 0;
    }
  }

  private deliver<K extends keyof M>(name: K, payload: M[K]): void {
    const set = this.handlers[name];
    if (set === undefined) {
      return;
    }
    // Copy so a handler that unsubscribes does not disturb this delivery.
    for (const handler of [...set]) {
      handler(payload);
    }
  }
}
