import { createEventBus, type EventBus } from "../bus/event-bus";
import { createCartProjection, subscribeCartProjection } from "../projection/cart-projection";
import { subscribeShowCart } from "../projection/show-cart";
import { subscribeCartProcess } from "../process/cart-process";
import { createEventStore, subscribeEventStore } from "../store/event-store";
import type {
  CartMessageOf,
  CartOutcome,
  CartRequest,
  DomainEvent,
  EventEnvelope,
  ShownCart,
} from "../events/cart-message";

export interface ShoppingCartProgram {
  request(event: CartRequest): void;
  subscribe<TType extends CartOutcome["type"]>(
    type: TType,
    handler: (envelope: EventEnvelope<CartMessageOf<TType>>) => void,
  ): () => void;
  readEvents(): readonly EventEnvelope<DomainEvent>[];
  view(): ShownCart;
}

export function createShoppingCartProgram(now: () => Date = () => new Date()): ShoppingCartProgram {
  const bus: EventBus = createEventBus(now);
  const store = createEventStore();
  const projection = createCartProjection();

  // Record and apply domain events before the process runs, so a nested publish
  // is stored and projected before the request that caused it returns.
  subscribeEventStore(bus, store);
  subscribeCartProjection(bus, projection);
  subscribeCartProcess(bus, store);
  subscribeShowCart(bus, projection);

  return {
    request(event) {
      bus.publish(event);
    },
    subscribe(type, handler) {
      return bus.subscribe(type, handler);
    },
    readEvents() {
      return store.read();
    },
    view() {
      return projection.current();
    },
  };
}
