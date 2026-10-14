import type { EventBus } from "../bus/event-bus";
import { applyDomainEvent, emptyCartState, toShownCart, type CartState } from "../cart/cart-state";
import type { DomainEvent, EventEnvelope, ShownCart } from "../events/cart-message";

export interface CartProjection {
  apply(event: DomainEvent): void;
  current(): ShownCart;
}

export function createCartProjection(): CartProjection {
  let state: CartState = emptyCartState();
  return {
    apply(event) {
      state = applyDomainEvent(state, event);
    },
    current() {
      return toShownCart(state);
    },
  };
}

export function subscribeCartProjection(bus: EventBus, projection: CartProjection): () => void {
  const apply = (envelope: EventEnvelope<DomainEvent>): void => {
    projection.apply(envelope.event);
  };
  const stopAdded = bus.subscribe("ItemAddedToCart", apply);
  const stopRemoved = bus.subscribe("ItemRemovedFromCart", apply);
  return () => {
    stopAdded();
    stopRemoved();
  };
}
