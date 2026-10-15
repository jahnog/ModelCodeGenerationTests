import { ConflictingCartItemError, ItemNotInCartError } from "../errors/DomainError";
import { Money } from "../value-objects/Money";
import { CartItem } from "./CartItem";

/** Aggregate root that owns the cart's items and enforces the rules for changing them. */
export class Cart {
  private readonly itemsById = new Map<string, CartItem>();

  constructor(readonly id: string) {}

  /** Adds the item, or increases the quantity when the same product is already in the cart. */
  addItem(item: CartItem): CartItem {
    const existing = this.itemsById.get(item.id);
    if (existing === undefined) {
      this.itemsById.set(item.id, item);
      return item;
    }
    if (!existing.isSameProductAs(item)) {
      throw new ConflictingCartItemError(item.id);
    }
    const merged = existing.withAddedQuantity(item.quantity);
    this.itemsById.set(item.id, merged);
    return merged;
  }

  removeItem(itemId: string): CartItem {
    const existing = this.itemsById.get(itemId);
    if (existing === undefined) {
      throw new ItemNotInCartError(itemId);
    }
    this.itemsById.delete(itemId);
    return existing;
  }

  items(): readonly CartItem[] {
    return [...this.itemsById.values()];
  }

  totalQuantity(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }

  total(): Money {
    return this.items().reduce((sum, item) => sum.add(item.subtotal()), Money.ZERO);
  }
}
