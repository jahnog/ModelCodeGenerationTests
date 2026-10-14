import type { CartEvent } from "../write-model/cart-event";
import type { CartReadStore } from "./cart-read-store";
import { projectCartEvent } from "./project-cart-event";

export class CartProjector {
  private readonly carts: CartReadStore;

  constructor(carts: CartReadStore) {
    this.carts = carts;
  }

  project(events: readonly CartEvent[]): void {
    for (const event of events) {
      const current = this.carts.find(event.cartId);
      this.carts.save(projectCartEvent(current, event));
    }
  }
}
