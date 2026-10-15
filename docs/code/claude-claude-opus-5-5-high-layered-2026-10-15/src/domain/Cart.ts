import { CartItem } from "./CartItem";
import { InvalidItemError, ItemNotFoundError } from "./errors";

/** Aggregate root: owns the cart's items and enforces its rules. */
export class Cart {
  private readonly items = new Map<string, CartItem>();

  constructor(items: readonly CartItem[] = []) {
    for (const item of items) this.add(item);
  }

  /** Adds an item; adding an id already in the cart increases its quantity. */
  add(item: CartItem): CartItem {
    const existing = this.items.get(item.id);
    if (existing === undefined) {
      this.items.set(item.id, item);
      return item;
    }
    if (existing.name !== item.name || existing.unitPriceCents !== item.unitPriceCents) {
      throw new InvalidItemError(
        `Item "${item.id}" is already in the cart with a different name or price.`,
      );
    }
    const merged = existing.withQuantity(existing.quantity + item.quantity);
    this.items.set(item.id, merged);
    return merged;
  }

  remove(itemId: string): CartItem {
    const existing = this.items.get(itemId);
    if (existing === undefined) throw new ItemNotFoundError(itemId);
    this.items.delete(itemId);
    return existing;
  }

  getItems(): readonly CartItem[] {
    return [...this.items.values()];
  }

  get totalCents(): number {
    let total = 0;
    for (const item of this.items.values()) total += item.subtotalCents;
    return total;
  }

  get isEmpty(): boolean {
    return this.items.size === 0;
  }
}
