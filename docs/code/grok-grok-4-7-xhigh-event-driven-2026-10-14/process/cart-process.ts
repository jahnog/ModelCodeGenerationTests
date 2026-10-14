import type { EventBus } from "../bus/event-bus";
import { foldCart } from "../cart/cart-state";
import { decideAdd, decideRemove } from "../cart/decide-cart";
import type { EventStore } from "../store/event-store";

export function subscribeCartProcess(bus: EventBus, store: EventStore): () => void {
  const stopAdd = bus.subscribe("AddItemRequested", (envelope) => {
    const decision = decideAdd(foldCart(store.read()), envelope.event);
    bus.publish(decision);
  });
  const stopRemove = bus.subscribe("RemoveItemRequested", (envelope) => {
    const decision = decideRemove(foldCart(store.read()), envelope.event);
    bus.publish(decision);
  });
  return () => {
    stopAdd();
    stopRemove();
  };
}
