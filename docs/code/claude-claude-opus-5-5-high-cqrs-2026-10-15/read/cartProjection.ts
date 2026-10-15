import type { CartEvent } from "../domain/events";
import type { CartItemView, CartView } from "./cartView";

// Builds and stores the read model from the events the write side publishes.
export class CartProjection {
  private readonly views = new Map<string, CartView>();

  find(cartId: string): CartView | undefined {
    return this.views.get(cartId);
  }

  readonly handle = (event: CartEvent): void => {
    const items = this.views.get(event.cartId)?.items ?? [];
    switch (event.type) {
      case "ItemAdded": {
        const existing = items.find((item) => item.productId === event.productId);
        const quantity = (existing?.quantity ?? 0) + event.quantity;
        const updated: CartItemView = {
          productId: event.productId,
          name: event.name,
          unitPriceCents: event.unitPriceCents,
          quantity,
          lineTotalCents: quantity * event.unitPriceCents,
        };
        const next = existing === undefined
          ? [...items, updated]
          : items.map((item) => (item.productId === event.productId ? updated : item));
        this.store(event.cartId, next);
        break;
      }
      case "ItemRemoved":
        this.store(event.cartId, items.filter((item) => item.productId !== event.productId));
        break;
    }
  };

  private store(cartId: string, items: readonly CartItemView[]): void {
    this.views.set(cartId, {
      cartId,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    });
  }
}
