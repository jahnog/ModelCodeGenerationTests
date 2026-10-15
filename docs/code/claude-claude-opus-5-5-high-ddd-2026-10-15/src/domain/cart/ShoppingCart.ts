import { DomainError } from "../shared/DomainError";
import type { CartEvent } from "./CartEvents";
import { CartId } from "./CartId";
import { CartItem } from "./CartItem";
import { Money } from "./Money";
import { ProductId } from "./ProductId";
import { ProductName } from "./ProductName";
import { Quantity } from "./Quantity";

/** Plain data used to persist and restore a cart. */
export interface ShoppingCartSnapshot {
  readonly id: string;
  readonly currency: string;
  readonly items: ReadonlyArray<{
    readonly productId: string;
    readonly name: string;
    readonly unitPriceCents: number;
    readonly quantity: number;
  }>;
}

/**
 * Aggregate root. All changes to the items of a cart go through it, so it can
 * enforce the cart's rules:
 * - every item uses the cart's currency;
 * - a product appears at most once, adding it again increases its quantity;
 * - a product keeps the price it had when it was first added;
 * - only a product that is in the cart can be removed.
 */
export class ShoppingCart {
  static readonly MAX_DISTINCT_ITEMS = 50;

  readonly id: CartId;
  readonly currency: string;
  private readonly items: Map<string, CartItem>;
  private pendingEvents: CartEvent[] = [];

  private constructor(id: CartId, currency: string, items: Map<string, CartItem>) {
    this.id = id;
    this.currency = currency;
    this.items = items;
  }

  static create(id: CartId, currency: string): ShoppingCart {
    // Validate the currency through the Money value object.
    Money.zero(currency);
    return new ShoppingCart(id, currency, new Map());
  }

  static restore(snapshot: ShoppingCartSnapshot): ShoppingCart {
    const items = new Map<string, CartItem>();
    for (const item of snapshot.items) {
      const cartItem = new CartItem(
        ProductId.of(item.productId),
        ProductName.of(item.name),
        Money.ofCents(item.unitPriceCents, snapshot.currency),
        Quantity.of(item.quantity),
      );
      items.set(cartItem.productId.value, cartItem);
    }
    return new ShoppingCart(CartId.of(snapshot.id), snapshot.currency, items);
  }

  addItem(productId: ProductId, name: ProductName, unitPrice: Money, quantity: Quantity): void {
    if (unitPrice.currency !== this.currency) {
      throw new DomainError(
        `Cart uses ${this.currency}, but "${name.value}" is priced in ${unitPrice.currency}.`,
      );
    }

    const existing = this.items.get(productId.value);
    let item: CartItem;
    if (existing) {
      if (!existing.unitPrice.equals(unitPrice)) {
        throw new DomainError(
          `"${existing.name.value}" is already in the cart at ${existing.unitPrice.toString()}, ` +
            `not ${unitPrice.toString()}.`,
        );
      }
      existing.increaseBy(quantity);
      item = existing;
    } else {
      if (this.items.size >= ShoppingCart.MAX_DISTINCT_ITEMS) {
        throw new DomainError(
          `A cart can hold at most ${ShoppingCart.MAX_DISTINCT_ITEMS} different products.`,
        );
      }
      item = new CartItem(productId, name, unitPrice, quantity);
      this.items.set(productId.value, item);
    }

    this.pendingEvents.push({
      type: "ItemAddedToCart",
      occurredAt: new Date(),
      cartId: this.id.value,
      productId: productId.value,
      quantityAdded: quantity.value,
      newQuantity: item.quantity.value,
    });
  }

  removeItem(productId: ProductId): void {
    if (!this.items.delete(productId.value)) {
      throw new DomainError(`Product "${productId.value}" is not in the cart.`);
    }

    this.pendingEvents.push({
      type: "ItemRemovedFromCart",
      occurredAt: new Date(),
      cartId: this.id.value,
      productId: productId.value,
    });
  }

  listItems(): readonly CartItem[] {
    return [...this.items.values()];
  }

  get isEmpty(): boolean {
    return this.items.size === 0;
  }

  get totalQuantity(): number {
    let total = 0;
    for (const item of this.items.values()) {
      total += item.quantity.value;
    }
    return total;
  }

  get total(): Money {
    let total = Money.zero(this.currency);
    for (const item of this.items.values()) {
      total = total.add(item.subtotal);
    }
    return total;
  }

  /** Returns the events recorded since the last call and clears them. */
  pullEvents(): CartEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }

  toSnapshot(): ShoppingCartSnapshot {
    return {
      id: this.id.value,
      currency: this.currency,
      items: this.listItems().map((item) => ({
        productId: item.productId.value,
        name: item.name.value,
        unitPriceCents: item.unitPrice.cents,
        quantity: item.quantity.value,
      })),
    };
  }
}
