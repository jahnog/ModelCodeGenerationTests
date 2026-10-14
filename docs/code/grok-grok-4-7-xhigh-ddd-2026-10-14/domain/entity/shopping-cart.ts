import { CartItem } from "./cart-item";
import { DomainError } from "../error/domain-error";
import { type DomainEvent } from "../event/domain-event";
import { type CartId } from "../value/cart-id";
import { type Money } from "../value/money";
import { type ProductId } from "../value/product-id";
import { type ProductName } from "../value/product-name";
import { type Quantity } from "../value/quantity";

export class ShoppingCart {
  readonly #items: CartItem[] = [];
  #events: DomainEvent[] = [];

  private constructor(readonly id: CartId) {}

  static open(id: CartId): ShoppingCart {
    return new ShoppingCart(id);
  }

  static restore(id: CartId, items: readonly CartItem[]): ShoppingCart {
    const cart = new ShoppingCart(id);
    for (const item of items) {
      cart.#restoreItem(item);
    }
    return cart;
  }

  sameIdentityAs(other: ShoppingCart): boolean {
    return this.id.equals(other.id);
  }

  addItem(
    productId: ProductId,
    productName: ProductName,
    unitPrice: Money,
    quantity: Quantity,
  ): void {
    this.#assertSingleCurrency(unitPrice);
    const index = this.#items.findIndex((item) => item.isFor(productId));
    if (index < 0) {
      const created = CartItem.create(productId, productName, unitPrice, quantity);
      this.#items.push(created);
      this.#events.push({
        kind: "item-added-to-cart",
        cartId: this.id.value,
        productId: productId.value,
        productName: productName.value,
        unitPriceMinor: unitPrice.amountMinor,
        currency: unitPrice.currency,
        quantity: quantity.value,
      });
      return;
    }
    const current = this.#items[index];
    if (current === undefined) {
      throw new DomainError(
        "item-not-found",
        `Product "${productId.value}" is not in the cart.`,
      );
    }
    if (
      !current.productName.equals(productName) ||
      !current.unitPrice.equals(unitPrice)
    ) {
      throw new DomainError(
        "product-conflict",
        `Product "${productId.value}" is already in the cart with a different name or price.`,
      );
    }
    const updated = current.withAddedQuantity(quantity);
    this.#items[index] = updated;
    this.#events.push({
      kind: "item-quantity-increased",
      cartId: this.id.value,
      productId: productId.value,
      quantityAdded: quantity.value,
      quantityTotal: updated.quantity.value,
    });
  }

  removeItem(productId: ProductId): void {
    const index = this.#items.findIndex((item) => item.isFor(productId));
    if (index < 0) {
      throw new DomainError(
        "item-not-found",
        `Product "${productId.value}" is not in the cart.`,
      );
    }
    const removed = this.#items[index];
    if (removed === undefined) {
      throw new DomainError(
        "item-not-found",
        `Product "${productId.value}" is not in the cart.`,
      );
    }
    this.#items.splice(index, 1);
    this.#events.push({
      kind: "item-removed-from-cart",
      cartId: this.id.value,
      productId: removed.productId.value,
      quantity: removed.quantity.value,
    });
  }

  items(): readonly CartItem[] {
    return [...this.#items];
  }

  total(): Money | undefined {
    const first = this.#items[0];
    if (first === undefined) {
      return undefined;
    }
    let total = first.lineTotal();
    for (const item of this.#items.slice(1)) {
      total = total.plus(item.lineTotal());
    }
    return total;
  }

  unitTotal(): number {
    let total = 0;
    for (const item of this.#items) {
      total += item.quantity.value;
      if (!Number.isSafeInteger(total)) {
        throw new DomainError("quantity-overflow", "The cart holds too many units.");
      }
    }
    return total;
  }

  pullDomainEvents(): readonly DomainEvent[] {
    const committed = [...this.#events];
    this.#events = [];
    return committed;
  }

  #restoreItem(item: CartItem): void {
    if (this.#items.some((current) => current.sameIdentityAs(item))) {
      throw new DomainError(
        "product-conflict",
        `Product "${item.productId.value}" is already in the cart.`,
      );
    }
    this.#assertSingleCurrency(item.unitPrice);
    this.#items.push(item);
  }

  #assertSingleCurrency(unitPrice: Money): void {
    const first = this.#items[0];
    if (first === undefined) {
      return;
    }
    if (!first.unitPrice.hasSameCurrency(unitPrice)) {
      throw new DomainError(
        "currency-mismatch",
        `This shopping cart uses ${first.unitPrice.currency}.`,
      );
    }
  }
}
