import type { CartWriteStore } from "../write-model/cart-write-store";
import { emptyShoppingCart, type ShoppingCart } from "../write-model/shopping-cart";

export class InMemoryCartWriteStore implements CartWriteStore {
  private readonly carts = new Map<string, ShoppingCart>();

  load(cartId: string): ShoppingCart {
    const stored = this.carts.get(cartId);
    if (stored === undefined) {
      return emptyShoppingCart(cartId);
    }
    return copyCart(stored);
  }

  save(cart: ShoppingCart): void {
    this.carts.set(cart.cartId, copyCart(cart));
  }
}

function copyCart(cart: ShoppingCart): ShoppingCart {
  return {
    cartId: cart.cartId,
    lines: cart.lines.map((line) => ({
      itemId: line.itemId,
      name: line.name,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
    })),
  };
}
