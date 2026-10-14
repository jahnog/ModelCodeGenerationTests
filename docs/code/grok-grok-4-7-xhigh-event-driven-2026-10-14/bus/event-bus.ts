import type { CartMessage, CartMessageOf, EventEnvelope } from "../events/cart-message";

type AnyHandler = (envelope: EventEnvelope) => void;

export interface EventBus {
  publish(event: CartMessage): EventEnvelope;
  subscribe<TType extends CartMessage["type"]>(
    type: TType,
    handler: (envelope: EventEnvelope<CartMessageOf<TType>>) => void,
  ): () => void;
}

export function createEventBus(now: () => Date = () => new Date()): EventBus {
  let sequence = 0;
  const handlers = new Map<CartMessage["type"], Set<AnyHandler>>();

  const publish = (event: CartMessage): EventEnvelope => {
    sequence += 1;
    const envelope: EventEnvelope = {
      sequence,
      occurredAt: now().toISOString(),
      event,
    };
    const subscribed = handlers.get(event.type);
    if (subscribed !== undefined) {
      // Copy so a handler can subscribe or unsubscribe without changing this delivery.
      // Publish is synchronous: nested events finish before this call returns.
      for (const handler of [...subscribed]) {
        handler(envelope);
      }
    }
    return envelope;
  };

  const subscribe = <TType extends CartMessage["type"]>(
    type: TType,
    handler: (envelope: EventEnvelope<CartMessageOf<TType>>) => void,
  ): (() => void) => {
    let subscribed = handlers.get(type);
    if (subscribed === undefined) {
      subscribed = new Set();
      handlers.set(type, subscribed);
    }
    const bucket = subscribed;
    const wrapped: AnyHandler = (envelope) => {
      handler(envelope as EventEnvelope<CartMessageOf<TType>>);
    };
    bucket.add(wrapped);
    return () => {
      bucket.delete(wrapped);
    };
  };

  return { publish, subscribe };
}
