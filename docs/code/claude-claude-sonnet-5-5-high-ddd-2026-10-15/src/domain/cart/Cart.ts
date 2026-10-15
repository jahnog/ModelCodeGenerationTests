import { DomainError } from "../shared/DomainError";
import { Money } from "../shared/Money";
import { CartId } from "./CartId";
import { CartItem } from "./CartItem";
import { ProductId } from "./ProductId";

export class ItemNotInCartError extends DomainError {
  constructor(productId: ProductId) {
    super(`Product ${productId.value} is not in the cart`);
  }
}

export class CurrencyMismatchError extends DomainError {}

/** Aggregate root: all changes to cart items go through this class. */
export class Cart {
  private readonly items = new Map<string, CartItem>();

  private constructor(readonly id: CartId) {}

  static create(id: CartId): Cart {
    return new Cart(id);
  }

  /** Adds an item; adding a product already in the cart increases its quantity. */
  addItem(item: CartItem): void {
    const first = this.items.values().next();
    if (!first.done && first.value.unitPrice.currency !== item.unitPrice.currency) {
      throw new CurrencyMismatchError("All items in a cart must share the same currency");
    }
    const key = item.productId.value;
    const existing = this.items.get(key);
    this.items.set(key, existing ? existing.withAddedQuantity(item.quantity) : item);
  }

  removeItem(productId: ProductId): void {
    if (!this.items.delete(productId.value)) {
      throw new ItemNotInCartError(productId);
    }
  }

  get listItems(): readonly CartItem[] {
    return [...this.items.values()];
  }

  get isEmpty(): boolean {
    return this.items.size === 0;
  }

  get total(): Money {
    let sum: Money | undefined;
    for (const item of this.items.values()) {
      sum = sum ? sum.add(item.total) : item.total;
    }
    return sum ?? Money.zero();
  }
}
