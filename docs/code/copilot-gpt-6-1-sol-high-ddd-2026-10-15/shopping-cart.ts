import { CartItem } from "./cart-item";

/** Aggregate root: all changes to cart contents go through this class. */
export class ShoppingCart {
  readonly id: string;
  private readonly itemsByProductId = new Map<string, CartItem>();

  constructor(id: string, items: readonly CartItem[] = []) {
    if (id.trim().length === 0) {
      throw new Error("Cart ID must not be empty.");
    }

    this.id = id;
    for (const item of items) {
      this.addItem(item);
    }
  }

  get items(): readonly CartItem[] {
    return [...this.itemsByProductId.values()];
  }

  addItem(item: CartItem): void {
    const existing = this.itemsByProductId.get(item.productId);
    if (existing !== undefined && existing.name !== item.name) {
      throw new Error(`Product "${item.productId}" already has a different name.`);
    }

    const updated = new CartItem(
      item.productId,
      item.name,
      (existing?.quantity ?? 0) + item.quantity,
    );
    this.itemsByProductId.set(updated.productId, updated);
  }

  /** Removes the entire line, regardless of its quantity. */
  removeItem(productId: string): void {
    if (!this.itemsByProductId.delete(productId)) {
      throw new Error(`Product "${productId}" is not in cart "${this.id}".`);
    }
  }
}
