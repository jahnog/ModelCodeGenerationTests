export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly quantity: number;
}

export interface NewItem {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly quantity: number;
}

/** Every event in the system, keyed by its type name. */
export interface EventMap {
  // Requests (what a user or UI wants to happen)
  AddItemRequested: { readonly item: NewItem };
  RemoveItemRequested: { readonly itemId: string };
  ShowCartRequested: Record<string, never>;

  // Facts (what happened as a result)
  ItemAdded: { readonly item: CartItem };
  ItemAddRejected: { readonly itemId: string; readonly reason: string };
  ItemRemoved: { readonly item: CartItem };
  ItemRemoveRejected: { readonly itemId: string; readonly reason: string };
  CartContentsReady: {
    readonly items: readonly CartItem[];
    readonly totalCents: number;
  };
}

export type EventName = keyof EventMap;
export type Handler<K extends EventName> = (payload: EventMap[K]) => void;

export class EventBus {
  private readonly handlers: { [K in EventName]?: Handler<K>[] } = {};
  private readonly queue: (() => void)[] = [];
  private draining = false;

  subscribe<K extends EventName>(name: K, handler: Handler<K>): () => void {
    const list = (this.handlers[name] ??= []) as Handler<K>[];
    list.push(handler);
    return () => {
      const index = list.indexOf(handler);
      if (index >= 0) list.splice(index, 1);
    };
  }

  /**
   * Publishes an event. Events published from inside a handler are queued
   * and delivered after the current event, in order, so handlers never nest.
   */
  publish<K extends EventName>(name: K, payload: EventMap[K]): void {
    this.queue.push(() => {
      const list = (this.handlers[name] ?? []) as Handler<K>[];
      for (const handler of [...list]) handler(payload);
    });
    if (this.draining) return;
    this.draining = true;
    try {
      let next = this.queue.shift();
      while (next) {
        next();
        next = this.queue.shift();
      }
    } finally {
      this.draining = false;
      this.queue.length = 0;
    }
  }
}
