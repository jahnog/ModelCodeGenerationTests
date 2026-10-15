import { CartItem } from "./CartItem";
import { InvalidCartItemError, ItemNotInCartError } from "./errors";

/** Aggregate root: the only way to change the items of a cart. */
export class ShoppingCart {
  readonly id: string;
  private readonly lines = new Map<string, CartItem>();

  constructor(id: string, items: readonly CartItem[] = []) {
    this.id = id;
    for (const item of items) this.addItem(item);
  }

  get items(): readonly CartItem[] {
    return [...this.lines.values()];
  }

  get totalCents(): number {
    return this.items.reduce((sum, item) => sum + item.subtotalCents, 0);
  }

  get isEmpty(): boolean {
    return this.lines.size === 0;
  }

  /** Adding a product already in the cart increases its quantity. */
  addItem(item: CartItem): void {
    const existing = this.lines.get(item.productId);
    if (existing === undefined) {
      this.lines.set(item.productId, item);
      return;
    }
    if (existing.unitPriceCents !== item.unitPriceCents || existing.name !== item.name) {
      throw new InvalidCartItemError(
        `Item "${item.productId}" is already in the cart with a different name or price.`,
      );
    }
    this.lines.set(item.productId, existing.withAddedQuantity(item.quantity));
  }

  removeItem(productId: string): CartItem {
    const existing = this.lines.get(productId);
    if (existing === undefined) throw new ItemNotInCartError(productId);
    this.lines.delete(productId);
    return existing;
  }
}
