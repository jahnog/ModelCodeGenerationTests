import { CartItem } from "./CartItem";
import { InvalidCartError, ItemNotInCartError } from "./errors";
import { Money } from "./Money";

/** Aggregate root. All changes to the items of a cart go through this class. */
export class Cart {
  readonly id: string;
  private readonly itemsByProductId: Map<string, CartItem>;

  private constructor(id: string, items: readonly CartItem[]) {
    if (id.trim() === "") {
      throw new InvalidCartError("Cart id must not be empty.");
    }
    this.id = id;
    this.itemsByProductId = new Map(items.map((item) => [item.productId, item]));
  }

  static empty(id: string): Cart {
    return new Cart(id, []);
  }

  /** Rebuilds a cart from stored items, for use by repositories. */
  static restore(id: string, items: readonly CartItem[]): Cart {
    return new Cart(id, items);
  }

  /** Adds the item; if the product is already in the cart, its quantity grows instead. */
  addItem(item: CartItem): void {
    const existing = this.itemsByProductId.get(item.productId);
    this.itemsByProductId.set(
      item.productId,
      existing === undefined ? item : existing.withAddedQuantity(item.quantity),
    );
  }

  removeItem(productId: string): CartItem {
    const key = productId.trim();
    const existing = this.itemsByProductId.get(key);
    if (existing === undefined) {
      throw new ItemNotInCartError(key);
    }
    this.itemsByProductId.delete(key);
    return existing;
  }

  items(): readonly CartItem[] {
    return [...this.itemsByProductId.values()];
  }

  totalQuantity(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }

  total(): Money {
    return this.items().reduce((sum, item) => sum.add(item.subtotal()), Money.ZERO);
  }
}
