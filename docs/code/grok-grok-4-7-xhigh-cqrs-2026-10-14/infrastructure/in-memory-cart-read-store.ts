import type { CartReadStore } from "../read-model/cart-read-store";
import { emptyShownCart, type ShownCart, type ShownCartItem } from "../read-model/shown-cart";

export class InMemoryCartReadStore implements CartReadStore {
  private readonly carts = new Map<string, ShownCart>();

  find(cartId: string): ShownCart {
    const stored = this.carts.get(cartId);
    if (stored === undefined) {
      return emptyShownCart(cartId);
    }
    return copyCart(stored);
  }

  save(cart: ShownCart): void {
    this.carts.set(cart.cartId, copyCart(cart));
  }
}

function copyCart(cart: ShownCart): ShownCart {
  return {
    cartId: cart.cartId,
    totalCents: cart.totalCents,
    items: cart.items.map(copyItem),
  };
}

function copyItem(item: ShownCartItem): ShownCartItem {
  return {
    itemId: item.itemId,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.lineTotalCents,
  };
}
