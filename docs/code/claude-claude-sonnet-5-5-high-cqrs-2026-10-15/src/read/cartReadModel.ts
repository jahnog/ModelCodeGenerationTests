import type { CartEvent, CartId, ProductId } from "../domain/events";
import type { CartItemView, CartView } from "./cartView";

/**
 * Read-side store. A projection keeps it up to date from events; queries
 * only read from it.
 */
export class CartReadModel {
  private readonly carts = new Map<CartId, Map<ProductId, CartItemView>>();

  project(event: CartEvent): void {
    const items = this.carts.get(event.cartId) ?? new Map<ProductId, CartItemView>();
    switch (event.type) {
      case "ItemAdded": {
        const quantity = (items.get(event.productId)?.quantity ?? 0) + event.quantity;
        items.set(event.productId, {
          productId: event.productId,
          name: event.name,
          unitPriceCents: event.unitPriceCents,
          quantity,
          lineTotalCents: quantity * event.unitPriceCents,
        });
        break;
      }
      case "ItemRemoved":
        items.delete(event.productId);
        break;
    }
    this.carts.set(event.cartId, items);
  }

  getCart(cartId: CartId): CartView {
    const items = [...(this.carts.get(cartId)?.values() ?? [])];
    return {
      cartId,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalCents: items.reduce((sum, item) => sum + item.lineTotalCents, 0),
    };
  }
}
