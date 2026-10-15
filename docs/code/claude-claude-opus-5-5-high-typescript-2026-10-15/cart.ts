import { addCents, multiplyCents, toCents, type Cents } from "./money";
import type { CartItem, Product, RemoveResult } from "./types";

function assertPositiveQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new RangeError(`Quantity must be a positive whole number, got ${quantity}.`);
  }
}

export class ShoppingCart {
  // A Map keeps insertion order, so items are listed in the order they were first added.
  readonly #items = new Map<string, CartItem>();

  /** Adds `quantity` units of `product`. Adding a product already in the cart increases its quantity. */
  addItem(product: Product, quantity = 1): CartItem {
    assertPositiveQuantity(quantity);

    const existing = this.#items.get(product.id);
    const item: CartItem = {
      product,
      quantity: (existing?.quantity ?? 0) + quantity,
    };
    this.#items.set(product.id, item);
    return item;
  }

  /**
   * Removes `quantity` units of a product. Without `quantity`, or when it covers
   * every unit in the cart, the product is removed entirely.
   */
  removeItem(productId: string, quantity?: number): RemoveResult {
    if (quantity !== undefined) {
      assertPositiveQuantity(quantity);
    }

    const existing = this.#items.get(productId);
    if (existing === undefined) {
      return { kind: "not-found", productId };
    }

    if (quantity === undefined || quantity >= existing.quantity) {
      this.#items.delete(productId);
      return { kind: "removed", item: existing };
    }

    const remaining = existing.quantity - quantity;
    const item: CartItem = { product: existing.product, quantity: remaining };
    this.#items.set(productId, item);
    return { kind: "decreased", item, remaining };
  }

  /** Returns a snapshot of the cart's items; changing the array does not change the cart. */
  getItems(): readonly CartItem[] {
    return [...this.#items.values()];
  }

  get isEmpty(): boolean {
    return this.#items.size === 0;
  }

  get totalQuantity(): number {
    let total = 0;
    for (const item of this.#items.values()) {
      total += item.quantity;
    }
    return total;
  }

  get totalPrice(): Cents {
    let total = toCents(0);
    for (const item of this.#items.values()) {
      total = addCents(total, lineTotal(item));
    }
    return total;
  }
}

export function lineTotal(item: CartItem): Cents {
  return multiplyCents(item.product.unitPrice, item.quantity);
}
