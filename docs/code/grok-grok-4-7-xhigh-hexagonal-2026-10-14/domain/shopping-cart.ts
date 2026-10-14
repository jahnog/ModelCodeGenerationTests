import { CartError } from "./cart-error";
import { copyCartItem, createCartItem, type CartItem } from "./cart-item";

export class ShoppingCart {
  readonly #items: CartItem[] = [];

  private constructor() {}

  static empty(): ShoppingCart {
    return new ShoppingCart();
  }

  static fromItems(items: readonly CartItem[]): ShoppingCart {
    const cart = ShoppingCart.empty();
    for (const item of items) {
      cart.addItem(item);
    }
    return cart;
  }

  addItem(item: CartItem): void {
    const incoming = createCartItem(
      item.id,
      item.name,
      item.unitPriceCents,
      item.quantity,
    );
    const index = this.#items.findIndex((entry) => entry.id === incoming.id);
    if (index < 0) {
      this.#items.push(incoming);
      return;
    }
    const current = this.#items[index];
    if (current === undefined) {
      this.#items.push(incoming);
      return;
    }
    if (current.name !== incoming.name || current.unitPriceCents !== incoming.unitPriceCents) {
      throw new CartError(
        "item-conflict",
        `Item "${incoming.id}" is already in the cart with a different name or price.`,
      );
    }
    const quantity = current.quantity + incoming.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new CartError("unsafe-total", "Quantity is outside the safe integer range.");
    }
    this.#items[index] = createCartItem(
      current.id,
      current.name,
      current.unitPriceCents,
      quantity,
    );
  }

  removeItem(id: string): CartItem {
    const key = id.trim();
    if (key.length === 0) {
      throw new CartError("empty-id", "Item id must not be empty.");
    }
    const index = this.#items.findIndex((entry) => entry.id === key);
    if (index < 0) {
      throw new CartError("item-not-found", `Item "${key}" is not in the cart.`);
    }
    const removed = this.#items[index];
    if (removed === undefined) {
      throw new CartError("item-not-found", `Item "${key}" is not in the cart.`);
    }
    this.#items.splice(index, 1);
    return copyCartItem(removed);
  }

  items(): readonly CartItem[] {
    return this.#items.map((item) => copyCartItem(item));
  }
}
