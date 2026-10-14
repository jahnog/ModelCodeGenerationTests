import type { EventBus } from "../bus/event-bus";
import type { CartProjection } from "./cart-projection";

export function subscribeShowCart(bus: EventBus, projection: CartProjection): () => void {
  return bus.subscribe("ShowCartRequested", () => {
    bus.publish({ type: "CartShown", cart: projection.current() });
  });
}
