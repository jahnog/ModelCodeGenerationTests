import type { CartItem } from "./CartItem";

export class Cart {
  private readonly itemsById = new Map<string, CartItem>();

  /** Adds an item. If the id is already in the cart, the quantities are summed. */
  add(item: CartItem): void {
    if (!Number.isInteger(item.priceCents) || item.priceCents < 0) {
      throw new RangeError(`Invalid price for "${item.name}": ${item.priceCents}`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new RangeError(`Invalid quantity for "${item.name}": ${item.quantity}`);
    }
    const existing = this.itemsById.get(item.id);
    this.itemsById.set(
      item.id,
      existing ? { ...existing, quantity: existing.quantity + item.quantity } : item,
    );
  }

  /** Removes the item with the given id. Returns false if it was not in the cart. */
  remove(id: string): boolean {
    return this.itemsById.delete(id);
  }

  items(): readonly CartItem[] {
    return [...this.itemsById.values()];
  }

  totalCents(): number {
    let total = 0;
    for (const item of this.itemsById.values()) {
      total += item.priceCents * item.quantity;
    }
    return total;
  }
}
